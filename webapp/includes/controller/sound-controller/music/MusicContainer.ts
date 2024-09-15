import * as BABYLON from "@babylonjs/core";
import LoadedMusicdWithBufferAbility, {
	LoadedMusicWithBufferAbilityClassOptions,
} from "./LoadedMusicWithBufferableAbility";
import MusicCreator from "./MusicCreator";
import MusicLoader from "./MusicLoader";
import MusicInstance from "./MusicInstance";
import MusicVolumeSetter from "./MusicVolumeSetter";
import { Minecraft } from "../../../Minecraft";

export default class MusicContainer {
	mainProgram: Minecraft;
	scene: BABYLON.Scene;
	musicLoader: MusicLoader;
	musicCreator: MusicCreator;
	musicVolumeSetter: MusicVolumeSetter;

	constructor(mainProgram: Minecraft, scene: BABYLON.Scene) {
		this.mainProgram = mainProgram;
		this.scene = scene;

		this.musicCreator = new MusicCreator();
		this.musicLoader = new MusicLoader(this.musicCreator, this.scene);
		this.musicVolumeSetter = new MusicVolumeSetter(this.mainProgram);
	}

	async playAndDispose(soundInstance: MusicInstance) {
		return new Promise(async (resolve, reject) => {
			let sound = await this.getLoadedMusicFromSoundInstance(soundInstance);
			sound.babylonSoundObject.onEndedObservable.addOnce(() => {
				this.musicLoader.unload(sound);
				resolve(true);
			});
			sound.play();
		});
	}

	/**
	 * @description Tries to find an existing sound instance that is already loaded and if not it creates one and plays it
	 * @param soundInstance
	 * @param options
	 */
	async playMusicBySoundInstance(
		soundInstance: MusicInstance,
		options?: LoadedMusicWithBufferAbilityClassOptions
	) {
		let sound = await this.getLoadedMusicFromSoundInstance(
			soundInstance,
			options
		);
		this.musicVolumeSetter.updateMusicVolume(sound);
		sound.play();
	}

	async getLoadedMusicFromSoundInstance(
		soundInstance: MusicInstance,
		options?: LoadedMusicWithBufferAbilityClassOptions
	): Promise<LoadedMusicdWithBufferAbility> {
		let foundSound = this.musicLoader.customLoadedSounds.loadedMusicList.find(
			(current) => {
				return current.musicInstance === soundInstance;
			}
		);
		if (!foundSound) {
			foundSound = await this.loadMusicAndWaitByMusicInstance(
				soundInstance,
				options
			);
			this.musicVolumeSetter.updateMusicVolume(foundSound);
		}
		return foundSound as LoadedMusicdWithBufferAbility;
	}

	/**
	 * @description Load a sound and wait for it to be loaded
	 * @param soundInstance
	 * @param options
	 * @returns
	 */
	async loadMusicAndWaitByMusicInstance(
		soundInstance: MusicInstance,
		options?: LoadedMusicWithBufferAbilityClassOptions
	): Promise<LoadedMusicdWithBufferAbility> {
		let sound = await this.musicLoader.loadAndWaitBySoundInstance(
			soundInstance,
			options
		);
		this.musicVolumeSetter.updateMusicVolume(sound);

		return sound;
	}

	/**
	 * @description Load a sound and not wait for it to be loaded
	 * @param soundInstance
	 * @param options
	 * @returns
	 */
	loadMusicBySoundInstance(
		soundInstance: MusicInstance,
		options?: LoadedMusicWithBufferAbilityClassOptions
	) {
		let music = this.musicLoader.loadBySoundInstance(soundInstance, options);
		this.musicVolumeSetter.updateMusicVolume(music);
		return music;
	}

	unloadFromMusicInstance(soundInstance: MusicInstance) {
		let foundSounds =
			this.musicLoader.customLoadedSounds.loadedMusicList.filter((current) => {
				return current.musicInstance === soundInstance;
			});
		if (!foundSounds.length) return;
		for (let current of foundSounds) {
			this.musicLoader.unload(current as LoadedMusicdWithBufferAbility);
		}
	}

	unloadFromBabylonSoundInstance(sound: BABYLON.Sound) {
		let foundSounds =
			this.musicLoader.customLoadedSounds.loadedMusicList.filter((current) => {
				return current.babylonSoundObject === sound;
			});
		if (!foundSounds.length) return;
		for (let current of foundSounds) {
			this.musicLoader.customLoadedSounds.unload(current);
		}
	}

	unloadAll() {
		this.musicLoader.unloadAll();
	}

	destroy() {
		this.unloadAll();
		this.musicLoader.endBufferCleaner();
	}
}
