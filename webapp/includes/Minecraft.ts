import * as BABYLON from "@babylonjs/core";
import DebugLayer from "./debugger/DebugLayer";

import "@babylonjs/inspector";
import RessourcePackController from "./controller/ressourcepack/RessourcePackController";
import InputController from "./input-control/InputController";
import Settings from "./settings/Settings";
import MainMenu from "./menus/main/MainMenu";
import SoundCreator from "./controller/sound-controller/sound/SoundCreator";
import StateController from "./state-controller/StateController";
import StateList from "./state-controller/StateList";
import SettingsMenu from "./menus/settings/SettingsMenu";
import SoundContainer from "./controller/sound-controller/sound/SoundContainer";
import MusicContainer from "./controller/sound-controller/music/MusicContainer";
import MusicLibrary from "./controller/sound-controller/music/MusicLibrary";
import MusicPlayer from "./controller/sound-controller/music/MusicPlayer";
import MusicAndSoundsMenu from "./menus/settings/MusicAndSoundsMenu";
import GraphicsMenu from "./menus/settings/GraphicsMenu";
import ControlsMenu from "./menus/settings/ControlsMenu";
import RessourcePacksMenu from "./menus/settings/RessourcePacksMenu";
import MainGame from "./mainGame/MainGame";
import GameSelectMenu from "./menus/gameSelect/GameSelectMenu";
import WorldController, {
	WorldControllerDBs,
	WorldEntry,
} from "./controller/WorldContoller";
import WorldCreateMenu, {
	GameCreateOptions,
	WorldType,
} from "./menus/gameSelect/WorldCreateMenu";
import GlobalOptions from "./settings/GlobalOptions";
import GlobalVariables from "./GlobalVariables";
import {
	IndexedDBAccessMode,
	IndexedDBHelper,
} from "./controller/indexedDBController/IndexedDBHelper";

import { IDBBlock } from "./mainGame/world/blocks/IDBBlock";
import { BlockTypes } from "./mainGame/world/blocks/BlockTypes";

export class Minecraft {
	debugEnabled: boolean;

	engine: BABYLON.Engine;

	//optimizer: BABYLON.SceneOptimizer;

	ressourcePackController: RessourcePackController;

	inputController: InputController;

	soundCreator: SoundCreator;

	settings: Settings;

	static debug = true;

	debugLayer?: DebugLayer;

	canvas: HTMLCanvasElement;

	menuStateController: StateController;

	stateList: StateList;

	soundContainer: SoundContainer;

	musicContainer: MusicContainer;

	musicPlayer: MusicPlayer;
	soundScene: BABYLON.Scene;

	worldController: WorldController;

	indexedDBHelper: IndexedDBHelper;

	constructor(canvas: HTMLCanvasElement, engine: BABYLON.Engine) {
		this.canvas = canvas;
		this.debugEnabled = true;

		this.engine = engine;

		// Create a SceneOptimizer object
		// let sceneOptimizerOptions = new BABYLON.SceneOptimizerOptions();
		// sceneOptimizerOptions.targetFrameRate = this.TARGET_FRAME_RATE;

		// this.optimizer = new BABYLON.SceneOptimizer(
		// 	this.scene,
		// 	sceneOptimizerOptions,
		// 	true,
		// 	true
		// );
		//this.optimizer.start();

		this.inputController = new InputController(this.canvas);

		this.debugLayer = new DebugLayer(document.body, this);

		this.settings = new Settings();
		this.ressourcePackController = new RessourcePackController(
			"ressourcepacks",
			this.settings
		);

		//this.settings.saveToLocalStorage();
		this.settings.tryToLoadSettingsFromLocalStorage();

		this.soundCreator = new SoundCreator(this.ressourcePackController);

		this.soundScene = new BABYLON.Scene(this.engine);
		this.soundContainer = new SoundContainer(this, this.soundScene);

		let musicScene = new BABYLON.Scene(this.engine);
		this.musicContainer = new MusicContainer(this, musicScene);

		this.musicPlayer = new MusicPlayer(this.musicContainer);
		this.musicPlayer.loadAllSoundsToMusicPlayer(MusicLibrary.musicList);

		//States Konfigurieren
		this.menuStateController = new StateController();
		this.stateList = new StateList();

		let mainMenu = new MainMenu({
			mainProgram: this,
		});
		let settingsMenu = new SettingsMenu({
			mainProgram: this,
		});
		let settings_musicAndSoundsMenu = new MusicAndSoundsMenu({
			mainProgram: this,
		});
		let settings_graphics = new GraphicsMenu({
			mainProgram: this,
		});
		let settings_controls = new ControlsMenu({
			mainProgram: this,
		});
		let settings_ressourcepacks = new RessourcePacksMenu({
			mainProgram: this,
		});
		let gameSelectMenu = new GameSelectMenu({
			mainProgram: this,
		});
		let worldCreateMenu = new WorldCreateMenu({
			mainProgram: this,
		});
		this.stateList.states.menus.main.mainMenu = mainMenu;
		this.stateList.states.menus.settings.settingsMenu = settingsMenu;
		this.stateList.states.menus.settings.musicAndSoundsMenu =
			settings_musicAndSoundsMenu;
		this.stateList.states.menus.settings.graphicsMenu = settings_graphics;
		this.stateList.states.menus.settings.controlsMenu = settings_controls;
		this.stateList.states.menus.settings.ressourcePackMenu =
			settings_ressourcepacks;
		this.stateList.states.menus.gameSelectMenu.overview = gameSelectMenu;
		this.stateList.states.menus.gameSelectMenu.worldCreateMenu =
			worldCreateMenu;

		this.indexedDBHelper = new IndexedDBHelper();

		this.worldController = new WorldController();

		this.addRezizeOption();
	}

