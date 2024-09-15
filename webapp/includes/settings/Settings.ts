import FieldOfView_Settings from "./FieldOfView_Settings";
import Game_Settings from "./Game_Settings";
import Music_Settings from "./Music_Settings";
import Video_Settings from "./Video_Settings";

import NoSettingsFoundError from "../errors/settings/NoSettingsFoundError";

import * as objectFunctions from "j-object-functions";
import SettingsCouldNotBeParsedError from "../errors/settings/SettingsCouldNotBeParsedError";
import GlobalOptions from "./GlobalOptions";
import Controls_Settings from "./Controls_Settings";
import RessourcePack_Settings from "./RessourcePack_Settings";
import { SettingsJSON, isSettingsJSON } from "./settingsJSON/SettingsJSON";
import { EExportableKeyBindingType } from "./settingsJSON/ExportableKeyBinding";
import Keyboard_Keybinding from "./Keyboard_Keybinding";
import Mouse_Keybinding from "./Mouse_Keybinding";
import { EMouseKeys } from "../input-control/mouse/EMouseKeys";
import { ESettingName } from "./enums/ESettingName";

export default class Settings {
	musicSettings: Music_Settings;
	fovSettings: FieldOfView_Settings;
	videoSettings: Video_Settings;
	gameSettings: Game_Settings;
	controlsSettings: Controls_Settings;
	ressourcePackSettings: RessourcePack_Settings;
	constructor() {
		this.musicSettings = new Music_Settings();
		this.fovSettings = new FieldOfView_Settings();
		this.videoSettings = new Video_Settings();
		this.gameSettings = new Game_Settings();
		this.controlsSettings = new Controls_Settings();
		this.ressourcePackSettings = new RessourcePack_Settings();
	}

	static getSettingsFromLocalStorage() {
		let settings = window.localStorage.getItem("settings");
		if (settings === null) {
			throw new NoSettingsFoundError(
				"There are no settings saved in the local storage."
			);
		}

		let settingsJSON = objectFunctions.parseJSON(settings);
		if (!settingsJSON) {
			throw new SettingsCouldNotBeParsedError(
				"Settings in local storage are not valid and couldn't be parsed."
			);
		}

		if (!isSettingsJSON(settingsJSON)) {
			throw new SettingsCouldNotBeParsedError("Invalid Settings.");
		}
		return settingsJSON;
	}

