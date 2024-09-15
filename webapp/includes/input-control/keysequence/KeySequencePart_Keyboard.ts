import { EKeyboardCodeSideIndependent } from "../EKeyboardCodeSideIndependent";
import { EKeyboardCode } from "../keyboard/EKeyboardCode";
import KeySequencePart from "./KeySequencePart";

export default class KeySequencePart_Keyboard extends KeySequencePart {
	shouldBePressed: boolean;
	eKeyboardCode?: EKeyboardCode;
	character?: string;
	eKeyboardCodeSideInpependent?: EKeyboardCodeSideIndependent;
	constructor(shouldBePressed: boolean) {
		super();
		this.shouldBePressed = shouldBePressed;
	}

	isEkeyboardCode(): boolean {
		return this.eKeyboardCode !== undefined;
	}

	isKeyboardCodeSideInpependent(): boolean {
		return this.eKeyboardCodeSideInpependent !== undefined;
	}

	setEKeyboardCode(eKeyboardCode: EKeyboardCode) {
		this.eKeyboardCode = eKeyboardCode;
	}

	setEIgnoreSideCode(eIgnoreSideCode: EKeyboardCodeSideIndependent) {
		this.eKeyboardCodeSideInpependent = eIgnoreSideCode;
	}

	static createFromEkeyboardCode(
		eKeyboardCode: EKeyboardCode,
		shouldBePressed = true
	): KeySequencePart_Keyboard {
		let keystrokePartkeyboard = new KeySequencePart_Keyboard(shouldBePressed);
		keystrokePartkeyboard.setEKeyboardCode(eKeyboardCode);
		return keystrokePartkeyboard;
	}

	static createFromIgnoreSideCode(
		eIgnoreSideCode: EKeyboardCodeSideIndependent,
		shouldBePressed = true
	): KeySequencePart_Keyboard {
		let keystrokePartkeyboard = new KeySequencePart_Keyboard(shouldBePressed);
		keystrokePartkeyboard.setEIgnoreSideCode(eIgnoreSideCode);
		return keystrokePartkeyboard;
	}

	static createFromCaracter(
		character: string,
		shouldBePressed = true
	): KeySequencePart_Keyboard {
		let keystrokePartkeyboard = new KeySequencePart_Keyboard(shouldBePressed);
		keystrokePartkeyboard.character = character;
		return keystrokePartkeyboard;
	}
}
