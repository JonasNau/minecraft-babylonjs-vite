import LoadedSound from "./LoadedSound";
import { LoadedSoundOptions } from "./LoadedSound";
import GlobalOptions from "../../../settings/GlobalOptions";

export type LoadeSoundWithBufferAbilityClassOptions = {
	bufferable?: boolean;
	removeFromBufferIfNotUsedForSeconds?: number | boolean;
};

export type LoadedSoundWithBufferAbilityOptions =
	LoadeSoundWithBufferAbilityClassOptions & LoadedSoundOptions;

export default class LoadedSoundWithBufferAbility extends LoadedSound {
	bufferable?: boolean;
	lastUsed?: Date;
	removeFromBufferIfNotUsedForSeconds: number | boolean;
	constructor(options: LoadedSoundWithBufferAbilityOptions) {
		super({
			babylonSoundObject: options.babylonSoundObject,
			soundInstance: options.soundInstance,
		});
		this.bufferable =
			options.bufferable ?? GlobalOptions.options.soundContainer.bufferSounds;
		this.removeFromBufferIfNotUsedForSeconds =
			options.removeFromBufferIfNotUsedForSeconds ??
			GlobalOptions.options.soundContainer.removeFromBufferIfNotUsedForSeconds;
	}

	play() {
		this.setLastUsed(), super.play();
		this.babylonSoundObject.onEndedObservable.addOnce(() => this.setLastUsed());
	}

	setLastUsed(date?: Date) {
		this.lastUsed = date ?? new Date();
	}
}
