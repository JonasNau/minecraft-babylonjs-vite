import * as BABYLON from "@babylonjs/core";
import BufferCleanerMusic from "./BufferCleanerMusic";
import LoadedMusic from "./LoadedMusic";
import LoadedMusics from "./LoadedMusics";
import MusicCreator from "./MusicCreator";
import MusicInstance from "./MusicInstance";
import LoadedMusicdWithBufferAbility, {
	LoadedMusicWithBufferAbilityClassOptions,
} from "./LoadedMusicWithBufferableAbility";

export default class MusicLoader {
	musicCreator: MusicCreator;
	soundScene: BABYLON.Scene;
	customLoadedSounds: LoadedMusics;
	bufferCleaner: BufferCleanerMusic;
	constructor(musicCreator: MusicCreator, scene: BABYLON.Scene) {
		this.musicCreator = musicCreator;
		this.soundScene = scene;
		this.customLoadedSounds = new LoadedMusics();
		this.bufferCleaner = new BufferCleanerMusic(
			() =>
				this.customLoadedSounds
					.loadedMusicList as LoadedMusicdWithBufferAbility[],
			this
		);
	}

	async loadAndWaitBySoundInstance(
		soundInstance: MusicInstance,
		options?: LoadedMusicWithBufferAbilityClassOptions
	): Promise<LoadedMusicdWithBufferAbility> {
		let newSound =
			await this.musicCreator.createAndWaitForLoadedBabylonSoundInstance(
				soundInstance,
				this.soundScene
			);
		let newLoadedSound = new LoadedMusicdWithBufferAbility({
			babylonSoundObject: newSound,
			musicInstance: soundInstance,
			...options,
		});
		this.customLoadedSounds.add(newLoadedSound);
		this.startBufferCleaner();
		return newLoadedSound;
	}

	loadBySoundInstance(
		soundInstance: MusicInstance,
		options?: LoadedMusicWithBufferAbilityClassOptions
	): LoadedMusic {
		let newSound = this.musicCreator.createBabylonSoundInstance(
			soundInstance,
			this.soundScene
		);
		let newLoadedSound = new LoadedMusicdWithBufferAbility({
			babylonSoundObject: newSound,
			musicInstance: soundInstance,
			...options,
		});
		this.customLoadedSounds.add(newLoadedSound);
		this.startBufferCleaner();
		return newLoadedSound;
	}

	unload(loadedSound: LoadedMusic) {
		this.customLoadedSounds.unload(loadedSound);
		if (!this.customLoadedSounds.loadedMusicList.length)
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
