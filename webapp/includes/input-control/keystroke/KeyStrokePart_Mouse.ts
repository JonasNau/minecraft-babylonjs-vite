import KeyStrokePart from "./KeyStrokePart";
import { EMouseKeys } from "../mouse/EMouseKeys";

export default class KeyStrokePart_Mouse extends KeyStrokePart {
	shouldBePressed: boolean;
	key: EMouseKeys;
	constructor(key: EMouseKeys, shouldBePressed: boolean) {
		super();
		this.key = key;
		this.shouldBePressed = shouldBePressed;
	}

	setKey(key: EMouseKeys) {
		this.key = key;
	}

	static createFrom(
		key: EMouseKeys,
		shouldBePressed = true
	): KeyStrokePart_Mouse {
		let keyStrokePartMouse = new KeyStrokePart_Mouse(key, shouldBePressed);
		return keyStrokePartMouse;
	}
}
