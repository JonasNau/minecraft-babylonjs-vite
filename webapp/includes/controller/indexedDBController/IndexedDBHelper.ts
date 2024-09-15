import * as io_ts from "io-ts";
import { isLeft } from "fp-ts/Either";
import NotSupportedError from "../../errors/NotSupportedError";
import DatabaseAlreadyExistsError from "../../errors/controller/indexedDBHelper/DatabaseAlreadyExistsError";
import DatabaseAlreadyExistsWithDifferentVersionError from "../../errors/controller/indexedDBHelper/DatabaseAlreadyExistsWithDifferentVersionError";
import DatabaseCoudNotBeDeletedError from "../../errors/controller/indexedDBHelper/DatabaseCoudNotBeDeletedError";
import DatabaseDoesNotExistError from "../../errors/controller/indexedDBHelper/DatabaseDoesNotExist";
import IndexedDBOpenBlockedError from "../../errors/controller/indexedDBHelper/IndexedDBOpenBlockedError";
import IndexedDBOpenError from "../../errors/controller/indexedDBHelper/IndexedDBOpenError";
import { threadId } from "worker_threads";
import { Condition, ConditionWaiter } from "../../ConditionWaiter";
import { parseJSON, removeFromArray } from "j-object-functions";
import { isArray } from "lodash";
import { validate } from "../../helperFunctions/io-ts-functions";

const TypeIDBDatabaseInfo = io_ts.type({
	name: io_ts.string,
	version: io_ts.number,
});

const TypeIDBDatabaseInfoArray = io_ts.array(TypeIDBDatabaseInfo);

export enum IndexedDBAccessMode {
	READ = "readonly",
	READ_WRITE = "readwrite",
}

export class IndexedDBHelper {
	static readonly LOCAL_STORAGE_DBS_KEY = "IndexedDBDatabases";
	indexedDB: IDBFactory;
	constructor() {
		this.indexedDB = this.getIndexedDBFactoryFromBrowser();
	}

	async init() {
		await this.cleanUsedDBsList();
	}

	public getIndexedDB(): IDBFactory {
		return this.indexedDB;
	}

	private getIndexedDBFactoryFromBrowser(): IDBFactory {
		let indededDBFactory =
			window.indexedDB ||
			window.webkitIndexedDB ||
			window.mozIndexedDB ||
			window.msIndexedDB;
		if (!indededDBFactory) {
			throw new NotSupportedError(
				"indexedDB is not supported in your browser."
			);
		}
		return indededDBFactory;
	}

	public async databaseExists(
		databaseName: string,
		version?: number
	): Promise<boolean> {
		if (typeof this.indexedDB.databases === "function") {
			const databases = await this.indexedDB.databases();
			if (!databases || !databases.length) return false;
			let databaseExists = databases.some((databaseInfo) => {
				if (databaseInfo.name === databaseName) {
					if (version !== undefined) {
						//Check for the same version
						return databaseInfo.version === version;
					}
					return true;
				}
				return false;
			});
			return databaseExists;
		}

		//If the function databases() does not exist on indexedDB
		return new Promise((resolve, reject) => {
			let db = this.indexedDB.open(databaseName);

			let isUpgrading = false;
			let condition = new Condition({ name: "deleteDBDONE" });
			condition.setIsTrue(false);

			db.onupgradeneeded = async (event) => {
				isUpgrading = true;
				const db = (event.target as IDBOpenDBRequest).result;
				if (event.oldVersion === 0) {
					//Delete database if it was just created
					await this.deleteDatabase(databaseName);
					resolve(false);
				}
				condition.setIsTrue(true);
			};

			db.onsuccess = async (event) => {
				if (isUpgrading) {
					await new ConditionWaiter(
						condition
					).waitForConditionToBecomeTrueOrFalse(true);
				}
				const db = (event.target as IDBOpenDBRequest).result;
				if (version !== undefined && db.version !== version) {
					resolve(false);
					return;
				}
				resolve(true);
			};

			db.onblocked = (event) => {
				reject(
					new IndexedDBOpenBlockedError(undefined, [
						(event.target as IDBOpenDBRequest).error,
					])
				);
			};

			db.onerror = (event) => {
				reject(
					new IndexedDBOpenError(undefined, [
						(event.target as IDBOpenDBRequest).error,
					])
				);
			};
		});
	}

