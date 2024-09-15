import LoadedMusic from "./LoadedMusic";
import { LoadedMusicOptions } from "./LoadedMusic";
import GlobalOptions from "../../../settings/GlobalOptions";

export type LoadedMusicWithBufferAbilityClassOptions = {
	bufferable?: boolean;
	removeFromBufferIfNotUsedForSeconds?: number | boolean;
};

export type LoadedSoundWithBufferAbilityOptions =
	LoadedMusicWithBufferAbilityClassOptions & LoadedMusicOptions;

export default class LoadedMusicdWithBufferAbility extends LoadedMusic {
	bufferable?: boolean;
	lastUsed?: Date;
	removeFromBufferIfNotUsedForSeconds: number | boolean;
	constructor(options: LoadedSoundWithBufferAbilityOptions) {
		super({
			babylonSoundObject: options.babylonSoundObject,
			musicInstance: options.musicInstance,
		});
		this.bufferable =
			options.bufferable ?? GlobalOptions.options.musicContainer.bufferMusic;
		this.removeFromBufferIfNotUsedForSeconds =
			options.removeFromBufferIfNotUsedForSeconds ??
			GlobalOptions.options.musicContainer.removeFromBufferIfNotUsedForSeconds;
	}

	play() {
		this.setLastUsed(), super.play();
	}

	setLastUsed(date: Date = new Date()) {
		this.lastUsed = date;
	}
}
