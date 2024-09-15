import * as BABYLON from "@babylonjs/core";
import SoundCreator from "./SoundCreator";
import SoundInstance from "./SoundInstance";
import LoadedSoundWithBufferAbility, {
	LoadeSoundWithBufferAbilityClassOptions,
} from "./LoadedSoundWithBufferableAbility";
import SoundLoader from "./SoundLoader";
import SoundVolumeSetter from "./SoundVolumeSetter";
import { Minecraft } from "../../../Minecraft";

export default class SoundContainer {
	mainProgram: Minecraft;
	scene: BABYLON.Scene;
	soundLoader: SoundLoader;
	soundCreator: SoundCreator;
	soundVolumeSetter: SoundVolumeSetter;

	constructor(mainProgram: Minecraft, scene: BABYLON.Scene) {
		this.mainProgram = mainProgram;
		this.scene = scene;
		this.soundCreator = new SoundCreator(
			this.mainProgram.ressourcePackController
		);
		this.soundLoader = new SoundLoader(this.soundCreator, this.scene);
		this.soundVolumeSetter = new SoundVolumeSetter(this.mainProgram);
	}

	async playAndDispose(soundInstance: SoundInstance) {
		return new Promise(async (resolve, reject) => {
			let sound = await this.getLoadedSoundFromSoundInstance(soundInstance);
			sound.babylonSoundObject.onEndedObservable.addOnce(() => {
				this.soundLoader.unload(sound);
				resolve(true);
			});
			this.soundVolumeSetter.updateSoundVolume(sound);
			sound.play();
		});
	}

	/**
	 * @description Tries to find an existing sound instance that is already loaded and if not it creates one and plays it
	 * @param soundInstance
	 * @param options
	 */
	async playSoundBySoundInstance(
		soundInstance: SoundInstance,
		options?: LoadeSoundWithBufferAbilityClassOptions
	) {
		let sound = await this.getLoadedSoundFromSoundInstance(
			soundInstance,
			options
		);
		this.soundVolumeSetter.updateSoundVolume(sound);
		sound.play();
	}

	async getLoadedSoundFromSoundInstance(
		soundInstance: SoundInstance,
		options?: LoadeSoundWithBufferAbilityClassOptions
	): Promise<LoadedSoundWithBufferAbility> {
		let foundSound = this.soundLoader.customLoadedSounds.loadedSoundsList.find(
			(current) => {
				return current.soundInstance === soundInstance;
			}
		);
		if (!foundSound) {
			foundSound = await this.loadSoundAndWaitBySoundInstance(
				soundInstance,
				options
			);
			this.soundVolumeSetter.updateSoundVolume(foundSound);
		}
		return foundSound as LoadedSoundWithBufferAbility;
	}

	/**
	 * @description Load a sound and wait for it to be loaded
	 * @param soundInstance
	 * @param options
	 * @returns
	 */
	async loadSoundAndWaitBySoundInstance(
		soundInstance: SoundInstance,
		options?: LoadeSoundWithBufferAbilityClassOptions
	): Promise<LoadedSoundWithBufferAbility> {
		let sound = await this.soundLoader.loadAndWaitBySoundInstance(
			soundInstance,
			options
		);
		this.soundVolumeSetter.updateSoundVolume(sound);
		return sound;
	}

	/**
	 * @description Load a sound and not wait for it to be loaded
	 * @param soundInstance
	 * @param options
	 * @returns
	 */
	loadSoundBySoundInstance(
		soundInstance: SoundInstance,
		options?: LoadeSoundWithBufferAbilityClassOptions
	) {
		let sound = this.soundLoader.loadBySoundInstance(soundInstance, options);
		this.soundVolumeSetter.updateSoundVolume(sound);
		return sound;
	}

	unloadFromSoundInstance(soundInstance: SoundInstance) {
		let foundSounds =
			this.soundLoader.customLoadedSounds.loadedSoundsList.filter((current) => {
				return current.soundInstance === soundInstance;
			});
		if (!foundSounds.length) return;
		for (let current of foundSounds) {
			this.soundLoader.unload(current as LoadedSoundWithBufferAbility);
		}
	}

	unloadFromBabylonSoundInstance(sound: BABYLON.Sound) {
		let foundSounds =
			this.soundLoader.customLoadedSounds.loadedSoundsList.filter((current) => {
				return current.babylonSoundObject === sound;
			});
		if (!foundSounds.length) return;
		for (let current of foundSounds) {
			this.soundLoader.customLoadedSounds.unload(current);
		}
	}

	unloadAll() {
		this.soundLoader.unloadAll();
	}

	destroy() {
		this.unloadAll();
		this.soundLoader.endBufferCleaner();
	}
}
