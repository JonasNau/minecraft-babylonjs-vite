import LoadedSound from "./LoadedSound";
import { removeFromArray } from "j-object-functions";

export default class LoadedSounds {
	loadedSoundsList: Array<LoadedSound>;
	debug = true;
	constructor() {
		this.loadedSoundsList = [];
	}

	add(loadedSound: LoadedSound) {
		this.loadedSoundsList.push(loadedSound);
	}

	unload(loadedSound: LoadedSound) {
		if (this.debug)
			console.debug(
				"Unloading sound:",
				loadedSound.soundInstance.soundDisplayName,
				loadedSound
			);

		loadedSound.babylonSoundObject.dispose();
		this.loadedSoundsList = removeFromArray(
			this.loadedSoundsList,
			loadedSound,
			true
		);
	}

	unloadAll() {
		for (let loadedSound of this.loadedSoundsList) {
			this.unload(loadedSound);
		}
	}
}
