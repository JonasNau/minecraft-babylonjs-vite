import { EMouseKeys } from "../input-control/mouse/EMouseKeys";
import Keybinding from "./Keybinding";
import {
	EExportableKeyBindingType,
	ExportableKeyBinding,
} from "./settingsJSON/ExportableKeyBinding";

export default class Mouse_Keybinding extends Keybinding {
	button: EMouseKeys;
	displayName: string;
	constructor(button: EMouseKeys, displayName: string) {
		super();
		this.button = button;
		this.displayName = displayName;
	}

	createExportable(): ExportableKeyBinding {
		return {
			type: EExportableKeyBindingType.MOUSE,
			mouse: {
				button: this.button,
				displayName: this.displayName,
			},
		};
	}
}
