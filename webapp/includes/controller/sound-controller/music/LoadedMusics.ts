import LoadedMusic from "./LoadedMusic";
import { removeFromArray } from "j-object-functions";

export default class LoadedMusics {
	debug = true;
	loadedMusicList: Array<LoadedMusic>;
	constructor() {
		this.loadedMusicList = [];
	}

	add(loadedSound: LoadedMusic) {
		this.loadedMusicList.push(loadedSound);
	}

	unload(loadedSound: LoadedMusic) {
		if (this.debug)
			console.debug(
				"Unloading music:",
				loadedSound.musicInstance.soundDisplayName,
				loadedSound
			);
		loadedSound.babylonSoundObject.dispose();
		this.loadedMusicList = removeFromArray(this.loadedMusicList, loadedSound);
	}

	unloadAll() {
		for (let loadedSound of this.loadedMusicList) {
			this.unload(loadedSound);
		}
	}
}
