import { GAMEMODE } from "../GAMEMODE";
import NotImplementedError from "../errors/NotImplementedError";
import DatabaseDoesNotExistError from "../errors/controller/indexedDBHelper/DatabaseDoesNotExist";
import DatabaseNotOpenedError from "../errors/controller/indexedDBHelper/DatabaseNotOpenedError";
import { sortingFunctionStringsWithNumbers } from "j-object-functions";
import GlobalOptions from "../settings/GlobalOptions";
import { IndexedDBHelper } from "./indexedDBController/IndexedDBHelper";

export type WorldEntry = {
	name: string;
	internalName: string;
	lastSaveState: Date | null;
	gameMode: GAMEMODE;
	version: string;
};

export default class WorldController {
	indexedDBController: IndexedDBHelper;

	indexedDBDatabases: {
		worlds_list?: IDBDatabase;
	};

	constructor() {
		this.indexedDBController = new IndexedDBHelper();
		this.indexedDBDatabases = {};
	}

	getAllWorlds(): Promise<WorldEntry[]> {
		return new Promise(async (resolve, reject) => {
			let db_worlds = this.indexedDBDatabases.worlds_list;
			if (!db_worlds) {
				await this.openDatabase(WorldControllerDBs.WORLDS_LIST_DB);
				db_worlds = this.indexedDBDatabases.worlds_list;
			}
			if (!db_worlds) {
				throw new DatabaseNotOpenedError();
			}

			let indexedDBGlobalOptions = GlobalOptions.options.indexedDBDatabases;

			let transaction_db_worlds = db_worlds.transaction(
				indexedDBGlobalOptions.worlds.objectStoreNames.WORLDS_LIST,
				"readonly"
			);
			let objectStore_db_worlds_worlds_list = transaction_db_worlds.objectStore(
				indexedDBGlobalOptions.worlds.objectStoreNames.WORLDS_LIST
			);

			let request = objectStore_db_worlds_worlds_list.getAll();

			request.onerror = (event) => {
				reject(event);
			};

			request.onsuccess = (event) => {
				let result = request.result;
				result.sort((a: WorldEntry, b: WorldEntry) => {
					return sortingFunctionStringsWithNumbers(
						a.internalName,
						b.internalName
					);
				});
				resolve(result);
			};
		});
	}

	async getWorldEntry(internalName: string): Promise<WorldEntry | null> {
		return new Promise(async (resolve, reject) => {
			let db_worlds = this.indexedDBDatabases.worlds_list;
			if (!db_worlds) {
				await this.openDatabase(WorldControllerDBs.WORLDS_LIST_DB);
				db_worlds = this.indexedDBDatabases.worlds_list;
			}
			if (!db_worlds) {
				throw new DatabaseNotOpenedError();
			}

			let indexedDBGlobalOptions = GlobalOptions.options.indexedDBDatabases;

			let transaction_db_worlds = db_worlds.transaction(
				indexedDBGlobalOptions.worlds.objectStoreNames.WORLDS_LIST,
				"readonly"
			);
			let objectStore_db_worlds_worlds_list = transaction_db_worlds.objectStore(
				indexedDBGlobalOptions.worlds.objectStoreNames.WORLDS_LIST
			);

			let request = objectStore_db_worlds_worlds_list.get(internalName);

			request.onerror = (event) => {
				reject(event);
			};

			request.onsuccess = (event) => {
				let result = request.result;
				resolve(result);
			};
		});
	}

	async getFreeInternalWorldName() {
		let worlds = await this.getAllWorlds();
		if (!worlds || !worlds.length) return "World 1";

		let worldName = "World";
		let number = 1;
		while (await this.worldExists(`${worldName} ${number}`)) {
			number++;
		}
		return `${worldName} ${number}`;
	}

	async worldExists(internalName: string) {
		let worlds = await this.getAllWorlds();
		if (!worlds || !worlds.length) return false;

		return worlds.some((world) => world.internalName === internalName);
	}

