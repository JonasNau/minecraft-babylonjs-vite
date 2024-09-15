import { EMouseKeys } from "./EMouseKeys";

export default class MouseKey {
	isPressed: boolean;
	pressedStart?: Date;
	prssedEnd?: Date;
	key: EMouseKeys;
	constructor(key: EMouseKeys) {
		this.isPressed = false;
		this.key = key;
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
