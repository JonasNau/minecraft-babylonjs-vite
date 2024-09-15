import { Minecraft } from "../../../Minecraft";
import { ESoundType } from "../ESoundType";
import LoadedSound from "./LoadedSound";
import SoundInstance from "./SoundInstance";

export default class SoundVolumeSetter {
	debug = true;
	mainProgram: Minecraft;
	constructor(mainProgram: Minecraft) {
		this.mainProgram = mainProgram;
	}

	calculateVolumeForSoundConsideringGlobalVolume(sound: SoundInstance) {
		let globalVolume = this.mainProgram.settings.musicSettings.masterVolume;
		let soundVolume = this.getVolumeForSound(sound);
		return soundVolume * globalVolume;
	}

	getVolumeForSound(sound: SoundInstance) {
		let currentSoundTypeVolume = 1;
		switch (sound.soundType) {
			case ESoundType.BLOCKS:
				currentSoundTypeVolume =
					this.mainProgram.settings.musicSettings.blocksVolume;
				break;
			case ESoundType.FRIENDLY_CREATURES:
				currentSoundTypeVolume =
					this.mainProgram.settings.musicSettings.friendlyCreaturesVolume;
				break;
			case ESoundType.HOSTILE_CREATURES:
				currentSoundTypeVolume =
					this.mainProgram.settings.musicSettings.hostileCreaturesVolume;
				break;
			case ESoundType.JUKEBOX_AND_NOTEBLOCKS:
				currentSoundTypeVolume =
					this.mainProgram.settings.musicSettings.jukeboxAndNoteBlocksVolume;
				break;
			case ESoundType.PLAYERS:
				currentSoundTypeVolume =
					this.mainProgram.settings.musicSettings.playersVolume;
				break;
			case ESoundType.SPEECH:
				currentSoundTypeVolume =
					this.mainProgram.settings.musicSettings.voiceSpeechVolume;
				break;
			case ESoundType.UI:
				currentSoundTypeVolume =
					this.mainProgram.settings.musicSettings.uiVolume;
				break;
			case ESoundType.WEATHER:
				currentSoundTypeVolume =
					this.mainProgram.settings.musicSettings.weatherVolume;
				break;
			default:
				console.error("The sound type does not exist");
				currentSoundTypeVolume = 1;
		}

		return currentSoundTypeVolume;
	}

	updateAllSoundVolumes() {
		for (const loadedSound of this.mainProgram.soundContainer.soundLoader
			.customLoadedSounds.loadedSoundsList) {
			this.updateSoundVolume(loadedSound);
		}
	}

	updateSoundVolume(loadedSound: LoadedSound) {
		let volume = this.calculateVolumeForSoundConsideringGlobalVolume(
			loadedSound.soundInstance
		);
		loadedSound.babylonSoundObject.setVolume(volume);
	}
}