	async openDatabase(db: WorldControllerDBs) {
		let indexedDBGlobalOptions = GlobalOptions.options.indexedDBDatabases;

		if (db === WorldControllerDBs.WORLDS_LIST_DB) {
			let db_worlds: IDBDatabase | null = null;

			const create_worlds_list = async () => {
				return await this.indexedDBController.createAndOpenDatabase(
					GlobalOptions.options.indexedDBDatabases.worlds.NAME,
					GlobalOptions.options.indexedDBDatabases.worlds.CURRENT_VERSION,
					(versionChangeEvent: IDBVersionChangeEvent) => {
						return new Promise(async (resolve, reject) => {
							let db = (versionChangeEvent.target as IDBOpenDBRequest).result;

							let object_store_worlds_list = db.createObjectStore(
								indexedDBGlobalOptions.worlds.objectStoreNames.WORLDS_LIST,
								{ autoIncrement: false, keyPath: "internalName" }
							);

							// worldNumber: starting from 1 to the amount of worlds saved in the browser
							object_store_worlds_list.createIndex(
								"internalName",
								["internalName"],
								{ unique: true }
							);
							object_store_worlds_list.createIndex("name", ["name"], {
								unique: false,
							});
							// version: the version the world is build for
							object_store_worlds_list.createIndex("version", ["version"], {
								unique: false,
							});
							object_store_worlds_list.createIndex("gamemode", ["gamemode"], {
								unique: false,
							});
							object_store_worlds_list.createIndex(
								"lastSaveState",
								["lastSaveState"],
								{ unique: false }
							);

							await Promise.all([
								object_store_worlds_list.transaction.oncomplete,
							])
								.then(() => {
									resolve(true);
								})
								.catch((error) => {
									reject(error);
								});
						});
					}
				);
			};

			if (
				await this.indexedDBController.databaseExists(
					indexedDBGlobalOptions.worlds.NAME
				)
			) {
				if (
					(await this.indexedDBController.getVersionOfDB(
						indexedDBGlobalOptions.worlds.NAME
					)) === indexedDBGlobalOptions.worlds.CURRENT_VERSION
				) {
					//Database exist in the same version -> Open it
					db_worlds = await this.indexedDBController.openDatabase(
						indexedDBGlobalOptions.worlds.NAME,
						indexedDBGlobalOptions.worlds.CURRENT_VERSION
					);
				} else {
					//Database does exist in a different version -> Data migration needed
					//Handle data migration

					if (
						confirm(
							"Do you want to delete the worlds list database in your browser?"
						)
					) {
						await this.indexedDBController.deleteDatabase(
							indexedDBGlobalOptions.worlds.NAME
						);
						db_worlds = await create_worlds_list();
					} else {
						alert(
							"Data migration is not implemented yet. Please make sure your are on the correct version."
						);
						throw new NotImplementedError(
							"Data migration is not implemented yet. Please make sure your are on the correct version."
						);
					}
				}
			} else {
				//Database does not exist at all
				db_worlds = await create_worlds_list();
			}

			if (!db_worlds) {
				throw new DatabaseDoesNotExistError(
					`The database '${indexedDBGlobalOptions.worlds.NAME}' could not be created or opened.`
				);
			}

			this.indexedDBDatabases.worlds_list = db_worlds;
		} else {
			throw new Error("Db to open is not a valid db.");
		}
	}

	addWorldToList(worldEntry: WorldEntry): Promise<boolean> {
		return new Promise((resolve, reject) => {
			let db_worlds = this.indexedDBDatabases.worlds_list;
			if (!db_worlds) {
				throw new DatabaseNotOpenedError();
			}

			let indexedDBGlobalOptions = GlobalOptions.options.indexedDBDatabases;

			let transaction_db_worlds = db_worlds.transaction(
				indexedDBGlobalOptions.worlds.objectStoreNames.WORLDS_LIST,
				"readwrite"
			);
			let objectStore_db_worlds_worlds_list = transaction_db_worlds.objectStore(
				indexedDBGlobalOptions.worlds.objectStoreNames.WORLDS_LIST
			);

			objectStore_db_worlds_worlds_list.add(worldEntry);

			objectStore_db_worlds_worlds_list.transaction.onerror = (event) => {
				resolve(false);
			};

			objectStore_db_worlds_worlds_list.transaction.oncomplete = (event) => {
				resolve(true);
			};
		});
	}

	changeWorld(worldEntry: WorldEntry) {
		let db_worlds = this.indexedDBDatabases.worlds_list;
		if (!db_worlds) {
			throw new DatabaseNotOpenedError();
		}

		let indexedDBGlobalOptions = GlobalOptions.options.indexedDBDatabases;

		let transaction_db_worlds = db_worlds.transaction(
			indexedDBGlobalOptions.worlds.objectStoreNames.WORLDS_LIST,
			"readwrite"
		);
		let objectStore_db_worlds_worlds_list = transaction_db_worlds.objectStore(
			indexedDBGlobalOptions.worlds.objectStoreNames.WORLDS_LIST
		);

		objectStore_db_worlds_worlds_list.put(worldEntry);

		objectStore_db_worlds_worlds_list.transaction.onerror = (event) => {
			console.log(event);
		};

		objectStore_db_worlds_worlds_list.transaction.oncomplete = (event) => {
			console.log(event);
		};
	}

	deleteWorldFromList(internalName: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			let db_worlds = this.indexedDBDatabases.worlds_list;
			if (!db_worlds) {
				throw new DatabaseNotOpenedError();
			}
			let indexedDBGlobalOptions = GlobalOptions.options.indexedDBDatabases;

			let transaction_db_worlds = db_worlds.transaction(
				indexedDBGlobalOptions.worlds.objectStoreNames.WORLDS_LIST,
				"readwrite"
			);
			let objectStore_db_worlds_worlds_list = transaction_db_worlds.objectStore(
				indexedDBGlobalOptions.worlds.objectStoreNames.WORLDS_LIST
			);

			let deleteRequest =
				objectStore_db_worlds_worlds_list.delete(internalName);

			deleteRequest.onerror = (event) => {
				reject(event);
			};

			deleteRequest.onsuccess = (event) => {
				resolve(true);
			};
		});
	}

	async deleteWorld(internalName: string) {
		if (!(await this.worldExists(internalName))) {
			throw new Error("The world doesnt exist");
		}

		await this.indexedDBController.deleteDatabase(
			`${this.getWorldDBNameByInternalName(internalName)}`
		);
	}

	getWorldDBNameByInternalName(internalName: string) {
		return `${GlobalOptions.options.indexedDBDatabases.worldDB.worldDBPrefix}${internalName}`;
	}
}

export enum WorldControllerDBs {
	WORLDS_LIST_DB,
}
