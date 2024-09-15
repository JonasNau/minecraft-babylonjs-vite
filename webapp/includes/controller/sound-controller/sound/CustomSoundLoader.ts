import * as BABYLON from "@babylonjs/core";
import LoadedSound from "./LoadedSound";
import SoundCreator from "./SoundCreator";
import SoundInstance from "./SoundInstance";
import LoadedSounds from "./LoadedSounds";

export default class CustomSoundLoader {
	soundCreator: SoundCreator;
	soundScene: BABYLON.Scene;
	customLoadedSounds: LoadedSounds;
	constructor(soundCreator: SoundCreator, scene: BABYLON.Scene) {
		this.soundCreator = soundCreator;
		this.soundScene = scene;
		this.customLoadedSounds = new LoadedSounds();
	}

	async loadAndWait(soundInstance: SoundInstance): Promise<LoadedSound> {
		let newSound =
			await this.soundCreator.createAndWaitForLoadedBabylonSoundInstance(
				soundInstance,
				this.soundScene
			);
		let newLoadedSound = new LoadedSound({
			babylonSoundObject: newSound,
			soundInstance: soundInstance,
		});
		this.customLoadedSounds.add(newLoadedSound);
		return newLoadedSound;
	}

	load(soundInstance: SoundInstance): LoadedSound {
		let newSound = this.soundCreator.createBabylonSoundInstance(
			soundInstance,
			this.soundScene
		);
		let newLoadedSound = new LoadedSound({
			babylonSoundObject: newSound,
			soundInstance: soundInstance,
		});
		this.customLoadedSounds.add(newLoadedSound);
		return newLoadedSound;
	}

	unload(loadedSound: LoadedSound) {
		this.customLoadedSounds.unload(loadedSound);
	}

	unloadAll() {
		this.customLoadedSounds.unloadAll();
	}
}
