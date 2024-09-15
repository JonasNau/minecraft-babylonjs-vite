import * as BABYLON from "@babylonjs/core";
import * as CANNON from "cannon-es";
import { Minecraft } from "../Minecraft";
import { GAMEMODE } from "../GAMEMODE";
import Player from "./player/Player";
import State from "../state-controller/State";
import GlobalOptions from "../settings/GlobalOptions";
import { MemoryHelperEventListeners } from "j-memoryhelper-functions";
import { EDEBUG_SCREENS } from "../debugger/DebugScreens";
import Block from "./world/blocks/Block";
import BlockPosition from "./world/blocks/BlockPosition";
import { Grass_Block } from "./world/blocks/Grass_Block";
import { MemoryHelperIntervals } from "j-memoryhelper-functions";
import World from "./world/World";
import Keystroke from "../input-control/keystroke/KeyStroke";
import KeyboardKey from "../input-control/KeyboardKey";
import { KeyboardEvents } from "../input-control/keyboard/KeyboardEvents";
import { EKeyboardCode } from "../input-control/keyboard/EKeyboardCode";
import { IndexedDBHelper } from "../controller/indexedDBController/IndexedDBHelper";
import DatabaseAlreadyExistsWithDifferentVersionError from "../errors/controller/indexedDBHelper/DatabaseAlreadyExistsWithDifferentVersionError";
import PlayerPosition from "./player/PlayerPosition";
import LocalPlayer from "./player/LocalPlayer";
import NotImplementedError from "../errors/NotImplementedError";
import DatabaseDoesNotExistError from "../errors/controller/indexedDBHelper/DatabaseDoesNotExist";
import { WorldEntry } from "../controller/WorldContoller";
import { MemoryHelperTimeouts } from "j-memoryhelper-functions";

export enum EEventListeners {
	POINTER_LOCK = "pointer_lock",
	POINTER_LOCK_CHANGE = "pointer_lock_change",
}

export enum EIntervals {
	BABYLON_RENDER_LOOP = "BABYLON_RENDER_LOOP",
	GAME_LOOP = "GAME_LOOP",
	UPDATE_FPS_DISPLAY = "UPDATE_FPS_DISPLAY",
}

export default class MainGame implements State {
	mainProgram: Minecraft;
	hasPointerLock: boolean;

	deltaUpdateFPSDisplay: number;
	frameCount: number;
	lastUpdateFPSDisplay: Date;
	deltaTimeLastRender: number;

	LAST_RENDER_SCENE: Date;
	LAST_CALCULATION_GAME: Date;
	deltaTimeLastCalculation: number;

	fpsCount: number;

	player: LocalPlayer | null;

	world: World;

	scene: BABYLON.Scene;

	earthGravity = -9.81;

	isActive = false;

	indexedDBController: IndexedDBHelper;

	indexedDBDatabases: {
		world?: IDBDatabase;
	};

	memoryHelpers: {
		eventListeners: MemoryHelperEventListeners;
		intervals: MemoryHelperIntervals;
		timeouts: MemoryHelperTimeouts;
	};

	readonly worldEntry: WorldEntry;

	constructor(options: { mainProgram: Minecraft; worldEntry: WorldEntry }) {
		this.worldEntry = options.worldEntry;

		this.mainProgram = options.mainProgram;
		this.memoryHelpers = {
			eventListeners: new MemoryHelperEventListeners(),
			intervals: new MemoryHelperIntervals(),
			timeouts: new MemoryHelperTimeouts(),
		};

		this.hasPointerLock = false;
		this.deltaUpdateFPSDisplay = 0;
		this.frameCount = 0;
		this.lastUpdateFPSDisplay = new Date();
		this.deltaTimeLastRender = -1;

		this.LAST_RENDER_SCENE = new Date();
		this.LAST_CALCULATION_GAME = new Date();
		this.deltaTimeLastCalculation = -1;

		this.fpsCount = 0;

		this.indexedDBController = new IndexedDBHelper();

		this.scene = this.createScene(this.mainProgram.engine);

		this.world = new World({
			mainProgram: this.mainProgram,
			minY: GlobalOptions.options.mainGame.world.minY,
			maxY: GlobalOptions.options.mainGame.world.maxY,
			chunkSize: GlobalOptions.options.mainGame.world.chunkSize,
			maxZIndex: GlobalOptions.options.mainGame.world.maxZIndex,
			worldEntry: this.worldEntry,
			mainGame: this,
		});

		this.player = null;

		this.indexedDBDatabases = {};
	}

