import { MemoryHelperIntervals } from "j-memoryhelper-functions";
import { MemoryHelperTimeouts } from "j-memoryhelper-functions";
import GlobalOptions from "../../../settings/GlobalOptions";
import LoadedSoundWithBufferAbility from "./LoadedSoundWithBufferableAbility";
import SoundLoader from "./SoundLoader";

export default class BufferCleanerSounds {
	arrayGetterFunction: () => Array<LoadedSoundWithBufferAbility>;
	memoryHelper: {
		intervals: MemoryHelperIntervals;
	};
	soundLoader: SoundLoader;

	constructor(
		arrayGetterFunction: () => Array<LoadedSoundWithBufferAbility>,
		soundLoader: SoundLoader
	) {
		this.arrayGetterFunction = arrayGetterFunction;
		this.memoryHelper = {
			intervals: new MemoryHelperIntervals(),
		};
		this.soundLoader = soundLoader;
	}

	start() {
		if (this.memoryHelper.intervals.intervals.length > 0) return;
		this.memoryHelper.intervals.addAndRegisterInterval({
			interval:
				GlobalOptions.options.soundContainer.bufferCleanerIntervalInSeconds *
				1000,
			function: () => {
				this.removeSoundsThatWasntPlayedForTheDefinedSeconds();
			},
		});
	}

	removeSoundsThatWasntPlayedForTheDefinedSeconds() {
		let bufferableSounds = this.arrayGetterFunction().filter((sound) => {
			return sound.bufferable;
		});
		for (let sound of bufferableSounds) {
			if (sound.babylonSoundObject.isPlaying) continue;
			if (sound.babylonSoundObject.isPaused) continue;
			if (!sound.lastUsed) continue;
			if (sound.removeFromBufferIfNotUsedForSeconds === false) continue;
			let now = new Date();
			if (sound.removeFromBufferIfNotUsedForSeconds === true) {
				if (
					now.getTime() >
					sound.lastUsed.getTime() +
						GlobalOptions.options.soundContainer
							.removeFromBufferIfNotUsedForSeconds *
							1000
				) {
					this.soundLoader.unload(sound);
				}
			} else if (
				typeof sound.removeFromBufferIfNotUsedForSeconds === "number" &&
				!isNaN(sound.removeFromBufferIfNotUsedForSeconds)
			) {
				if (
					now.getTime() >
					sound.lastUsed.getTime() +
						sound.removeFromBufferIfNotUsedForSeconds * 1000
				) {
					this.soundLoader.unload(sound);
				}
			}
		}
	}

	end() {
		this.memoryHelper.intervals.freeUpAllMemory();
	}
}
