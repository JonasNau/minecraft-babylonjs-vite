import MusicInstance from "./MusicInstance";

export type MusicFolder = {
	[folderNameOrSoundName: string]: MusicInstance | MusicFolder;
};

export default class MusicLibrary {
	static musicList = {
		VOLUME_ALPHA: {
			TRACK_01_KEY: new MusicInstance({
				soundFileName: "Volume Alpha 01. Key.mp3",
				soundDisplayName: "Volume Alpha 01 - Key",
				babylonName: "volume_alpha_01_key",
				pathToSound: ["VOLUME_ALPHA"],
			}),
			TRACK_02_Door: new MusicInstance({
				soundFileName: "Volume Alpha 02. Door.mp3",
				soundDisplayName: "Volume Alpha 02 - Door",
				babylonName: "volume_alpha_02_door",
				pathToSound: ["VOLUME_ALPHA"],
			}),
			TRACK_03_Subwoofer_Lullaby: new MusicInstance({
				soundFileName: "Volume Alpha 03. Subwoofer Lullaby.mp3",
				soundDisplayName: "Volume Alpha 03 - Subwoofer Lullaby",
				babylonName: "volume_alpha_03_subwoofer_lullaby",
				pathToSound: ["VOLUME_ALPHA"],
			}),
			TRACK_04_Death: new MusicInstance({
				soundFileName: "Volume Alpha 04. Death.mp3",
				soundDisplayName: "Volume Alpha 04 - Death",
				babylonName: "volume_alpha_04_death",
				pathToSound: ["VOLUME_ALPHA"],
			}),
			TRACK_05_Living_Mice: new MusicInstance({
				soundFileName: "Volume Alpha 05. Living Mice.mp3",
				soundDisplayName: "Volume Alpha 05 - Living Mice",
				babylonName: "volume_alpha_05_living_mice",
				pathToSound: ["VOLUME_ALPHA"],
			}),
		},
		VOLUME_BETA: {
			TRACK_01_Ki: new MusicInstance({
				soundFileName: "Volume Beta 01. Ki.mp3",
				soundDisplayName: "Volume Beta 01 - Ki",
				babylonName: "volume_beta_01_key",
				pathToSound: ["VOLUME_BETA"],
			}),
			TRACK_02_Alpha: new MusicInstance({
				soundFileName: "Volume Beta 02. Alpha.mp3",
				soundDisplayName: "Volume Beta 02 - Alpha",
				babylonName: "volume_beta_02_alpha",
				pathToSound: ["VOLUME_BETA"],
			}),
			TRACK_03_Dead_Voxel: new MusicInstance({
				soundFileName: "Volume Beta 03. Dead Voxel.mp3",
				soundDisplayName: "Volume Beta 03 - Dead Voxel",
				babylonName: "volume_beta_03_dead_voxel",
				pathToSound: ["VOLUME_BETA"],
			}),
			TRACK_04_Blind_Spots: new MusicInstance({
				soundFileName: "Volume Beta 04. Blind Spots.mp3",
				soundDisplayName: "Volume Beta 04 - Blind Spots",
				babylonName: "volume_beta_04_blind_spots",
				pathToSound: ["VOLUME_BETA"],
			}),
		},
	};
	constructor() {}

	static getRelativePathToMusic(sound: MusicInstance) {
		let path = sound.pathToMusic.join("/");
		return path;
	}
}
