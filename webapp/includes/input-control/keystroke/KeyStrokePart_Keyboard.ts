import { EKeyboardCodeSideIndependent } from "../EKeyboardCodeSideIndependent";
import KeyStrokePart from "./KeyStrokePart";
import { EKeyboardCode } from "../keyboard/EKeyboardCode";

export default class KeyStrokePart_Keyboard extends KeyStrokePart {
	shouldBePressed: boolean;
	eKeyboardCode?: EKeyboardCode;
	character?: string;
	ignoreSiteCode?: EKeyboardCodeSideIndependent;
	constructor(shouldBePressed: boolean) {
		super();
		this.shouldBePressed = shouldBePressed;
	}

	isEkeyboardCode(): boolean {
		return this.eKeyboardCode !== undefined;
	}

	isIgnoreSite(): boolean {
		return this.ignoreSiteCode !== undefined;
	}

	setEKeyboardCode(eKeyboardCode: EKeyboardCode) {
		this.eKeyboardCode = eKeyboardCode;
	}

	setEIgnoreSideCode(eIgnoreSideCode: EKeyboardCodeSideIndependent) {
		this.ignoreSiteCode = eIgnoreSideCode;
	}

	static createFromEkeyboardCode(
		eKeyboardCode: EKeyboardCode,
		shouldBePressed = true
	): KeyStrokePart_Keyboard {
		let keystrokePartkeyboard = new KeyStrokePart_Keyboard(shouldBePressed);
		keystrokePartkeyboard.setEKeyboardCode(eKeyboardCode);
		return keystrokePartkeyboard;
	}

	static createFromIgnoreSideCode(
		eIgnoreSideCode: EKeyboardCodeSideIndependent,
		shouldBePressed = true
	): KeyStrokePart_Keyboard {
		let keystrokePartkeyboard = new KeyStrokePart_Keyboard(shouldBePressed);
		keystrokePartkeyboard.setEIgnoreSideCode(eIgnoreSideCode);
		return keystrokePartkeyboard;
	}

	static createFromCaracter(
		character: string,
		shouldBePressed = true
	): KeyStrokePart_Keyboard {
		let keystrokePartkeyboard = new KeyStrokePart_Keyboard(shouldBePressed);
		keystrokePartkeyboard.character = character;
		return keystrokePartkeyboard;
	}
}
