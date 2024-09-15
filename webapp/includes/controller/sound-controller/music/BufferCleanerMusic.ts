import { MemoryHelperIntervals } from "j-memoryhelper-functions";
import GlobalOptions from "../../../settings/GlobalOptions";
import LoadedMusicdWithBufferAbility from "./LoadedMusicWithBufferableAbility";
import MusicLoader from "./MusicLoader";

export default class BufferCleanerMusic {
	arrayGetterFunction: () => Array<LoadedMusicdWithBufferAbility>;
	memoryHelper: {
		intervals: MemoryHelperIntervals;
	};
	musicLoader: MusicLoader;

	constructor(
		arrayGetterFunction: () => Array<LoadedMusicdWithBufferAbility>,
		soundLoader: MusicLoader
	) {
		this.arrayGetterFunction = arrayGetterFunction;
		this.memoryHelper = {
			intervals: new MemoryHelperIntervals(),
		};
		this.musicLoader = soundLoader;
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
					this.musicLoader.unload(sound);
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
					this.musicLoader.unload(sound);
				}
			}
		}
	}

	end() {
		this.memoryHelper.intervals.freeUpAllMemory();
	}
}