	public async getVersionOfDB(name: string): Promise<number | null> {
		if (typeof this.indexedDB.databases === "function") {
			let databases = await this.indexedDB.databases();
			let database = databases.find((currentDatabase) => {
				return currentDatabase.name === name;
			});
			if (!database) return null;
			return database.version ?? null;
		}

		//If the function databases() does not exist on indexedDB
		return new Promise((resolve, reject) => {
			let db = this.indexedDB.open(name);

			let isUpgrading = false;
			let condition = new Condition({ name: "deleteDBDONE" });
			condition.setIsTrue(false);

			db.onupgradeneeded = async (event) => {
				isUpgrading = true;
				//Delete database if it was just created
				await this.deleteDatabase(name);
				condition.setIsTrue(true);
				resolve(null);
				return;
			};

			db.onsuccess = async (event) => {
				if (isUpgrading) {
					await new ConditionWaiter(
						condition
					).waitForConditionToBecomeTrueOrFalse(true);
				}
				const db = (event.target as IDBOpenDBRequest).result;
				resolve(db.version);
				return;
			};

			db.onblocked = (event) => {
				reject(
					new IndexedDBOpenBlockedError(undefined, [
						(event.target as IDBOpenDBRequest).error,
					])
				);
			};

			db.onerror = (event) => {
				reject(
					new IndexedDBOpenError(undefined, [
						(event.target as IDBOpenDBRequest).error,
					])
				);
			};
		});
	}