	async enter() {
		this.isActive = true;

		this.addRequestPointerLock();
		//await this.buildMap();
		document.body.setAttribute("data-menu", "ingame");
		this.caputePointerLockState();
		this.openDatabases();

		await this.world.init();

		this.startBabylonRenderLoop();
		this.startGameLoop();
		this.startUpdateFPSDisplay();

		this.player = new LocalPlayer({
			mainProgram: this.mainProgram,
			mainGame: this,
			canvas: this.mainProgram.canvas,
			playerName: "localPlayer1",
			facingDirection: new BABYLON.Vector3(0, 0, 0),
			position: { x: 0, y: 0, z: 0 } satisfies PlayerPosition,
			scene: this.scene,
		});

		this.player.setInputRequestKeyBindings();
		this.player.setListenForInputs(true);
		this.addListenToMouseToLookAround();

		let sphere = BABYLON.MeshBuilder.CreateSphere(
			"sphere",
			{ diameter: 2 },
			this.scene
		);
		sphere.position.x = 0;
		sphere.position.y = 0;
		sphere.position.z = 0;
	}

	startGameLoop() {
		let timeInMillisecondsBetweenNextGameLoop =
			1000 / GlobalOptions.options.mainGame.performance.calculationsPerSecond;

		this.memoryHelpers.intervals.addAndRegisterInterval({
			name: EIntervals.GAME_LOOP,
			interval: timeInMillisecondsBetweenNextGameLoop,
			function: () => {
				this.requestGameLoop();
			},
		});
	}

	stopGameLoop(): boolean {
		return this.memoryHelpers.intervals.clearIntervalByName(
			EIntervals.GAME_LOOP
		);
	}

	startUpdateFPSDisplay() {
		let interval =
			1000 /
			GlobalOptions.options.mainGame.performance.updateFPSDisplayPerSecond;

		this.memoryHelpers.intervals.addAndRegisterInterval({
			name: EIntervals.UPDATE_FPS_DISPLAY,
			interval: interval,
			function: () => {
				this.requestUpdateFPSDisplay();
			},
		});
	}

	stopUpdateFPSDisplay(): boolean {
		return this.memoryHelpers.intervals.clearIntervalByName(
			EIntervals.UPDATE_FPS_DISPLAY
		);
	}

	startBabylonRenderLoop() {
		let timeInMillisecondsBetweenNextRenderLoop =
			1000 / this.mainProgram.settings.videoSettings.maxFPS;

		this.memoryHelpers.intervals.addAndRegisterInterval({
			name: EIntervals.BABYLON_RENDER_LOOP,
			interval: timeInMillisecondsBetweenNextRenderLoop,
			function: () => {
				this.babylonRenderLoop();
			},
		});
	}

	stopBabylonRenderLoop(): boolean {
		return this.memoryHelpers.intervals.clearIntervalByName(
			EIntervals.BABYLON_RENDER_LOOP
		);
	}

	exit() {
		this.stopBabylonRenderLoop();
		this.stopGameLoop();
		this.stopUpdateFPSDisplay();

		this.memoryHelpers.intervals.freeUpAllMemory();
		this.memoryHelpers.timeouts.freeUpAllMemory();
		this.memoryHelpers.eventListeners.freeUpAllMemory();

		this.isActive = false;
	}

