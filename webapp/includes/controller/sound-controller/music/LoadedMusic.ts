import * as BABYLON from "@babylonjs/core";
import MusicInstance from "./MusicInstance";

export type LoadedMusicOptions = {
	babylonSoundObject: BABYLON.Sound;
	musicInstance: MusicInstance;
};

export default class LoadedMusic {
	babylonSoundObject: BABYLON.Sound;
	musicInstance: MusicInstance;
	constructor(options: LoadedMusicOptions) {
		this.babylonSoundObject = options.babylonSoundObject;
		this.musicInstance = options.musicInstance;
	}

	play() {
		this.babylonSoundObject.play();
	}

	pause() {
		this.babylonSoundObject.pause();
	}

	stop() {
		this.babylonSoundObject.stop();
	}
}