	public async openDatabase(
		name: string,
		version: number
	): Promise<IDBDatabase> {
		return new Promise(async (resolve, reject) => {
			if (!(await this.databaseExists(name, version))) {
				reject(new DatabaseDoesNotExistError());
				return;
			}
			const db = this.indexedDB.open(name);

			db.onblocked = (event) => {
				reject(
					new IndexedDBOpenBlockedError(undefined, [
						(event.target as IDBOpenDBRequest).error,
					])
				);
			};

			db.onerror = (event) => {
				reject(
					new IndexedDBOpenError(undefined, [
						(event.target as IDBOpenDBRequest).error,
					])
				);
			};

			db.onsuccess = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;
				this.addOrUpdateDBToList({ name: db.name, version: db.version });
				resolve(db);
			};
		});
	}

	public async createAndOpenDatabase(
		name: string,
		version: number,
		onupgradeneeded: ((ev: IDBVersionChangeEvent) => any) | null
	): Promise<IDBDatabase> {
		if (await this.databaseExists(name)) {
			if ((await this.getVersionOfDB(name)) !== version) {
				throw new DatabaseAlreadyExistsWithDifferentVersionError(
					`The database ${name} does already exist in a different version (your specified version: ${version}; existing version: ${await this.getVersionOfDB(
						name
					)})`
				);
			}

			throw new DatabaseAlreadyExistsError();
		}

		return new Promise(async (resolve, reject) => {
			const db = this.indexedDB.open(name, version);

			let isUpgrading = false;
			let condition = new Condition({ name: "upgradeDONE" });
			condition.setIsTrue(false);

			db.onblocked = (event) => {
				reject(
					new IndexedDBOpenBlockedError(undefined, [
						(event.target as IDBOpenDBRequest).error,
					])
				);
			};

			db.onerror = (event) => {
				reject(
					new IndexedDBOpenError(undefined, [
						(event.target as IDBOpenDBRequest).error,
					])
				);
			};

			db.onsuccess = async (event) => {
				if (isUpgrading) {
					await new ConditionWaiter(
						condition
					).waitForConditionToBecomeTrueOrFalse(true);
				}
				const db = (event.target as IDBOpenDBRequest).result;
				this.addOrUpdateDBToList({ name: db.name, version: db.version });
				resolve(db);
			};

			db.onupgradeneeded = async (versionChangeEvent) => {
				isUpgrading = true;
				if (!onupgradeneeded) {
					condition.setIsTrue(true);
					return;
				}
				await onupgradeneeded(versionChangeEvent);
				condition.setIsTrue(true);
			};
		});
	}

	public async openOrCreateAndUpgradeDatabase(
		name: string,
		version: number,
		onupgradeneeded: ((ev: IDBVersionChangeEvent) => any) | null
	): Promise<IDBDatabase> {
		return new Promise(async (resolve, reject) => {
			const db = this.indexedDB.open(name, version);

			let isUpgrading = false;
			let condition = new Condition({ name: "upgradeDONE" });
			condition.setIsTrue(false);

			db.onblocked = (event) => {
				reject(
					new IndexedDBOpenBlockedError(undefined, [
						(event.target as IDBOpenDBRequest).error,
					])
				);
			};

			db.onerror = (event) => {
				reject(
					new IndexedDBOpenError(undefined, [
						(event.target as IDBOpenDBRequest).error,
					])
				);
			};

			db.onsuccess = async (event) => {
				if (isUpgrading) {
					await new ConditionWaiter(
						condition
					).waitForConditionToBecomeTrueOrFalse(true);
				}
				const db = (event.target as IDBOpenDBRequest).result;
				this.addOrUpdateDBToList({ name: db.name, version: db.version });
				resolve(db);
			};

			db.onupgradeneeded = async (event) => {
				isUpgrading = true;
				if (!onupgradeneeded) {
					condition.setIsTrue(true);
					return;
				}
				await onupgradeneeded(event);
				condition.setIsTrue(true);
			};
		});
	}

	public isIDatabaseInfoArray(array: unknown): array is IDBDatabaseInfo[] {
		return validate(array, TypeIDBDatabaseInfoArray);
	}

	public async getListOfAllAvailableDBs(): Promise<IDBDatabaseInfo[]> {
		return new Promise(async (resolve, reject) => {
			if (typeof this.indexedDB.databases === "function") {
				let dbs = await this.indexedDB.databases();
				resolve(dbs);
				return;
			}
			//databases() is not supported so use the list of used dbs
			return this.getListOfAllUsedDBs();
		});
	}

	public async getListOfAllUsedDBs(): Promise<IDBDatabaseInfo[]> {
		return new Promise(async (resolve, reject) => {
			let dbs = parseJSON(
				window.localStorage.getItem(IndexedDBHelper.LOCAL_STORAGE_DBS_KEY)
			);

			if (this.isIDatabaseInfoArray(dbs)) {
				return dbs;
			}
			resolve([] as IDBDatabaseInfo[]);
		});
	}

	public async addOrUpdateDBToList(databaseInfo: IDBDatabaseInfo) {
		if (!validate(databaseInfo, TypeIDBDatabaseInfo)) {
			throw new Error("The provided databaseInfo is of invalid format.");
		}

		let dbs = parseJSON(
			window.localStorage.getItem(IndexedDBHelper.LOCAL_STORAGE_DBS_KEY)
		);

		let dbInfoArray: IDBDatabaseInfo[] = [];

		if (this.isIDatabaseInfoArray(dbs)) {
			dbInfoArray = dbs;
		} else {
			dbInfoArray = [] satisfies IDBDatabaseInfo[];
		}

		let entry = dbInfoArray.find((db) => {
			return db.name === databaseInfo.name;
		});

		if (entry) {
			entry.version == databaseInfo.version;
			return;
		}

		dbInfoArray.push(databaseInfo);

		dbInfoArray.sort((a, b) => {
			if (!a.name || !b.name) return 0;
			return b.name.localeCompare(a.name);
		});

		window.localStorage.setItem(
			IndexedDBHelper.LOCAL_STORAGE_DBS_KEY,
			JSON.stringify(dbInfoArray)
		);
	}

	public async removeDBFromList(dbName: string) {
		let dbs = parseJSON(
			window.localStorage.getItem(IndexedDBHelper.LOCAL_STORAGE_DBS_KEY)
		);

		let dbInfoArray: IDBDatabaseInfo[] = [];

		if (this.isIDatabaseInfoArray(dbs)) {
			dbInfoArray = dbs;
		} else {
			dbInfoArray = [] satisfies IDBDatabaseInfo[];
		}

		let entry = dbInfoArray.find((db) => {
			return db.name === dbName;
		});

		if (entry) {
			dbInfoArray = removeFromArray(dbInfoArray, entry);
		}

		dbInfoArray.sort((a, b) => {
			if (!a.name || !b.name) return 0;
			return b.name.localeCompare(a.name);
		});

		window.localStorage.setItem(
			IndexedDBHelper.LOCAL_STORAGE_DBS_KEY,
			JSON.stringify(dbInfoArray)
		);
	}

	public async cleanUsedDBsList(): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			let usedDBs = await this.getListOfAllUsedDBs();

			if (!usedDBs.length) {
				resolve(true);
				return;
			}

			for (const usedDB of usedDBs) {
				if (!usedDB.name) {
					usedDBs = removeFromArray(usedDBs, usedDB);
					continue;
				}
				if (!(await this.databaseExists(usedDB.name))) {
					usedDBs = removeFromArray(usedDBs, usedDB);
					continue;
				}
			}

			window.localStorage.setItem(
				IndexedDBHelper.LOCAL_STORAGE_DBS_KEY,
				JSON.stringify(usedDBs)
			);
			resolve(true);
		});
	}

	public async deleteDatabase(dbName: string) {
		if (!(await this.databaseExists(dbName))) {
			throw new DatabaseDoesNotExistError(
				`There is no database ${dbName}, so you can not delete it.`
			);
		}
		return new Promise(async (resolve, reject) => {
			let version = await this.getVersionOfDB(dbName);
			if (!version) {
				reject(
					new DatabaseCoudNotBeDeletedError(
						"Could not open database and wait for every connection to disconnect"
					)
				);
				return;
			}

			let dbOpenRequest = this.indexedDB.deleteDatabase(dbName);
			this.removeDBFromList(dbName);
			resolve(true);
			// dbOpenRequest.onsuccess = (event) => {
			// 	resolve(true);
			// };

			// const fail = (event: Event) => {
			// 	reject(
			// 		new DatabaseCoudNotBeDeletedError(
			// 			`Deleting the database '${dbName}' failed.`
			// 		)
			// 	);
			// };

			// dbOpenRequest.onerror = (event) => {
			// 	console.log(event);
			// 	fail(event);
			// };

			// dbOpenRequest.onblocked = (event) => {
			// 	console.log(event);
			// 	fail(event);
			// };
		});
	}

	public async closeAllConections(db: IDBDatabase) {
		return new Promise((resolve, reject) => {
			db.close();
			db.onclose = (event) => {
				resolve(true);
			};
		});
	}

	public async getEntryFromDB(
		db: IDBDatabase,
		storeName: string,
		query: IDBValidKey | IDBKeyRange
	) {
		return new Promise((resolve, reject) => {
			let db_transaction = db.transaction(storeName, IndexedDBAccessMode.READ);
			let objectStore = db_transaction.objectStore(storeName);
			let dbRequest = objectStore.get(query);

			dbRequest.onerror = (event) => {
				reject(event);
			};

			dbRequest.onsuccess = (event) => {
				const result = (event.target as IDBRequest).result;
				resolve(result);
			};
		});
	}

	public async setEntryFromDB(
		db: IDBDatabase,
		storeName: string,
		key: IDBValidKey,
		newValue: any
	) {
		return new Promise<Event>((resolve, reject) => {
			let db_transaction = db.transaction(
				storeName,
				IndexedDBAccessMode.READ_WRITE
			);
			let objectStore = db_transaction.objectStore(storeName);

			let getRequest = objectStore.get(key);

			getRequest.onsuccess = (event) => {
				let existingValue = (event.target as IDBRequest).result;

				if (existingValue !== undefined) {
					// Update the existing value with the new value
					let updateRequest = objectStore.put(newValue, key);

					updateRequest.onsuccess = (event) => {
						resolve(event);
					};

					updateRequest.onerror = (event) => {
						reject(event);
					};
				} else {
					// No existing value found
					reject(new Error("Entry not found"));
				}
			};

			getRequest.onerror = (event) => {
				reject(event);
			};
		});
	}

	public async insertEntryInDB(
		db: IDBDatabase,
		storeName: string,
		key: IDBValidKey,
		value: any
	) {
		return new Promise<Event>((resolve, reject) => {
			let db_transaction = db.transaction(
				storeName,
				IndexedDBAccessMode.READ_WRITE
			);
			let objectStore = db_transaction.objectStore(storeName);

			let addRequest = objectStore.add(value, key);

			addRequest.onsuccess = (event) => {
				resolve(event);
			};

			addRequest.onerror = (event) => {
				reject(event);
			};
		});
	}

	public async valueExistsAtIndexInDB(
		db: IDBDatabase,
		storeName: string,
		indexName: string
	) {
		return new Promise((resolve, reject) => {
			let db_transaction = db.transaction(storeName, IndexedDBAccessMode.READ);
			let objectStore = db_transaction.objectStore(storeName);
			let index = objectStore.index(indexName);

			let countRequest = index.count();

			countRequest.onsuccess = (event) => {
				const count = (event.target as IDBRequest).result;
				resolve(count > 0); // Resolve with true if count is greater than 0, indicating value(s) exist
			};

			countRequest.onerror = (event) => {
				reject(event);
			};
		});
	}
}
