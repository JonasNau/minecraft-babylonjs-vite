export default class MusicInstance {
	soundFileName: string;
	soundDisplayName: string;
	babylonName: string;
	pathToMusic: string[];
	interpret?: string;
	constructor(properties: {
		soundFileName: string;
		soundDisplayName: string;
		babylonName: string;
		pathToSound: string[];
		interpret?: string;
	}) {
		this.babylonName = properties.babylonName;
		this.soundFileName = properties.soundFileName;
		this.soundDisplayName = properties.soundDisplayName;
		this.pathToMusic = properties.pathToSound;
		this.interpret = properties.interpret;
	}
}
