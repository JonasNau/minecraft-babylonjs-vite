import * as objectFunctions from "j-object-functions";
import KeyboardKey from "./KeyboardKey";
import { EKeyboardCode } from "./EKeyboardCode";

export default class KeboardInputController {
	keys: Array<KeyboardKey>;
	constructor() {
		this.keys = [];
	}

	pressKey(character: string, code: EKeyboardCode) {
		let keyBoardKey = this.getKeyByCharacterAndCode(character, code);
		if (keyBoardKey == null)
			keyBoardKey = this.createKeyboardKeyAndAddToList(character, code);
		keyBoardKey.press();
		//Get all other keys that have the same EKeyboardCode and set them to false,
		//because it isnt possible that another key is presses with the same keycode
		//at the same time
		let allKeysWithCode = this.getAllKeysByCode(code);
		if (!allKeysWithCode.length) return;
		allKeysWithCode = allKeysWithCode.filter((key) => {
			return key.character !== character;
		});
		for (const key of allKeysWithCode) {
			key.release();
		}
	}

	setKeysByCharacter(character: string, isPressed: boolean) {
		this.keys.forEach((currentKeyboardkey) => {
			if (currentKeyboardkey.character == character) {
				currentKeyboardkey.isPressed = isPressed;
			}
		});
	}

	setKeysByCode(code: EKeyboardCode, isPressed: boolean) {
		this.keys.forEach((currentKeyboardkey) => {
			if (currentKeyboardkey.code == code) {
				currentKeyboardkey.isPressed = isPressed;
			}
		});
	}

	releaseKey(character: string, code: EKeyboardCode) {
		let keyBoardKey = this.getKeyByCharacterAndCode(character, code);
		if (keyBoardKey == null)
			keyBoardKey = this.createKeyboardKeyAndAddToList(character, code);
		// keyBoardKey.release();
		//Release all keys with the keyboard code, because it isnt possible
		//that this key but just with a different character is pressed at the same time
		let allKeys = this.getAllKeysByCode(code);
		for (const key of allKeys) {
			key.release();
		}
	}

	createKeyboardKeyAndAddToList(
		character: string,
		code: EKeyboardCode
	): KeyboardKey {
		let keyBoardKey = new KeyboardKey(character, code);
		this.keys.push(keyBoardKey);
		return keyBoardKey;
	}

	keyBoardKeyExistsInList(character: string, code: EKeyboardCode): boolean {
		let keyBoardKey = this.getKeyByCharacterAndCode(character, code);
		if (keyBoardKey == null) return false;
		return true;
	}

	getKeyByCharacterAndCode(
		character: string,
		code: EKeyboardCode
	): KeyboardKey | null {
		let keyboardKey = this.keys.find((currentKeyboardKey) => {
			if (
				currentKeyboardKey.character == character &&
				currentKeyboardKey.code == code
			) {
				return true;
			}
			return false;
		});
		if (keyboardKey == undefined) return null;
		return keyboardKey;
	}

	getKeyByCharacter(character: string): KeyboardKey | null {
		let keyboardKey = this.keys.find((currentKeyboardKey) => {
			if (currentKeyboardKey.character == character) {
				return true;
			}
			return false;
		});
		if (keyboardKey == undefined) return null;
		return keyboardKey;
	}

	getKeyByCode(code: EKeyboardCode): KeyboardKey | null {
		let keyboardKey = this.keys.find((currentKeyboardKey) => {
			if (currentKeyboardKey.code == code) {
				return true;
			}
			return false;
		});
		if (keyboardKey == undefined) return null;
		return keyboardKey;
	}

	getAllKeysByCode(code: EKeyboardCode): Array<KeyboardKey> {
		let keyboardKeys = this.keys.filter((currentKeyboardKey) => {
			if (currentKeyboardKey.code == code) {
				return true;
			}
			return false;
		});
		return keyboardKeys;
	}

	keyIsPressedByCharacter(character: string): boolean {
		return this.keys.some((currentKeyboardKey) => {
			if (currentKeyboardKey.character == character) {
				return currentKeyboardKey.isPressed;
			}
		});
	}

	getAllKeysByCharacter(character: string): Array<KeyboardKey> {
		let keyboardKeys = this.keys.filter((currentKeyboardKey) => {
			if (currentKeyboardKey.character == character) {
				return true;
			}
			return false;
		});
		return keyboardKeys;
	}

	keyIsPressedByKeyCode(code: EKeyboardCode): boolean {
		return this.keys.some((currentKeyboardKey) => {
			if (currentKeyboardKey.code == code) {
				return currentKeyboardKey.isPressed;
			}
		});
	}

	shiftIsPressed(): boolean {
		if (
			this.getKeyByCode(EKeyboardCode.ShiftLeft)?.isPressed ||
			this.getKeyByCode(EKeyboardCode.ShiftRight)
		) {
			return true;
		}
		return false;
	}

	altIsPressed(): boolean {
		if (
			this.getKeyByCode(EKeyboardCode.AltLeft)?.isPressed ||
			this.getKeyByCode(EKeyboardCode.AltRight)
		) {
			return true;
		}
		return false;
	}

	ctrlIsPressed(): boolean {
		if (
			this.getKeyByCode(EKeyboardCode.ControlLeft)?.isPressed ||
			this.getKeyByCode(EKeyboardCode.ControlRight)
		) {
			return true;
		}
		return false;
	}

	metaIsPressed(): boolean {
		if (
			this.getKeyByCode(EKeyboardCode.MetaLeft)?.isPressed ||
			this.getKeyByCode(EKeyboardCode.MetaRight)
		) {
			return true;
		}
		return false;
	}
}
