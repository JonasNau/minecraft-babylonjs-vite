import { EMouseKeys } from "./EMouseKeys";
import MouseKey from "./MouseKey";

export default class MouseInputController {
	keys: Map<EMouseKeys, MouseKey>;
	constructor() {
		this.keys = new Map();
	}

	pressKey(key: EMouseKeys) {
		if (!this.keys.has(key)) {
			this.keys.set(key, new MouseKey(key));
		}
		this.keys.get(key)!.press();
	}

	releaseKey(key: EMouseKeys) {
		if (!this.keys.has(key)) {
			this.keys.set(key, new MouseKey(key));
		}
		this.keys.get(key)!.release();
	}

	createMouseKeyAndAddToList(key: EMouseKeys): MouseKey {
		let mouseKey = new MouseKey(key);
		this.keys.set(key, mouseKey);
		return mouseKey;
	}

	mouseKeyExistsInList(key: EMouseKeys): boolean {
		return this.keys.has(key);
	}

	getMouseKey(key: EMouseKeys): MouseKey | null {
		let mouseKey = this.keys.get(key);
		if (!mouseKey) return null;
		return mouseKey;
	}

	mouseKeyIsPressed(key: EMouseKeys): boolean {
		let mouseKey = this.getMouseKey(key);
		if (!mouseKey) return false;
		return mouseKey.isPressed;
	}
}
