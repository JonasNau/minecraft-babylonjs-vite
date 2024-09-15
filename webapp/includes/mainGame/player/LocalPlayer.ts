import { GAMEMODE } from "../../GAMEMODE";
import * as BABYLON from "@babylonjs/core";
import * as BABYLON_GUI from "@babylonjs/gui";
import PlayerPosition from "./PlayerPosition";
import Player from "./Player";
import Hotbar from "../../hotbar";
import InputRequest from "./InputRequest";
import InputRequestWithKeyBindings from "./InputRequestWithKeyBindings";
import { Minecraft } from "../../Minecraft";
import MainGame from "../MainGame";
import PlayerBody from "./PlayerBody";
import { MemoryHelperEventListeners } from "j-memoryhelper-functions";

export default class LocalPlayer extends Player {
	mainProgram: Minecraft;
	mainGame: MainGame;
	camera: BABYLON.UniversalCamera;
	gamemode = GAMEMODE.SURVIVAL;
	speed: number;
	scene: BABYLON.Scene;
	canvas: HTMLCanvasElement;
	gui: BABYLON_GUI.AdvancedDynamicTexture;
	guiElements: {
		hotbar: Hotbar;
		crosshair: BABYLON_GUI.Rectangle;
	};
	inventory: {
		hotbar: [];
		backpack: [];
	};
	body?: PlayerBody;

	memoryHelperEventListeners: MemoryHelperEventListeners;

	readonly WHEEL_EVENT_LISTENER_NAME = "Wheel";

	readonly JUMP_HEIGHT = 1.0; // Adjust the jump height as needed
	isJumping = false; // Flag to track if the player is currently jumping
	jumpStartY?: number; // Store the initial height for jumping

	listenforInputs: boolean;

	inputRequests?: {
		FORWARD: InputRequestWithKeyBindings;
		BACKWARDS: InputRequestWithKeyBindings;
		LEFT: InputRequestWithKeyBindings;
		RIGHT: InputRequestWithKeyBindings;
		JUMP: InputRequestWithKeyBindings;
		SNEAK: InputRequestWithKeyBindings;
	};

	constructor(options: {
		mainProgram: Minecraft;
		mainGame: MainGame;
		position?: PlayerPosition;
		facingDirection?: BABYLON.Vector3;
		playerName: string;
		scene: BABYLON.Scene;
		canvas: HTMLCanvasElement;
	}) {
		super({
			position: options.position,
			facingDirection: options.facingDirection,
			playerName: options.playerName,
		});
		this.mainProgram = options.mainProgram;
		this.mainGame = options.mainGame;
		this.canvas = options.canvas;
		this.scene = options.scene;
		this.memoryHelperEventListeners = new MemoryHelperEventListeners();

		//Set Camera
		this.camera = this.createPlayerCamera();
		this.scene.setActiveCameraById(this.camera.id);

		this.listenforInputs = false;

		this.gui =
			BABYLON_GUI.AdvancedDynamicTexture.CreateFullscreenUI("localPlayerGUI");

		this.speed = 0.005;
		this.guiElements = {
			hotbar: new Hotbar(this.gui, 9),
			crosshair: this.createCrosshair(),
		};

		//Init inventory
		this.inventory = {
			hotbar: [],
			backpack: [],
		};

		this.createPlayerBody();
		this.attachCameraToBody();
		this.setGameMode(this.gamemode);
	}

	dispose() {
		this.memoryHelperEventListeners.freeUpAllMemory();
	}

	createPlayerBody() {
		this.body = new PlayerBody(this.scene);
		this.body.wholeBody.position.x = 0;
		this.body.wholeBody.position.z = 0;
		this.body.wholeBody.position.y = 2;
	}

	attachCameraToBody() {
		if (!this.body) {
			throw new Error("The player has no body");
		}
		this.camera.parent = this.body.head;
	}

	setInputRequestKeyBindings() {
		this.inputRequests = {
			FORWARD: new InputRequestWithKeyBindings(
				this.mainProgram.settings.controlsSettings.keyBindings.FORWARD
			),
			BACKWARDS: new InputRequestWithKeyBindings(
				this.mainProgram.settings.controlsSettings.keyBindings.BACKWARDS
			),
			LEFT: new InputRequestWithKeyBindings(
				this.mainProgram.settings.controlsSettings.keyBindings.LEFT
			),
			RIGHT: new InputRequestWithKeyBindings(
				this.mainProgram.settings.controlsSettings.keyBindings.RIGHT
			),
			JUMP: new InputRequestWithKeyBindings(
				this.mainProgram.settings.controlsSettings.keyBindings.JUMP
			),
			SNEAK: new InputRequestWithKeyBindings(
				this.mainProgram.settings.controlsSettings.keyBindings.SNEAK
			),
		};
	}