	caputePointerLockState() {
		this.memoryHelpers.eventListeners.addAndRegisterEventListener({
			eventListenerFunction: async () => {
				this.hasPointerLock =
					document.pointerLockElement === this.mainProgram.canvas;
			},
			ownerOfEventListener: document,
			type: "pointerlockchange",
			name: EEventListeners.POINTER_LOCK_CHANGE,
		});
	}

	addRequestPointerLock() {
		this.memoryHelpers.eventListeners.addAndRegisterEventListener({
			eventListenerFunction: async () => {
				try {
					this.mainProgram.canvas.requestPointerLock();
				} catch (error) {
					console.error("ERROR:" + error);
				}
			},
			ownerOfEventListener: this.mainProgram.canvas,
			type: "click",
			name: EEventListeners.POINTER_LOCK,
		});
	}

	removePointerLockRequest() {
		this.memoryHelpers.eventListeners.removeEventListenerByName(
			EEventListeners.POINTER_LOCK
		);
	}

	removePointerLock() {
		document.exitPointerLock();
	}

	updateFPSDisplay() {
		let multiplyToOneSecond = 1000 / this.deltaUpdateFPSDisplay;
		this.fpsCount = this.frameCount * multiplyToOneSecond;
		this.frameCount = 0;

		if (
			this.mainProgram.debugLayer?.debugScreenIsActive(
				EDEBUG_SCREENS.INGAME_DEBUG
			)
		) {
			this.setValueFromDebugEntry("fps", this.fpsCount.toFixed(0));
		}
	}

	setValueFromDebugEntry(name: string, value: string | number) {
		if (
			this.mainProgram.debugLayer?.debugScreenIsActive(
				EDEBUG_SCREENS.INGAME_DEBUG
			)
		) {
			let debugLayer = this.mainProgram.debugLayer.getPageHTMLOverlayByName(
				EDEBUG_SCREENS.INGAME_DEBUG
			);
			if (!debugLayer) return;
			let entry = debugLayer.querySelector(
				`[data-debug-element-entry='${name}']`
			);
			if (!entry) return;
			let htmlElementToInsertValue = entry;
			if (entry?.querySelector(".content")) {
				htmlElementToInsertValue = entry.querySelector(".content")!;
			}
			htmlElementToInsertValue.innerHTML = `${value}`;
		}
	}

	requestUpdateFPSDisplay(): boolean {
		let now = new Date();
		this.deltaUpdateFPSDisplay =
			now.getTime() - this.lastUpdateFPSDisplay.getTime();
		let updateFPSDisplay = this.deltaUpdateFPSDisplay > 1000;
		if (updateFPSDisplay) {
			this.updateFPSDisplay();
			this.lastUpdateFPSDisplay = new Date();
			return true;
		}

		return false;
	}

	babylonRenderLoop() {
		this.deltaTimeLastRender =
			new Date().getTime() - this.LAST_RENDER_SCENE.getTime();
		this.scene.render(true);
		this.LAST_RENDER_SCENE = new Date();
		this.frameCount++;
	}

	// renderFunction = () => {
	// 	this.requestBabylonRenderLoop();
	// 	this.requestGameLoop();
	// 	this.requestUpdateFPSDisplay();
	// };

