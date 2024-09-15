import {
	removeFromArray,
	insertToArrayAtIndex,
	getSubarray,
} from "j-object-functions";
import * as BABYLON from "@babylonjs/core";
import MusicContainer from "./MusicContainer";
import { MusicFolder } from "./MusicLibrary";
import { getRandomIntBetween } from "j-random-functions";
import MusicInstance from "./MusicInstance";
import { MemoryHelperCallbacks } from "j-memoryhelper-functions";

export enum ECallbacksMusicPlayer {
	END = "end",
	STOP = "stop",
	PLAY_NEXT = "play_next",
}

export default class MusicPlayer {
	tracks: Array<MusicInstance>;
	currentTrackIndex = 0;
	track?: BABYLON.Sound;
	autoplay: boolean;
	trackHistoryToPreventDoublePlay: Array<number>;
	debug = true;
	randomize = true;
	volume: number;
	isLoading = false;
	memoryHelper: {
		memoryHelperCallbacks: MemoryHelperCallbacks;
	};

	musicContainer: MusicContainer;
	constructor(musicContainer: MusicContainer) {
		this.musicContainer = musicContainer;
		this.tracks = new Array();
		this.autoplay = true;
		this.trackHistoryToPreventDoublePlay = new Array();
		this.volume = 1;
		this.memoryHelper = {
			memoryHelperCallbacks: new MemoryHelperCallbacks(),
		};
	}

	saveTrackNumberInHistory(number: number) {
		this.trackHistoryToPreventDoublePlay.unshift(number);
		if (this.soundHistoryEnough()) {
			//The last tracks array has already saved the last 10% of the length of the tracks so it can be played again and removed from the history
			let removedTrackFromHistory = this.trackHistoryToPreventDoublePlay.pop();
			if (this.debug && typeof removedTrackFromHistory == "number") {
				console.debug(
					`MusicPlayer: Removing track with the index ${removedTrackFromHistory} from the history. It can be played again. Music Name: ${this.tracks[removedTrackFromHistory].soundDisplayName}`
				);
			}
		}
		if (this.debug) {
			console.debug({
				message: "MusicPlayer: Track History:",
				trackHistory: this.trackHistoryToPreventDoublePlay,
			});
		}
	}

	soundHistoryEnough(): boolean {
		/*  The same music track played
            has at least a specific gap of the length of the music list

        */

		let gap = this.tracks.length / 2;

		return this.trackHistoryToPreventDoublePlay.length >= gap;
	}

	async playRandom() {
		await this.play(this.getRandomSoundIndex());
	}

	getRandomSoundIndex() {
		if (this.soundHistoryEnough())
			this.trackHistoryToPreventDoublePlay = new Array();
		let index = getRandomIntBetween(0, this.tracks.length - 1);
		while (this.trackHistoryToPreventDoublePlay.includes(index)) {
			index = getRandomIntBetween(0, this.tracks.length - 1);
		}
		return index;
	}

	getLength(track: BABYLON.Sound): number {
		if (!track) return 0;
		return track.getAudioBuffer()?.duration ?? 0;
	}

	getCurrentTime(track: BABYLON.Sound): number {
		if (!track) return 0;
		return track.currentTime;
	}

	isPlaying(): boolean {
		if (!this.track) return false;
		return this.track.isPlaying;
	}

	getIsLoading(): boolean {
		return this.isLoading;
	}

	addTrack(track: MusicInstance) {
		this.tracks.push(track);
	}

	removeTrack(track: MusicInstance) {
		this.tracks = removeFromArray(this.tracks, track, true);
	}

	setTrackAtPosition(track: MusicInstance, position: number) {
		insertToArrayAtIndex(this.tracks, track, position - 1);
	}

	getNextIndex(numberOfStepsForward = 1): number {
		let nextIndex = this.currentTrackIndex;
		for (let i = 0; i < numberOfStepsForward; i++) {
			if (nextIndex + 1 > this.tracks.length - 1) {
				nextIndex = 0;
			} else {
				nextIndex++;
			}
		}
		return nextIndex;
	}