	listenToMouseWheel() {
		this.memoryHelperEventListeners.addAndRegisterEventListener({
			type: "wheel",
			name: this.WHEEL_EVENT_LISTENER_NAME,
			ownerOfEventListener: window,
			eventListenerFunction: (event) => {
				if (!(event instanceof WheelEvent)) return;
				if (event.deltaY < 0) {
					//Mouse wheel down
					this.guiElements.hotbar.setPrevious();
				} else {
					this.guiElements.hotbar.setNext();
				}
			},
		});
	}

	stopListenToMouseWheel() {
		this.memoryHelperEventListeners.removeEventListenerByName(
			this.WHEEL_EVENT_LISTENER_NAME
		);
	}

	setGameMode(gamemode: GAMEMODE): boolean {
		let success = false;

		this.guiElements.crosshair.isVisible = false;
		//this.guiElements.hotbar.isVisible = false;

		this.stopListenToMouseWheel();

		console.log("Changing GAMEMODE to:", gamemode);
		switch (gamemode) {
			case GAMEMODE.SURVIVAL:
				this.guiElements.crosshair.isVisible = true;
				this.guiElements.hotbar.guiElement.isVisible = true;

				this.listenToMouseWheel();
				success = true;
				break;
			case GAMEMODE.CREATIVE:
				console.error(
					"The GAMEMODE is not implemented yet.",
					GAMEMODE.CREATIVE
				);
				this.guiElements.crosshair.isVisible = true;
				this.guiElements.hotbar.guiElement.isVisible = true;

				success = true;
				break;
			case GAMEMODE.SEPECTATOR:
				this.guiElements.crosshair.isVisible = true;
				this.guiElements.hotbar.guiElement.isVisible = true;
				this.listenToMouseWheel();
				success = true;
				break;
		}

		this.gamemode = gamemode;

		return success;
	}

	createPlayerCamera(): BABYLON.UniversalCamera {
		this.removeCameraFromScene();
		let camera = new BABYLON.UniversalCamera(
			"player-camera",
			new BABYLON.Vector3(0, 1, 0),
			this.scene
		);
		//camera.attachControl(this.canvas, true);
		camera.minZ = 0.1;
		camera.maxZ = 10000;
		return camera;
	}

	createCrosshair(): BABYLON_GUI.Rectangle {
		const CROSSHAIR_HEIGHT = 20;
		const CROSSHAIR_WIDTH = 20;
		const CROSSHAIR_THICKNESS = 2;
		const CROSSHAIR_COLOR = "white";

		let crosshairContainer = new BABYLON_GUI.Rectangle("crosshair");
		crosshairContainer.widthInPixels = CROSSHAIR_WIDTH;
		crosshairContainer.heightInPixels = CROSSHAIR_HEIGHT;
		//crosshairContainer.background = "black";
		crosshairContainer.thickness = 0;
		crosshairContainer.horizontalAlignment =
			BABYLON_GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		crosshairContainer.verticalAlignment =
			BABYLON_GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		this.gui.addControl(crosshairContainer);

		// Vertical line
		let verticalLine = new BABYLON_GUI.Rectangle();
		verticalLine.widthInPixels = CROSSHAIR_THICKNESS;
		verticalLine.heightInPixels = CROSSHAIR_HEIGHT;
		verticalLine.color = CROSSHAIR_COLOR;
		verticalLine.background = CROSSHAIR_COLOR;
		verticalLine.horizontalAlignment =
			BABYLON_GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		verticalLine.verticalAlignment =
			BABYLON_GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		crosshairContainer.addControl(verticalLine);

		// Horizontal line
		let horizontalLine = new BABYLON_GUI.Rectangle();
		horizontalLine.widthInPixels = CROSSHAIR_WIDTH;
		horizontalLine.heightInPixels = CROSSHAIR_THICKNESS;
		horizontalLine.color = CROSSHAIR_COLOR;
		horizontalLine.background = CROSSHAIR_COLOR;
		horizontalLine.horizontalAlignment =
			BABYLON_GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		horizontalLine.verticalAlignment =
			BABYLON_GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		crosshairContainer.addControl(horizontalLine);

		crosshairContainer.isVisible = false;

		return crosshairContainer;
	}

	removeCameraFromScene(): boolean {
		let success = false;
		if (this.camera == null) return true;

		console.log("Camera will be removed", this.camera);
		this.scene.removeCamera(this.camera);
		success = true;

		return success;
	}

	setListenForInputs(listen: boolean) {
		this.listenforInputs = listen;
	}

	updateInputRequest() {
		if (!this.listenforInputs) return;
		if (!this.inputRequests) return;

		for (const inputRequest of Object.values(this.inputRequests)) {
			inputRequest.updateRequestState(this.mainProgram.inputController);
		}
	}
}
