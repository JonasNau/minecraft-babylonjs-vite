import * as BABYLON from "@babylonjs/core";
import SoundInstance from "./SoundInstance";

export type LoadedSoundOptions = {
	babylonSoundObject: BABYLON.Sound;
	soundInstance: SoundInstance;
};

export default class LoadedSound {
	babylonSoundObject: BABYLON.Sound;
	soundInstance: SoundInstance;
	constructor(options: LoadedSoundOptions) {
		this.babylonSoundObject = options.babylonSoundObject;
		this.soundInstance = options.soundInstance;
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
