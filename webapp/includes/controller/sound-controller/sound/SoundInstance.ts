import { ESoundType } from "../ESoundType";

export default class SoundInstance {
	soundFileName: string;
	soundDisplayName: string;
	babylonName: string;
	pathToSound: string[];
	soundType: ESoundType;
	constructor(properties: {
		soundFileName: string;
		soundDisplayName: string;
		babylonName: string;
		pathToSound: string[];
		soundType: ESoundType;
	}) {
		this.babylonName = properties.babylonName;
		this.soundFileName = properties.soundFileName;
		this.soundDisplayName = properties.soundDisplayName;
		this.pathToSound = properties.pathToSound;
		this.soundType = properties.soundType;
	}
}