	createScene(engine: BABYLON.Engine) {
		// This creates a basic Babylon Scene object (non-mesh)
		const scene = new BABYLON.Scene(engine);

		// Create a new instance of the CannonJSPlugin class
		const cannonPlugin = new BABYLON.CannonJSPlugin(
			undefined,
			undefined,
			CANNON
		);

		// Enable the physics engine on your scene
		const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
		const physicsPlugin = scene.enablePhysics(gravityVector, cannonPlugin);

		// let box1 = BABYLON.MeshBuilder.CreateBox(
		// 	"box",
		// 	{ height: 1, width: 1, depth: 1 },
		// 	scene
		// );

		// box1.position.x = 2;
		// box1.position.z = 2;
		// box1.position.y = 2;

		// let box2 = BABYLON.MeshBuilder.CreateBox(
		// 	"box",
		// 	{ height: 1, width: 2, depth: 1 },
		// 	scene
		// );
		// box2.position.x = 2;
		// box2.position.z = 4;
		// box2.position.y = 2;

		// // Make the box mesh physics-enabled
		// box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0 }, scene);

		// Create an ambient light
		let ambientLight = new BABYLON.HemisphericLight(
			"HemiLight",
			new BABYLON.Vector3(0, 1, 0),
			scene
		);

		// Set the light's color and intensity
		ambientLight.diffuse = new BABYLON.Color3(1, 1, 1);
		ambientLight.intensity = 0.7;

		// const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
		// ground.physicsImpostor = Pnew BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0.0, restitution: 0 }, scene);
		// ground.position.y = -0.5;

		// const cobblestoneMaterial = new BABYLON.StandardMaterial("cobblestone", scene);
		// cobblestoneMaterial.diffuseTexture = new BABYLON.Texture("media/assets/materials/cobblestone.png", scene);
		// ground.material = cobblestoneMaterial;

		// const playerBox = BABYLON.MeshBuilder.CreateBox("player", {height: 3, width: 0.5, depth: 0.2}, scene);
		// playerBox.physicsImpostor = new BABYLON.PhysicsImpostor(playerBox, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 1, restitution: 0});
		// playerBox.position.y = 2;

		// window.addEventListener("keydown", (event) => {
		//     let key = event.key;
		//     // console.debug(
		//     //     {
		//     //         "CTRL": keyPressed(event, KEYNAME.CTRL),
		//     //         "ATL": keyPressed(event, KEYNAME.ALT),
		//     //         "Code": event.code,
		//     //         "Key": event.key,
		//     //     }

		//     // )

		//     //CTRL pressed
		//     if (InputHelperFunctions.keyPressed(event, EKeyboardCode.CTRL)) {

		//         //And ALT key
		//         if (InputHelperFunctions.keyPressed(event, EKeyboardCode.ALT)) {

		//             //And SHIFT key
		//             if (InputHelperFunctions.keyPressed(event, EKeyboardCode.SHIFT)) {

		//                 //SHIFT + CTRL + ALT + I
		//                 if (InputHelperFunctions.keyPressed(event, EKeyboardCode.KEYI)) {
		//                     if (this.debugEnabled) {
		//                         //Debug Layer
		//                         if (scene.debugLayer.isVisible()) {
		//                             scene.debugLayer.hide();
		//                         } else {
		//                             this.scene.debugLayer.show({ overlay: true });

		//                         }
		//                     }

		//                     return;
		//                 }
		//             }

		//             //CTRL + ALT + 0
		//             if (InputHelperFunctions.keyPressed(event, EKeyboardCode.DIGIT0)) {
		//                 console.log("CTRL + ALT + 0");
		//                 this.player.setGameMode(GAMEMODE.SURVIVAL);
		//                 return;
		//             }
		//             //CTRL + ALT + 1
		//             if (InputHelperFunctions.keyPressed(event, EKeyboardCode.DIGIT1)) {
		//                 console.log("CTRL + ALT + 1");
		//                 this.player.setGameMode(GAMEMODE.CREATIVE);
		//                 return;
		//             }
		//             //CTRL + ALT + 2
		//             if (InputHelperFunctions.keyPressed(event, EKeyboardCode.DIGIT2)) {
		//                 console.log("CTRL + ALT + 2");
		//                 this.player.setGameMode(GAMEMODE.SEPECTATOR);
		//                 return;
		//             }

		//         }
		//     }

		//     if (InputHelperFunctions.keyPressed(event, EKeyboardCode.DIGIT1)) {
		//         this.player.guiElements.hotbar.setSelected(0);
		//         this.player.guiElements.hotbar.displayItemInSlot(0, "media/assets/ressourcepacks/default/items/grass.webp");
		//     } else if (InputHelperFunctions.keyPressed(event, EKeyboardCode.DIGIT2)) {
		//         this.player.guiElements.hotbar.setSelected(1);
		//     } else if (InputHelperFunctions.keyPressed(event, EKeyboardCode.DIGIT3)) {
		//         this.player.guiElements.hotbar.setSelected(2);
		//     } else if (InputHelperFunctions.keyPressed(event, EKeyboardCode.DIGIT4)) {
		//         this.player.guiElements.hotbar.setSelected(3);
		//     } else if (InputHelperFunctions.keyPressed(event, EKeyboardCode.DIGIT5)) {
		//         this.player.guiElements.hotbar.setSelected(4);
		//     } else if (InputHelperFunctions.keyPressed(event, EKeyboardCode.DIGIT6)) {
		//         this.player.guiElements.hotbar.setSelected(5);
		//     } else if (InputHelperFunctions.keyPressed(event, EKeyboardCode.DIGIT7)) {
		//         this.player.guiElements.hotbar.setSelected(6);
		//     } else if (InputHelperFunctions.keyPressed(event, EKeyboardCode.DIGIT8)) {
		//         this.player.guiElements.hotbar.setSelected(7);
		//     } else if (InputHelperFunctions.keyPressed(event, EKeyboardCode.DIGIT9)) {
		//         this.player.guiElements.hotbar.setSelected(8);
		//     }

		// });

		// scene.onBeforeRenderObservable.add(() => {});

		return scene;
	}

