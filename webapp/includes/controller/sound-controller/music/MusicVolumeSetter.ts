import { Minecraft } from "../../../Minecraft";
import { ESoundType } from "../ESoundType";
import LoadedMusic from "./LoadedMusic";
import MusicInstance from "./MusicInstance";

export default class MusicVolumeSetter {
	debug = true;
	mainProgram: Minecraft;
	constructor(mainProgram: Minecraft) {
		this.mainProgram = mainProgram;
	}

	calculateVolumeForSoundConsideringGlobalVolume() {
		let globalVolume = this.mainProgram.settings.musicSettings.masterVolume;
		let soundVolume = this.getVolumeForMuic();
		return soundVolume * globalVolume;
	}

	getVolumeForMuic() {
		return this.mainProgram.settings.musicSettings.musicVolume;
	}

	updateAllMusicVolumes() {
		for (const loadedSound of this.mainProgram.musicContainer.musicLoader
			.customLoadedSounds.loadedMusicList) {
			this.updateMusicVolume(loadedSound);
		}
	}

	updateMusicVolume(loadedMusic: LoadedMusic) {
		let volume = this.calculateVolumeForSoundConsideringGlobalVolume();
		loadedMusic.babylonSoundObject.setVolume(volume);
	}
}