	loadFromLocalStorage() {
		let settingsJSON = Settings.getSettingsFromLocalStorage();

		//FOV
		this.fovSettings.set(
			settingsJSON.fovSettings?.fov ??
				GlobalOptions.options.settings.standardSettings.fovSettings.fov
		);

		// Music and Sounds
		try {
			this.musicSettings.setBlocksVolume(
				settingsJSON.musicSettings?.blocksVolume ??
					GlobalOptions.options.settings.standardSettings.musicSettings
						.blocksVolume
			);
		} catch {}
		try {
			this.musicSettings.setFriendlyCreaturesVolume(
				settingsJSON.musicSettings?.friendlyCreaturesVolume ??
					GlobalOptions.options.settings.standardSettings.musicSettings
						.friendlyCreaturesVolume
			);
		} catch {}
		try {
			this.musicSettings.setHostileCreaturesVolume(
				settingsJSON.musicSettings?.hostileCreaturesVolume ??
					GlobalOptions.options.settings.standardSettings.musicSettings
						.hostileCreaturesVolume
			);
		} catch {}
		try {
			this.musicSettings.setJukeboxAndNoteBlocksVolume(
				settingsJSON.musicSettings?.jukeboxAndNoteBlocksVolume ??
					GlobalOptions.options.settings.standardSettings.musicSettings
						.jukeboxAndNoteBlocksVolume
			);
		} catch {}

		try {
			this.musicSettings.setMasterVolume(
				settingsJSON.musicSettings?.masterVolume ??
					GlobalOptions.options.settings.standardSettings.musicSettings
						.masterVolume
			);
		} catch {}
		try {
			this.musicSettings.setMusicVolume(
				settingsJSON.musicSettings?.musicVolume ??
					GlobalOptions.options.settings.standardSettings.musicSettings
						.musicVolume
			);
		} catch {}
		try {
			this.musicSettings.setPlayersVolume(
				settingsJSON.musicSettings?.playersVolume ??
					GlobalOptions.options.settings.standardSettings.musicSettings
						.playersVolume
			);
		} catch {}
		try {
			this.musicSettings.setUiVolume(
				settingsJSON.musicSettings?.uiVolume ??
					GlobalOptions.options.settings.standardSettings.musicSettings.uiVolume
			);
		} catch {}
		try {
			this.musicSettings.setVoiceSpeechVolume(
				settingsJSON.musicSettings?.voiceSpeechVolume ??
					GlobalOptions.options.settings.standardSettings.musicSettings
						.voiceSpeechVolume
			);
		} catch {}
		try {
			this.musicSettings.setWeatherVolume(
				settingsJSON.musicSettings?.weatherVolume ??
					GlobalOptions.options.settings.standardSettings.musicSettings
						.weatherVolume
			);
		} catch {}

		//Graphic Settings
		try {
			this.videoSettings.setRenderDistance(
				settingsJSON.videoSettings.renderDistance ??
					GlobalOptions.options.settings.standardSettings.videoSettings
						.renderDistance
			);
		} catch {}
		try {
			this.videoSettings.setSimulationDistance(
				settingsJSON.videoSettings.simulationDistance ??
					GlobalOptions.options.settings.standardSettings.videoSettings
						.simulationDistance
			);
		} catch {}
		try {
			this.videoSettings.setMaxFPS(
				settingsJSON.videoSettings.maxFPS ??
					GlobalOptions.options.settings.standardSettings.videoSettings.maxFPS
			);
		} catch {}
		try {
			this.videoSettings.setMenuFPS(
				settingsJSON.videoSettings.menuFPS ??
					GlobalOptions.options.settings.standardSettings.videoSettings.menuFPS
			);
		} catch {}
		try {
			this.videoSettings.setBrightnes(
				settingsJSON.videoSettings.brightness ??
					GlobalOptions.options.settings.standardSettings.videoSettings
						.brightness
			);
		} catch {}

		//Ressource Packs
		if (
			settingsJSON?.ressourcePacks?.active.length &&
			typeof settingsJSON.ressourcePacks.active === "object"
		) {
			this.ressourcePackSettings.active = settingsJSON.ressourcePacks.active;
		}

		//KeyBindings

		if (settingsJSON.keybindings) {
			for (const [
				currentKeyBindingNAME,
				currentKeyBindingVALUE,
			] of Object.entries(settingsJSON.keybindings)) {
				if (!currentKeyBindingVALUE) continue;
				if (!this.controlsSettings.keyBindings[currentKeyBindingNAME]) return;
				if (
					currentKeyBindingVALUE?.type === EExportableKeyBindingType.KEYBOARD
				) {
					if (!this.controlsSettings.keyBindings[currentKeyBindingNAME])
						continue;
					let keboardKeyBinding = new Keyboard_Keybinding({
						character: currentKeyBindingVALUE.keyboard?.character,
						code: currentKeyBindingVALUE.keyboard?.code,
						displayName: currentKeyBindingVALUE.keyboard?.displayName,
					});
					this.controlsSettings.keyBindings[currentKeyBindingNAME] =
						keboardKeyBinding;
				} else if (
					currentKeyBindingVALUE?.type === EExportableKeyBindingType.MOUSE
				) {
					if (!this.controlsSettings.keyBindings[currentKeyBindingNAME])
						continue;
					if (
						!currentKeyBindingVALUE.mouse?.button ||
						!(currentKeyBindingVALUE.mouse.button in EMouseKeys) ||
						!currentKeyBindingVALUE.mouse.displayName
					)
						continue;
					let mouseKeybinding = new Mouse_Keybinding(
						currentKeyBindingVALUE.mouse.button as EMouseKeys,
						currentKeyBindingVALUE.mouse?.displayName
					);
					this.controlsSettings.keyBindings[currentKeyBindingNAME] =
						mouseKeybinding;
				}
			}
		}

		try {
			this.videoSettings.setWebGPUEnabled(
				settingsJSON.videoSettings.webGPUEnabled
			);
		} catch {}
	}

	tryToLoadSettingsFromLocalStorage(): boolean {
		try {
			this.loadFromLocalStorage();
		} catch (error) {
			if (error instanceof NoSettingsFoundError) {
				console.warn("There are no settings found in the local storage");
				this.saveToLocalStorage();
				return false;
			} else if (error instanceof SettingsCouldNotBeParsedError) {
				console.warn("The Settings have an invalid syntax");
				return false;
			}
			throw error;
		}
		return true;
	}

