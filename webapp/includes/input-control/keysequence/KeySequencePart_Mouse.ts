import { EMouseKeys } from "../mouse/EMouseKeys";
import KeySequencePart from "./KeySequencePart";

export default class KeySequencePart_Mouse extends KeySequencePart {
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
	): KeySequencePart_Mouse {
		let keyStrokePartMouse = new KeySequencePart_Mouse(key, shouldBePressed);
		return keyStrokePartMouse;
	}
}
