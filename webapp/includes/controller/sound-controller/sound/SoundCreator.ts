/* eslint-disable @typescript-eslint/ban-types */
import * as BABYLON from "@babylonjs/core";
import SoundInstance from "./SoundInstance";
import SoundLibrary from "./SoundLibrary";
import RessourcePackController from "../../ressourcepack/RessourcePackController";
import { ERessource } from "../../ressourcepack/ERessource";

export default class SoundCreator {
	ressourcePackController: RessourcePackController;

	constructor(ressourcePackController: RessourcePackController) {
		this.ressourcePackController = ressourcePackController;
	}

	createAndWaitForLoadedBabylonSoundInstance(
		sound: SoundInstance,
		scene: BABYLON.Scene | null,
		babylonSoundOptions?: BABYLON.ISoundOptions,
		callback?: Function
	): Promise<BABYLON.Sound> {
		return new Promise(async (resolve, reject) => {
			let soundURL = await this.ressourcePackController.getFullPathToRessource(
				sound,
				`${SoundLibrary.getRelativePathToSound(sound)}/${sound.soundFileName}`
			);
			if (callback) {
				let soundInstance: BABYLON.Sound = new BABYLON.Sound(
					`sound_${sound.babylonName}`,
					soundURL,
					scene,
					() => {
						callback();
						resolve(soundInstance);
					},
					babylonSoundOptions
				);
				return;
			}
			let soundInstance: BABYLON.Sound = new BABYLON.Sound(
				`sound_${sound.babylonName}`,
				soundURL,
				scene,
				() => {
					resolve(soundInstance);
				},
				babylonSoundOptions
			);
		});
	}

	async createBabylonSoundInstance(
		sound: SoundInstance,
		scene: BABYLON.Scene | null,
		babylonSoundOptions?: BABYLON.ISoundOptions,
		callback?: Function
	): Promise<BABYLON.Sound> {
		let soundURL = await this.ressourcePackController.getFullPathToRessource(
			sound,
			`${SoundLibrary.getRelativePathToSound(sound)}/${sound.soundFileName}`
		);
		if (callback) {
			return new BABYLON.Sound(
				`sound_${sound.babylonName}`,
				soundURL,
				scene,
				() => {
					callback();
				},
				babylonSoundOptions
			);
		}
		return new BABYLON.Sound(
			`sound_${sound.babylonName}`,
			soundURL,
			scene,
			undefined,
			babylonSoundOptions
		);
	}
}