	exit() {
		this.settings.saveToLocalStorage();
		window.location.reload();
	}

	async loadWorld(worldEntry: WorldEntry) {
		let mainGame = new MainGame({
			mainProgram: this,
			worldEntry: worldEntry,
		});
		this.stateList.states.mainGame = mainGame;
		this.menuStateController.clearState();
		await this.stateList.states.mainGame.enter();

		await mainGame.buildMap();
	}

	async createWorld(gameCreateOptions: GameCreateOptions) {
		let created = await this.worldController.addWorldToList({
			gameMode: gameCreateOptions.gamemode,
			lastSaveState: null,
			internalName: gameCreateOptions.worldName,
			name: gameCreateOptions.worldName,
			version: GlobalVariables.version,
		});
		if (!created) {
			alert("Fehler beim Erstellen der Welt.");
			return;
		}

		//Create db
		let db = await this.indexedDBHelper.createAndOpenDatabase(
			`${this.worldController.getWorldDBNameByInternalName(
				gameCreateOptions.worldName
			)}`,
			GlobalOptions.options.indexedDBDatabases.worldDB.DB_VERSION,
			(versionChangeEvent) => {
				//Create db structure
				const database = (versionChangeEvent.target as IDBOpenDBRequest).result;

				const worldsDBOptions =
					GlobalOptions.options.indexedDBDatabases.worldDB;
				//Create object stores
				///block_data
				let objectStore_block_data = database.createObjectStore(
					worldsDBOptions.objectStores.block_data.name,
					{ autoIncrement: false, keyPath: ["x", "y", "z", "zindex"] }
				);

				let compoundIndex = objectStore_block_data.createIndex("x-y-z-zindex", [
					"x",
					"y",
					"z",
					"zindex",
				]);
			}
		);

		let dbTransaction = db.transaction(
			GlobalOptions.options.indexedDBDatabases.worldDB.objectStores.block_data
				.name,
			IndexedDBAccessMode.READ_WRITE
		);

		dbTransaction.onerror = (event) => {
			console.error(event);
		};
		dbTransaction.oncomplete = (event) => {
			console.log(event);
		};

		dbTransaction.onabort = (event) => {
			console.error(event);
			this.menuStateController.setState(
				this.stateList.states.menus.main.mainMenu
			);
			alert(
				"Ein Fehler beim Erstellen der Welt ist aufgetreten. Bitte versuche es erneut."
			);
			return;
		};

		let object_store_block_data = dbTransaction.objectStore(
			GlobalOptions.options.indexedDBDatabases.worldDB.objectStores.block_data
				.name
		);

		if (gameCreateOptions.worldType == WorldType.FLAT) {
			let size = GlobalOptions.options.worldCreateOptions.DEFAULT_FLAT.SIZE / 2;
			try {
				for (let x = -size; x < size; x++) {
					for (let z = -size; z < size; z++) {
						for (let y = 0; y < 2; y++) {
							object_store_block_data.put({
								x: x,
								y: y,
								z: z,
								zindex: 0,
								orientation: 0,
								type: BlockTypes.COBBLESTONE_BLOCK,
							} satisfies IDBBlock);
						}
					}
				}
			} catch (error) {
				this.menuStateController.setState(
					this.stateList.states.menus.main.mainMenu
				);
				alert(
					"Ein Fehler beim Erstellen der Welt ist aufgetreten. Bitte versuche es erneut."
				);
				return;
			}
		}

		let worldEntry = await this.worldController.getWorldEntry(
			gameCreateOptions.worldName
		);
		if (worldEntry == null) {
			this.menuStateController.setState(
				this.stateList.states.menus.main.mainMenu
			);
			alert(
				"Ein Fehler beim Erstellen der Welt ist aufgetreten. Bitte versuche es erneut."
			);
			return;
		}
		await this.loadWorld(worldEntry);
	}

	startDebugLayerListenToInputs() {
		if (!this.debugLayer) {
			throw new Error("Debug Layer is not initialized");
		}
		//Debugging
		this.debugLayer.loadKeyboardShortcuts();
	}

	addRezizeOption() {
		window.addEventListener("resize", () => {
			console.debug("Site resized");
			this.engine.resize();
		});
	}

	// setBabylonDebugLayerVisibility(debugOn = false) {
	// 	if (debugOn) {
	// 		this.scene.debugLayer.show({ overlay: true });
	// 	} else {
	// 		this.scene.debugLayer.hide();
	// 	}
	// }

	async load(callback?: (message: string) => void) {
		callback?.("Opening Databases...");
		await this.worldController.openDatabase(WorldControllerDBs.WORLDS_LIST_DB);
		callback?.("Preloading Ressources...");
		await this.preloadRessources();
	}

	async preloadRessources() {
		//Music player
		let randomSound = this.musicPlayer.getRandomSoundIndex();
		this.musicPlayer.currentTrackIndex = randomSound;
		await this.musicPlayer.preloadSound(this.musicPlayer.currentTrackIndex);
	}

	async run() {
		//Show Start Screen
		this.menuStateController.setState(
			this.stateList.states.menus.main.mainMenu
		);
		//Play Music
		if (this.settings.musicSettings.musicVolume > 0) this.musicPlayer.play();

		this.inputController.listenToInputs();

		//Debugger
		this.startDebugLayerListenToInputs();

		// let

		// this.engine.runRenderLoop(renderFunction);

		// this.buildMap();
	}

	// setRessourcePack(name: string): boolean {
	// 	return true;
	// }
}
