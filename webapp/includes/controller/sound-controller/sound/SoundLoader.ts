import * as BABYLON from "@babylonjs/core";
import SoundCreator from "./SoundCreator";
import SoundInstance from "./SoundInstance";
import LoadedSounds from "./LoadedSounds";
import LoadedSoundWithBufferAbility, {
	LoadeSoundWithBufferAbilityClassOptions,
} from "./LoadedSoundWithBufferableAbility";
import BufferCleanerSounds from "./BufferCleanerSounds";

export default class SoundLoader {
	soundCreator: SoundCreator;
	soundScene: BABYLON.Scene;
	customLoadedSounds: LoadedSounds;
	bufferCleaner: BufferCleanerSounds;
	constructor(soundCreator: SoundCreator, scene: BABYLON.Scene) {
		this.soundCreator = soundCreator;
		this.soundScene = scene;
		this.customLoadedSounds = new LoadedSounds();
		this.bufferCleaner = new BufferCleanerSounds(
			() =>
				this.customLoadedSounds
					.loadedSoundsList as LoadedSoundWithBufferAbility[],
			this
		);
	}

	async loadAndWaitBySoundInstance(
		soundInstance: SoundInstance,
		options?: LoadeSoundWithBufferAbilityClassOptions
	): Promise<LoadedSoundWithBufferAbility> {
		let newSound =
			await this.soundCreator.createAndWaitForLoadedBabylonSoundInstance(
				soundInstance,
				this.soundScene
			);
		let newLoadedSound = new LoadedSoundWithBufferAbility({
			babylonSoundObject: newSound,
			soundInstance: soundInstance,
			...options,
		});
		this.customLoadedSounds.add(newLoadedSound);
		this.startBufferCleaner();
		return newLoadedSound;
	}

	loadBySoundInstance(
		soundInstance: SoundInstance,
		options?: LoadeSoundWithBufferAbilityClassOptions
	): LoadedSoundWithBufferAbility {
		let newSound = this.soundCreator.createBabylonSoundInstance(
			soundInstance,
			this.soundScene
		);
		let newLoadedSound = new LoadedSoundWithBufferAbility({
			babylonSoundObject: newSound,
			soundInstance: soundInstance,
			...options,
		});
		this.customLoadedSounds.add(newLoadedSound);
		this.startBufferCleaner();
		return newLoadedSound;
	}

	unload(loadedSound: LoadedSoundWithBufferAbility) {
		this.customLoadedSounds.unload(loadedSound);
		if (!this.customLoadedSounds.loadedSoundsList.length)
			this.endBufferCleaner();
	}

	unloadAll() {
		this.customLoadedSounds.unloadAll();
	}

	startBufferCleaner() {
		this.bufferCleaner.start();
	}

	endBufferCleaner() {
		this.bufferCleaner.end();
	}
}
