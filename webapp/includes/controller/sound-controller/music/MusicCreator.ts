/* eslint-disable @typescript-eslint/ban-types */
import * as BABYLON from "@babylonjs/core";
import MusicLibrary from "./MusicLibrary";
import MusicInstance from "./MusicInstance";
import { getPathToAssetsFolder } from "../../../helperFunctions/asset-functions";

export default class MusicCreator {
	constructor() {}

	createAndWaitForLoadedBabylonSoundInstance(
		music: MusicInstance,
		scene: BABYLON.Scene,
		babylonSoundOptions?: BABYLON.ISoundOptions,
		callback?: Function
	): Promise<BABYLON.Sound> {
		return new Promise((resolve, reject) => {
			if (callback) {
				let musicInstance: BABYLON.Sound = new BABYLON.Sound(
					`sound_muic_${music.babylonName}`,
					`${getPathToAssetsFolder()}/music/${MusicLibrary.getRelativePathToMusic(
						music
					)}/${music.soundFileName}`,
					scene,
					() => {
						callback();
						resolve(musicInstance);
					},
					babylonSoundOptions
				);
				return;
			}
			let musicInstance: BABYLON.Sound = new BABYLON.Sound(
				`sound_music_${music.babylonName}`,
				`${getPathToAssetsFolder()}/music/${MusicLibrary.getRelativePathToMusic(
					music
				)}/${music.soundFileName}`,
				scene,
				() => {
					resolve(musicInstance);
				},
				babylonSoundOptions
			);
		});
	}

	createBabylonSoundInstance(
		music: MusicInstance,
		scene: BABYLON.Scene,
		babylonSoundOptions?: BABYLON.ISoundOptions,
		callback?: Function
	): BABYLON.Sound {
		if (callback) {
			return new BABYLON.Sound(
				`sound_music_${music.babylonName}`,
				`${getPathToAssetsFolder()}/music/${MusicLibrary.getRelativePathToMusic(
					music
				)}/${music.soundFileName}`,
				scene,
				() => {
					callback();
				},
				babylonSoundOptions
			);
		}
		return new BABYLON.Sound(
			`sound_music_${music.babylonName}`,
			`${getPathToAssetsFolder()}/music/${MusicLibrary.getRelativePathToMusic(
				music
			)}/${music.soundFileName}`,
			scene,
			undefined,
			babylonSoundOptions
		);
	}
}
