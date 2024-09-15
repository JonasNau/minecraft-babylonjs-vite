import { EKeyboardCode } from "../input-control/keyboard/EKeyboardCode";
import Keybinding from "./Keybinding";
import {
	EExportableKeyBindingType,
	ExportableKeyBinding,
} from "./settingsJSON/ExportableKeyBinding";

export default class Keyboard_Keybinding extends Keybinding {
	character?: string;
	code?: EKeyboardCode;
	displayName?: string;
	constructor(toBind: {
		code?: EKeyboardCode;
		character?: string;
		displayName?: string;
	}) {
		super();
		if (toBind.code) {
			this.code = toBind.code;
		}
		if (toBind.character) {
			this.character = toBind.character;
		}
		if (toBind.displayName) {
			this.displayName = toBind.displayName;
		}
	}

	createExportable(): ExportableKeyBinding {
		return {
			type: EExportableKeyBindingType.KEYBOARD,
			keyboard: {
				character: this.character,
				code: this.code,
				displayName: this.displayName,
			},
		};
	}
}
