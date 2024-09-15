import * as BABYLON from "@babylonjs/core";
import * as BABYLON_GUI from "@babylonjs/gui";

export default class GUI {
	guiContainer: BABYLON_GUI.AdvancedDynamicTexture;
	babylonEngine: BABYLON.Engine;
	scene: BABYLON.Scene;

	constructor(
		babylonEngine: BABYLON.Engine,
		guiContainerName: string,
		scene: BABYLON.Scene
	) {
		this.babylonEngine = babylonEngine;
		this.scene = scene;
		this.guiContainer = BABYLON_GUI.AdvancedDynamicTexture.CreateFullscreenUI(
			guiContainerName,
			undefined,
			this.scene
		);
	}

	show() {
		this.guiContainer.rootContainer.isVisible = true;
		this.guiContainer.rootContainer.isEnabled = true;
	}

	hide() {
		this.guiContainer.rootContainer.isVisible = false;
		this.guiContainer.rootContainer.isEnabled = false;
	}

	disable() {
		this.guiContainer.rootContainer.isEnabled = false;
	}

	enable() {
		this.guiContainer.rootContainer.isEnabled = true;
	}

	setDebugLayerVisibility(debugOn = false) {
		if (debugOn) {
			this.scene.debugLayer.show({ overlay: true });
		} else {
			this.scene.debugLayer.hide();
		}
	}
}
