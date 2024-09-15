import { removeFromArray } from "j-object-functions";
import InputController from "../../input-control/InputController";
import { EKeyboardCode } from "../../input-control/keyboard/EKeyboardCode";
import Keybinding from "../../settings/Keybinding";
import Keyboard_Keybinding from "../../settings/Keyboard_Keybinding";
import Mouse_Keybinding from "../../settings/Mouse_Keybinding";
import InputRequest from "./InputRequest";

export default class InputRequestWithKeyBindings extends InputRequest {
	keybindings: Array<Keybinding>;
	constructor(...keybindings: Array<Keybinding>) {
		super();
		this.keybindings = new Array<Keybinding>();
		this.addKeybindings(...keybindings);
	}

	addKeybindings(...keybindings: Array<Keybinding>) {
		for (const keybinding of keybindings) {
			if (
				this.keybindings.some((testKeybinding) => {
					return deepEquals(testKeybinding, keybinding);
				})
			) {
				console.warn(`Cannot add a duplicate keybinding`, this, keybinding);
				return;
			}

			this.keybindings.push(keybinding);
		}
	}

	removeKeybinding(keybinding: Keybinding) {
		this.keybindings = removeFromArray(
			this.keybindings,
			keybinding,
			true,
			true
		);
	}

	updateRequestState(inputController: InputController) {
		if (!this.keybindings.length) return;

		this.setRequested(
			this.keybindings.some((keybinding) => {
				if (keybinding instanceof Keyboard_Keybinding) {
					return inputController.keyboardInputController.keyIsPressedByKeyCode(
						keybinding.code as EKeyboardCode
					);
				} else if (keybinding instanceof Mouse_Keybinding) {
					return inputController.mouseInputController.mouseKeyIsPressed(
						keybinding.button
					);
				}
				return false;
			})
		);
	}

	updateAndGetInputIsRequested(inputController: InputController) {
		this.updateRequestState(inputController);
		return this.getRequested();
	}
}