	async next() {
		let nextIndex = this.getNextIndex();
		this.randomize = false;
		await this.play(nextIndex);
	}

	getPreviousIndex(numberOfStepsBackwards = 1): number {
		let previousIndex = this.currentTrackIndex;
		for (let i = 0; i < numberOfStepsBackwards; i++) {
			if (previousIndex - 1 <= 0) {
				previousIndex = this.tracks.length - 1;
			} else {
				previousIndex--;
			}
		}
		return previousIndex;
	}

	async previous() {
		let previousIndex = this.getPreviousIndex();
		this.randomize = false;
		this.play(previousIndex);
	}

	async preloadSound(index: number) {
		let soundInstance = this.tracks[index];
		await this.musicContainer.getLoadedMusicFromSoundInstance(soundInstance);
	}

	async preloadNextSongs(numberOfSongsToPreload: number) {
		for (let i = 1; i <= numberOfSongsToPreload; i++) {
			this.preloadSound(this.getNextIndex(i));
		}
	}

	async play(songIndex?: number) {
		let playIndex = songIndex ?? this.currentTrackIndex;
		let trackToPlay = this.tracks[playIndex];

		this.isLoading = true;
		let track = await this.musicContainer.getLoadedMusicFromSoundInstance(
			trackToPlay,
			{ bufferable: true, removeFromBufferIfNotUsedForSeconds: 1200 }
		);
		this.isLoading = false;
		this.track = track.babylonSoundObject;
		this.stop();
		this.track.onEndedObservable.addOnce(async () => {
			console.log("Ended: " + this.track?.name + " | " + playIndex);
			this.memoryHelper.memoryHelperCallbacks.fireCallback(
				ECallbacksMusicPlayer.END
			);
			if (this.track) {
			}
			if (this.autoplay) {
				if (this.randomize) {
					this.playRandom();
					return;
				}
				this.next();
			} else {
				this.memoryHelper.memoryHelperCallbacks.fireCallback(
					ECallbacksMusicPlayer.END
				);
			}
		});
		if (!this.track) {
			throw new Error("Music couldn't be loaded");
		}
		if (this.debug) {
			console.debug(
				`MusicPlayer: playing sound ${playIndex + 1}/${
					this.tracks.length
				} | name: ${trackToPlay.soundDisplayName} | lenght: ${this.getLength(
					this.track
				)} | current time: ${this.getCurrentTime(this.track)}`
			);
		}
		this.currentTrackIndex = playIndex;

		this.track.play(0, 0);
		this.memoryHelper.memoryHelperCallbacks.fireCallback(
			ECallbacksMusicPlayer.PLAY_NEXT
		);
		this.preloadNextSongs(3);
		this.saveTrackNumberInHistory(playIndex);
	}

	toggle() {
		debugger;
		if (!this.track) return;
		if (this.isPlaying()) {
			console.log("pause");
			this.pause();
			return;
		}
		console.log("play");
		this.resume();
	}

	pause() {
		if (!this.isPlaying() || !this.track) return;
		this.track.pause();
	}

	resume() {
		if (this.isPlaying() || !this.track) return;
		this.track.play();
	}

	stop() {
		// if (!this.isPlaying() || !this.track) return;
		for (let loadedMusic of this.musicContainer.musicLoader.customLoadedSounds
			.loadedMusicList) {
			loadedMusic.babylonSoundObject.onEndedObservable.clear();
			loadedMusic.stop();
		}
		this.memoryHelper.memoryHelperCallbacks.fireCallback(
			ECallbacksMusicPlayer.STOP
		);
		this.memoryHelper.memoryHelperCallbacks.fireCallback(
			ECallbacksMusicPlayer.END
		);
	}

	loadAllSoundsToMusicPlayer(folder: MusicFolder) {
		for (let [key, value] of Object.entries(folder)) {
			if (value instanceof MusicInstance) {
				this.addTrack(value);
				continue;
			}
			this.loadAllSoundsToMusicPlayer(value);
		}
	}

	destroy() {
		this.memoryHelper.memoryHelperCallbacks.freeUpAllMemory();
	}
}