	saveToLocalStorage() {
		let settingsJSON: SettingsJSON = {
			musicSettings: {
				masterVolume: this.musicSettings.masterVolume,
				musicVolume: this.musicSettings.musicVolume,
				jukeboxAndNoteBlocksVolume:
					this.musicSettings.jukeboxAndNoteBlocksVolume,
				weatherVolume: this.musicSettings.weatherVolume,
				blocksVolume: this.musicSettings.blocksVolume,
				hostileCreaturesVolume: this.musicSettings.hostileCreaturesVolume,
				friendlyCreaturesVolume: this.musicSettings.friendlyCreaturesVolume,
				playersVolume: this.musicSettings.playersVolume,
				voiceSpeechVolume: this.musicSettings.voiceSpeechVolume,
				uiVolume: this.musicSettings.uiVolume,
			},
			fovSettings: {
				fov: this.fovSettings.fov,
			},
			videoSettings: {
				renderDistance: this.videoSettings.renderDistance,
				simulationDistance: this.videoSettings.simulationDistance,
				maxFPS: this.videoSettings.maxFPS,
				menuFPS: this.videoSettings.menuFPS,
				brightness: this.videoSettings.brightness,
				webGPUEnabled: this.videoSettings.webGPUEnabled,
			},
			ressourcePacks: {
				active: this.ressourcePackSettings.active,
			},
			keybindings: {
				JUMP: this.controlsSettings.keyBindings.JUMP.createExportable(),
				FORWARD: this.controlsSettings.keyBindings.FORWARD.createExportable(),
				BACKWARDS:
					this.controlsSettings.keyBindings.BACKWARDS.createExportable(),
				LEFT: this.controlsSettings.keyBindings.LEFT.createExportable(),
				RIGHT: this.controlsSettings.keyBindings.RIGHT.createExportable(),
				SNEAK: this.controlsSettings.keyBindings.SNEAK.createExportable(),
				SPRINT: this.controlsSettings.keyBindings.SPRINT.createExportable(),
				ATTACK_DESTROY:
					this.controlsSettings.keyBindings.ATTACK_DESTROY.createExportable(),
				PICK_BLOCK:
					this.controlsSettings.keyBindings.PICK_BLOCK.createExportable(),
				USE_ITEM_PLACE_BLOCK:
					this.controlsSettings.keyBindings.USE_ITEM_PLACE_BLOCK.createExportable(),
				DROP_ITEM:
					this.controlsSettings.keyBindings.DROP_ITEM.createExportable(),
				HOTBAR_SLOT_0:
					this.controlsSettings.keyBindings.HOTBAR_SLOT_0.createExportable(),
				HOTBAR_SLOT_1:
					this.controlsSettings.keyBindings.HOTBAR_SLOT_1.createExportable(),
				HOTBAR_SLOT_2:
					this.controlsSettings.keyBindings.HOTBAR_SLOT_2.createExportable(),
				HOTBAR_SLOT_3:
					this.controlsSettings.keyBindings.HOTBAR_SLOT_3.createExportable(),
				HOTBAR_SLOT_4:
					this.controlsSettings.keyBindings.HOTBAR_SLOT_4.createExportable(),
				HOTBAR_SLOT_5:
					this.controlsSettings.keyBindings.HOTBAR_SLOT_5.createExportable(),
				HOTBAR_SLOT_6:
					this.controlsSettings.keyBindings.HOTBAR_SLOT_6.createExportable(),
				HOTBAR_SLOT_7:
					this.controlsSettings.keyBindings.HOTBAR_SLOT_7.createExportable(),
				HOTBAR_SLOT_8:
					this.controlsSettings.keyBindings.HOTBAR_SLOT_8.createExportable(),
				TOGGLE_INVENTORY:
					this.controlsSettings.keyBindings.TOGGLE_INVENTORY.createExportable(),
				OPEN_CHAT:
					this.controlsSettings.keyBindings.OPEN_CHAT.createExportable(),
				TOGGLE_PERSPECTIVE:
					this.controlsSettings.keyBindings.TOGGLE_PERSPECTIVE.createExportable(),
			},
		};
		try {
			let settingsJSONString = JSON.stringify(settingsJSON);
			window.localStorage.setItem("settings", settingsJSONString);
		} catch (error) {
			console.error(error);
		}
	}

	setFromJSON() {}
}
