import { EKeyboardCode } from "./keyboard/EKeyboardCode";

export default class KeyboardKey {
	isPressed: boolean;
	pressedStart?: Date;
	prssedEnd?: Date;
	character: string; //k, F12, l, }; /event.key
	code: EKeyboardCode; //event.code
	constructor(character: string, code: EKeyboardCode) {
		this.isPressed = false;
		this.character = character;
		this.code = code;
	}

	press() {
		this.isPressed = true;
		this.pressedStart = new Date();
	}

	release() {
		this.isPressed = false;
		this.prssedEnd = new Date();
	}
}
