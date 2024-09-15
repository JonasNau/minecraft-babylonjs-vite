import { Condition, ConditionWaiter } from "./ConditionWaiter";
import * as DBControllerHelper from "./controller/indexedDBController/IndexedDBHelper";
import DatabaseDoesNotExistError from "./errors/controller/indexedDBHelper/DatabaseDoesNotExist";
import { wait } from "./helperFunctions/promise-functions";

(async () => {
	const createDatabaseSchema = (dbOpenEvent: IDBVersionChangeEvent) => {};

	const indexedDBController = new DBControllerHelper.IndexedDBHelper();

	const DB_NAME = "World";
	const VERSION = 2;

	let db: IDBDatabase | null = null;

	// await indexedDBController.deleteDatabase(DB_NAME);

	// db = await indexedDBController.createAndOpenDatabase(
	// 	DB_NAME,
	// 	VERSION,
	// 	(event) => {
	// 		console.log("UPGRADE");
	// 	}
	// );

	let dbExists = await indexedDBController.getVersionOfDB(DB_NAME);
	console.log("Version:", dbExists);

	// console.log("closing all connections...");

	// let condition = new Condition({ name: "timerDone" });
	// condition.setIsTrue(true);

	// console.log("waiting...");
	// await new ConditionWaiter(condition).waitForConditionToBecomeTrueOrFalse(
	// 	true,
	// 	{ maxWaitTimeInMilliseconds: 1001 }
	// );
	// console.log("Conditon true");

	// let loop = async () => {
	// 	let dbExists = await indexedDBController.databaseExists(DB_NAME, VERSION);
	// 	console.log("DB exists:", dbExists);
	// 	console.count("count");
	// 	await wait(500);
	// 	loop();
	// };

	// loop();

	// console.log("delete db");
	// console.log(await indexedDBController.getVersionOfDB(DB_NAME));
	// console.log("End");

	// if (dbExists) {
	// 	let version = await indexedDBController.getVersionOfDB(DB_NAME);
	// 	if (version !== VERSION) {
	// 		//DB Version differs
	// 		console.log("UPGRADE DB VERSION (deleting and creating)");
	// 		// await indexedDBController.deleteDatabase(DB_NAME);
	// 		// db = await indexedDBController.createAndOpenDatabase(
	// 		// 	DB_NAME,
	// 		// 	VERSION,
	// 		// 	createDatabaseSchema
	// 		// );
	// 	} else {
	// 		//db = await indexedDBController.openDatabase(DB_NAME, VERSION);
	// 	}
	//}
	// else if () {

	// }
})();

// let indexedDB = window.indexedDB;

// const DB_NAME = "MyDatabase";

// indexedDB.deleteDatabase(DB_NAME);

// let dbOpenRequest = indexedDB.open(DB_NAME);

// dbOpenRequest.onblocked = (event) => {
// 	console.error(event);
// };

// dbOpenRequest.onerror = (event) => {
// 	console.error(event);
// };

// dbOpenRequest.onupgradeneeded = async (event) => {
// 	const db = (event.target as IDBOpenDBRequest).result;
// 	await wait(1000);
// 	console.log(event, "DB", db);
// };

// dbOpenRequest.onsuccess = (event) => {
// 	const db = (event.target as IDBOpenDBRequest).result;
// 	console.log(event, "DB", db);
// };
