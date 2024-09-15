import * as io_ts from "io-ts";
import { isLeft } from "fp-ts/Either";
import { ExportableKeyBinding } from "./ExportableKeyBinding";
import { validate } from "../../helperFunctions/io-ts-functions";

export type SettingsJSON = {
	musicSettings: {
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
	};
	fovSettings: {
		fov: number;
	};
	videoSettings: {
		renderDistance: number;
		simulationDistance: number;
		maxFPS: number;
		menuFPS: number;
		brightness: number;
		webGPUEnabled: boolean;
	};
	ressourcePacks: {
		active: string[];
	};
	keybindings: {
		[key: string]: ExportableKeyBinding;
		JUMP: ExportableKeyBinding;
		FORWARD: ExportableKeyBinding;
		BACKWARDS: ExportableKeyBinding;
		LEFT: ExportableKeyBinding;
		RIGHT: ExportableKeyBinding;
		SNEAK: ExportableKeyBinding;
		SPRINT: ExportableKeyBinding;
		ATTACK_DESTROY: ExportableKeyBinding;
		PICK_BLOCK: ExportableKeyBinding;
		USE_ITEM_PLACE_BLOCK: ExportableKeyBinding;
		DROP_ITEM: ExportableKeyBinding;
		HOTBAR_SLOT_0: ExportableKeyBinding;
		HOTBAR_SLOT_1: ExportableKeyBinding;
		HOTBAR_SLOT_2: ExportableKeyBinding;
		HOTBAR_SLOT_3: ExportableKeyBinding;
		HOTBAR_SLOT_4: ExportableKeyBinding;
		HOTBAR_SLOT_5: ExportableKeyBinding;
		HOTBAR_SLOT_6: ExportableKeyBinding;
		HOTBAR_SLOT_7: ExportableKeyBinding;
		HOTBAR_SLOT_8: ExportableKeyBinding;
		TOGGLE_INVENTORY: ExportableKeyBinding;
		OPEN_CHAT: ExportableKeyBinding;
		TOGGLE_PERSPECTIVE: ExportableKeyBinding;
	};
};

export const SettingsJSON_io_ts = io_ts.type({
	musicSettings: io_ts.union([
		io_ts.type({
			masterVolume: io_ts.union([io_ts.number, io_ts.undefined]),
			musicVolume: io_ts.union([io_ts.number, io_ts.undefined]),
			jukeboxAndNoteBlocksVolume: io_ts.union([io_ts.number, io_ts.undefined]),
			weatherVolume: io_ts.union([io_ts.number, io_ts.undefined]),
			blocksVolume: io_ts.union([io_ts.number, io_ts.undefined]),
			hostileCreaturesVolume: io_ts.union([io_ts.number, io_ts.undefined]),
			friendlyCreaturesVolume: io_ts.union([io_ts.number, io_ts.undefined]),
			playersVolume: io_ts.union([io_ts.number, io_ts.undefined]),
			voiceSpeechVolume: io_ts.union([io_ts.number, io_ts.undefined]),
			uiVolume: io_ts.union([io_ts.number, io_ts.undefined]),
		}),
		io_ts.undefined,
	]),
	fovSettings: io_ts.union([
		io_ts.type({
			fov: io_ts.union([io_ts.number, io_ts.undefined]),
		}),
		io_ts.undefined,
	]),
	videoSettings: io_ts.union([
		io_ts.type({
			renderDistance: io_ts.union([io_ts.number, io_ts.undefined]),
			simulationDistance: io_ts.union([io_ts.number, io_ts.undefined]),
			maxFPS: io_ts.union([io_ts.number, io_ts.undefined]),
			menuFPS: io_ts.union([io_ts.number, io_ts.undefined]),
			brightness: io_ts.union([io_ts.number, io_ts.undefined]),
			webGPUEnabled: io_ts.union([io_ts.boolean, io_ts.undefined]),
		}),
		io_ts.undefined,
	]),
	ressourcePacks: io_ts.union([
		io_ts.type({
			active: io_ts.union([io_ts.array(io_ts.string), io_ts.undefined]),
		}),
		io_ts.undefined,
	]),
});

export function isSettingsJSON(object: unknown): object is SettingsJSON {
	return validate(object, SettingsJSON_io_ts);
}
