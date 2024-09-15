import { EKeyboardCode } from "../../input-control/keyboard/EKeyboardCode";
import { EMouseKeys } from "../../input-control/mouse/EMouseKeys";

export enum EExportableKeyBindingType {
	KEYBOARD = "keyboard",
	MOUSE = "mouse",
}

export type ExportableKeyBinding = {
	type: EExportableKeyBindingType;
	keyboard?: {
		character?: string;
		code?: EKeyboardCode;
		displayName?: string;
	};
	mouse?: {
		button?: EMouseKeys;
		displayName?: string;
	};
};