	getMovementVector(player: LocalPlayer, direction: BABYLON.Vector3) {
		if (!player.body) {
			throw new Error(
				"The player has no body to calculate the movement vector."
			);
		}
		const movementVector = player.body.wholeBody
			.getDirection(direction)
			.scale(player.speed * this.deltaTimeLastCalculation);

		return movementVector;
	}

	updatePlayerPosition() {
		if (!this.player) return;
		this.player.updateInputRequest();

		// Move player based on input
		if (this.player.body == null) {
			console.error("No body defined for the player");
			return;
		}
		if (this.player.inputRequests!.FORWARD.getRequested()) {
			this.player.body.wholeBody.position.addInPlace(
				this.getMovementVector(this.player, BABYLON.Vector3.Forward())
			);
		}
		if (this.player.inputRequests!.LEFT.getRequested()) {
			this.player.body.wholeBody.position.addInPlace(
				this.getMovementVector(this.player, BABYLON.Vector3.Left())
			);
		}
		if (this.player.inputRequests!.RIGHT.getRequested()) {
			this.player.body.wholeBody.position.addInPlace(
				this.getMovementVector(this.player, BABYLON.Vector3.Right())
			);
		}
		if (this.player.inputRequests!.BACKWARDS.getRequested()) {
			this.player.body.wholeBody.position.addInPlace(
				this.getMovementVector(this.player, BABYLON.Vector3.Backward())
			);
		}

		// if (this.player.inputRequests!.JUMP.getRequested()) {
		// 	this.player.jump();
		// }
		// if (this.player.inputRequests!.SNEAK.getRequested()) {
		// 	this.player.sneak();
		// }

		let oldChunk = this.world.getChunkXZFromGlobalCoordinates(
			this.player.position.x,
			this.player.position.z
		);

		this.player.position.x = this.player.body.wholeBody.position.x;
		this.player.position.y = this.player.body.wholeBody.position.y;
		this.player.position.z = this.player.body.wholeBody.position.z;
		this.player.facingDirection = this.player.camera.rotation;

		let newChunk = this.world.getChunkXZFromGlobalCoordinates(
			this.player.position.x,
			this.player.position.z
		);

		if (!(oldChunk.x == newChunk.x && oldChunk.z == newChunk.z)) {
			this.world.loadChunksPlayerIsInRange(
				this.player.position.x,
				this.player.position.z
			);

			if (
				this.mainProgram.debugLayer?.debugScreenIsActive(
					EDEBUG_SCREENS.INGAME_DEBUG
				)
			) {
				this.setValueFromDebugEntry(
					"chunk-position",
					`x: ${newChunk.x.toFixed(0)}, z: ${newChunk.z.toFixed(0)}`
				);
			}
		}

		if (
			this.mainProgram.debugLayer?.debugScreenIsActive(
				EDEBUG_SCREENS.INGAME_DEBUG
			)
		) {
			this.setValueFromDebugEntry(
				"position",
				`x: ${this.player.position.x.toFixed(
					1
				)}, y: ${this.player.position.y.toFixed(
					1
				)}, z: ${this.player.position.z.toFixed(1)}`
			);
		}
	}

