import * as BABYLON from "@babylonjs/core";
import WebGPUNotSupportedError from "../errors/settings/WebGPUNotSupportedError";
import GlobalOptions from "./GlobalOptions";
export default class Video_Settings {
	renderDistance: number;
	simulationDistance: number;
	maxFPS: number;
	menuFPS: number;
	brightness: number;
	webGPUEnabled = false;
	constructor() {
		this.renderDistance =
			GlobalOptions.options.settings.standardSettings.videoSettings.renderDistance;
		this.simulationDistance =
			GlobalOptions.options.settings.standardSettings.videoSettings.simulationDistance;
		this.maxFPS =
			GlobalOptions.options.settings.standardSettings.videoSettings.maxFPS;
		this.brightness =
			GlobalOptions.options.settings.standardSettings.videoSettings.brightness;
		this.menuFPS =
			GlobalOptions.options.settings.standardSettings.videoSettings.menuFPS;
		this.setWebGPUEnabled(false);
	}

	setRenderDistance(number: number) {
		if (number <= 0 || number > 40) {
			throw new Error(
				"The render distance can be only a value between 1 and 40"
			);
		}
		this.renderDistance = number;
	}

	setSimulationDistance(number: number) {
		if (number <= 0 || number > 40) {
			throw new Error(
				"The simulation distance can be only a value between 1 and 40"
			);
		}
		this.simulationDistance = number;
	}

	setMaxFPS(number: number) {
		if (number <= 0 || number > 240) {
			throw new Error("The maxFPS can be only a value between 1 and 240");
		}
		this.maxFPS = number;
	}

	setMenuFPS(number: number) {
		if (number <= 0 || number > 120) {
			throw new Error("The menuFPS can be only a value between 1 and 120");
		}
		this.menuFPS = number;
	}

	setBrightnes(number: number) {
		if (number < 0 || number > 1) {
			throw new Error("The brightness can be only a value between 0 and 1");
		}
		this.brightness = number;
	}

	async setWebGPUEnabled(boolean: boolean) {
		if (boolean && !(await BABYLON.WebGPUEngine.IsSupportedAsync)) {
			throw new WebGPUNotSupportedError(
				"WebGPU is not supported on your hardware."
			);
		}
		this.webGPUEnabled = boolean;
	}

	getWebGPUIsEnabled(engine: BABYLON.Engine): boolean {
		return engine instanceof BABYLON.WebGPUEngine;
	}
}
