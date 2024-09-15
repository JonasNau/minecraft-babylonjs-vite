import GlobalOptions from "./GlobalOptions";

export default class Music_Settings {
	masterVolume: number;
	musicVolume: number;
	jukeboxAndNoteBlocksVolume: number;
	weatherVolume: number;
	blocksVolume: number;
	hostileCreaturesVolume: number;
	friendlyCreaturesVolume: number;
	playersVolume: number;
	voiceSpeechVolume: number;
	uiVolume: number;
	constructor() {
		this.masterVolume =
			GlobalOptions.options.settings.standardSettings.musicSettings.masterVolume;
		this.musicVolume =
			GlobalOptions.options.settings.standardSettings.musicSettings.musicVolume;
		this.jukeboxAndNoteBlocksVolume =
			GlobalOptions.options.settings.standardSettings.musicSettings.jukeboxAndNoteBlocksVolume;
		this.weatherVolume =
			GlobalOptions.options.settings.standardSettings.musicSettings.weatherVolume;
		this.blocksVolume =
			GlobalOptions.options.settings.standardSettings.musicSettings.blocksVolume;
		this.hostileCreaturesVolume =
			GlobalOptions.options.settings.standardSettings.musicSettings.hostileCreaturesVolume;
		this.friendlyCreaturesVolume =
			GlobalOptions.options.settings.standardSettings.musicSettings.friendlyCreaturesVolume;
		this.playersVolume =
			GlobalOptions.options.settings.standardSettings.musicSettings.playersVolume;
		this.voiceSpeechVolume =
			GlobalOptions.options.settings.standardSettings.musicSettings.voiceSpeechVolume;
		this.uiVolume =
			GlobalOptions.options.settings.standardSettings.musicSettings.uiVolume;
	}

	setMasterVolume(number: number) {
		if (number < 0 || number > 1) {
			throw new Error("The volume needs to be a number between 0 and 1");
		}
		this.masterVolume = number;
	}

	setMusicVolume(number: number) {
		if (number < 0 || number > 1) {
			throw new Error("The volume needs to be a number between 0 and 1");
		}
		this.musicVolume = number;
	}

	setJukeboxAndNoteBlocksVolume(number: number) {
		if (number < 0 || number > 1) {
			throw new Error("The volume needs to be a number between 0 and 1");
		}
		this.jukeboxAndNoteBlocksVolume = number;
	}

	setWeatherVolume(number: number) {
		if (number < 0 || number > 1) {
			throw new Error("The volume needs to be a number between 0 and 1");
		}
		this.weatherVolume = number;
	}

	setBlocksVolume(number: number) {
		if (number < 0 || number > 1) {
			throw new Error("The volume needs to be a number between 0 and 1");
		}
		this.blocksVolume = number;
	}

	setHostileCreaturesVolume(number: number) {
		if (number < 0 || number > 1) {
			throw new Error("The volume needs to be a number between 0 and 1");
		}
		this.hostileCreaturesVolume = number;
	}

	setFriendlyCreaturesVolume(number: number) {
		if (number < 0 || number > 1) {
			throw new Error("The volume needs to be a number between 0 and 1");
		}
		this.friendlyCreaturesVolume = number;
	}

	setPlayersVolume(number: number) {
		if (number < 0 || number > 1) {
			throw new Error("The volume needs to be a number between 0 and 1");
		}
		this.playersVolume = number;
	}

	setVoiceSpeechVolume(number: number) {
		if (number < 0 || number > 1) {
			throw new Error("The volume needs to be a number between 0 and 1");
		}
		this.voiceSpeechVolume = number;
	}

	setUiVolume(number: number) {
		if (number < 0 || number > 1) {
			throw new Error("The volume needs to be a number between 0 and 1");
		}
		this.uiVolume = number;
	}
}