	requestGameLoop(): boolean {
		let now = new Date();
		this.deltaTimeLastCalculation =
			now.getTime() - this.LAST_CALCULATION_GAME.getTime();

		let timeInMillisecondsBetweenNextGameLoop =
			1000 / GlobalOptions.options.mainGame.performance.calculationsPerSecond;
		let calculationNeeded =
			this.deltaTimeLastCalculation >= timeInMillisecondsBetweenNextGameLoop;

		if (calculationNeeded) {
			this.gameLoop();
			return true;
		}

		return false;
	}

	requestBabylonRenderLoop(): boolean {
		let now = new Date();
		console.log(now.getTime());
		this.deltaTimeLastRender = now.getTime() - this.LAST_RENDER_SCENE.getTime();

		let timeInMillisecondsBetweenNextRenderLoop =
			1000 / this.mainProgram.settings.videoSettings.maxFPS;

		let calculationNeeded =
			this.deltaTimeLastRender >= timeInMillisecondsBetweenNextRenderLoop;

		if (calculationNeeded) {
			this.babylonRenderLoop();
			return true;
		}

		return false;
	}

	gameLoop(): void {
		this.updatePlayerPosition();
		this.scene.gravity = new BABYLON.Vector3(
			0,
			this.earthGravity /
				GlobalOptions.options.mainGame.performance.calculationsPerSecond,
			0
		);
		this.LAST_CALCULATION_GAME = new Date();
	}

	async openDatabases() {
		try {
			this.indexedDBDatabases.world =
				await this.mainProgram.indexedDBHelper.openDatabase(
					this.mainProgram.worldController.getWorldDBNameByInternalName(
						this.worldEntry.internalName
					),
					GlobalOptions.options.indexedDBDatabases.worldDB.DB_VERSION
				);
		} catch (error) {
			alert("Ein Fehler beim öffnen der Welt-Datenbank ist aufgetreten.");
		}
	}

	async buildMap(): Promise<void> {
		await this.world.loadChunksPlayerIsInRange(0, 0);
	}
	lookAroundUpdate(
		eventData: BABYLON.PointerInfo,
		eventState: BABYLON.EventState
	): void {
		if (!this.hasPointerLock) return;
		if (!this.player?.body) throw new Error("No body defined");
		// Check if the left mouse button is pressed (you can modify this condition as needed)

		// Get the change in mouse position (delta)
		const deltaX = eventData.event.movementX;
		const deltaY = eventData.event.movementY;

		// Adjust the rotation angles based on mouse movement
		const rotationSpeed = 0.002; // Adjust the rotation speed as needed
		this.player.body.wholeBody.rotation.y += deltaX * rotationSpeed; // Rotate the body horizontally
		let nextRotation =
			this.player.body.head.rotation.x + deltaY * rotationSpeed; // Rotate the head vertically
		// Limit the head rotation to prevent it from looking too far up or down
		const maxHeadRotationX = BABYLON.Tools.ToRadians(90); // Adjust the maximum vertical rotation angle
		this.player.body.head.rotation.x = Math.min(
			Math.max(nextRotation, -maxHeadRotationX),
			maxHeadRotationX
		);
	}

	addListenToMouseToLookAround() {
		this.scene.onPointerObservable.add(this.lookAroundUpdate.bind(this));
	}
}
