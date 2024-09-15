import * as BABYLON from "@babylonjs/core";
import * as BABYLON_GUI from "@babylonjs/gui";
import { MemoryHelperEventListeners } from "j-memoryhelper-functions";
import SoundInstance from "../controller/sound-controller/sound/SoundInstance";
import Keystroke from "../input-control/keystroke/KeyStroke";

export default abstract class GUI_Seperate {
	guiContainer?: BABYLON_GUI.AdvancedDynamicTexture | null;
	camera?: BABYLON.Camera;
	scene?: BABYLON.Scene | null;
	desiredFps = 60;
	LAST_RENDER?: Date | null;
	deltaTimeLastRender?: number | null;
	guiContainerName: string;
	renderFunction?: () => void;
	memoryHelpers: { eventListeners: MemoryHelperEventListeners };
	engine: BABYLON.Engine;

	constructor(engine: BABYLON.Engine, guiContainerName: string) {
		this.engine = engine;
		this.guiContainerName = guiContainerName;
		this.memoryHelpers = { eventListeners: new MemoryHelperEventListeners() };

		this.scene = this.createScene();
		this.guiContainer = this.createGUIContainer(guiContainerName, this.scene);
	}

	create(guiContainerName?: string) {
		this.scene = this.createScene();
		this.guiContainer = this.createGUIContainer(
			guiContainerName ?? this.guiContainerName,
			this.scene
		);
	}

	createGUIContainer(guiContainerName: string, scene: BABYLON.Scene) {
		return BABYLON_GUI.AdvancedDynamicTexture.CreateFullscreenUI(
			guiContainerName,
			undefined,
			scene
		);
	}

	createScene(): BABYLON.Scene {
		let scene = new BABYLON.Scene(this.engine);

		let camera = new BABYLON.FreeCamera(
			`camera_${this.guiContainerName}`,
			new BABYLON.Vector3(0, 0, 0),
			scene
		);
		this.camera = camera;

		return scene;
	}

	createCamera(scene: BABYLON.Scene): BABYLON.FreeCamera {
		let camera = new BABYLON.FreeCamera(
			`camera_${this.guiContainerName}`,
			new BABYLON.Vector3(0, 0, 0),
			scene
		);
		return camera;
	}

	startGUI() {
		if (!this.guiContainer) this.create();
		if (!this.guiContainer) throw new Error("No guiContainer defined");

		this.guiContainer.rootContainer.isVisible = true;
		this.guiContainer.rootContainer.isEnabled = true;
		this.runRenderLoop();
	}

	exitGUI() {
		if (!this.scene) throw new Error("No scene defined");

		this.stopRenderLoop();
		this.memoryHelpers.eventListeners.freeUpAllMemory();
		this.clearControls();

		this.scene.dispose();

		delete this.guiContainer;
		this.guiContainer = undefined;
		delete this.camera;
		this.camera = undefined;
		delete this.scene;
		this.scene = undefined;
		delete this.LAST_RENDER;
		this.LAST_RENDER = undefined;
		delete this.deltaTimeLastRender;
		this.deltaTimeLastRender = undefined;
	}

	hide() {
		if (!this.guiContainer) throw new Error("No guiContainerDefined");

		this.guiContainer.rootContainer.isVisible = false;
		this.guiContainer.rootContainer.isEnabled = false;
		this.stopRenderLoop();
	}

	disable() {
		if (!this.guiContainer) throw new Error("No guiContainerDefined");

		this.guiContainer.rootContainer.isEnabled = false;
	}

	enable() {
		if (!this.guiContainer) throw new Error("No guiContainerDefined");

		this.guiContainer.rootContainer.isEnabled = true;
	}

	runRenderLoop() {
		let renderFunction = () => {
			this.requestRender();
		};
		this.engine.runRenderLoop(renderFunction);
		this.renderFunction = renderFunction;
	}

	stopRenderLoop() {
		if (!this.renderFunction) {
			console.warn(
				`stopRenderLoop() was called on the GUI ${GUI_Seperate.name} but there is no render function active`
			);
			return;
		}
		this.engine.stopRenderLoop(this.renderFunction);
	}

	requestRender() {
		if (this.LAST_RENDER == null) {
			this.render();
			return;
		}

		let now = new Date();
		this.deltaTimeLastRender = now.getTime() - this.LAST_RENDER.getTime();

		let timeInMillisecondsBetweenNextRender = 1000 / this.desiredFps;
		let calculationNeeded =
			this.deltaTimeLastRender >= timeInMillisecondsBetweenNextRender;

		if (calculationNeeded) {
			this.render();
			return true;
		}

		return false;
	}

	render() {
		if (!this.scene) throw new Error("No scene defined");
		this.LAST_RENDER = new Date();
		this.scene.render();
	}

	setDebugLayerVisibility(debugOn = false) {
		if (!this.scene) throw new Error("No scene defined");

		if (debugOn) {
			this.scene.debugLayer.show({ overlay: true });
		} else {
			this.scene.debugLayer.hide();
		}
	}

	clearControls() {
		if (!this.guiContainer) throw new Error("No guiContainerDefined");
		// remove all controls from the texture
		while (this.guiContainer.rootContainer.children.length > 0) {
			this.guiContainer.removeControl(
				this.guiContainer.rootContainer.children[0]
			);
		}
	}

	clearScene() {
		if (!this.scene) throw new Error("No scene defined");
		this.exitGUI();
		this.create(this.guiContainerName);
		this.startGUI();
	}
}
