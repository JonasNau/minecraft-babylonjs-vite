import { EKeyboardCode } from "./EKeyboardCode";

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
		this.pressedStart = new Date();
		this.isPressed = true;
	}

	release() {
		this.isPressed = false;
		this.prssedEnd = new Date();
	}
}
