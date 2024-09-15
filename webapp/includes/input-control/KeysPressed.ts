import { channel } from "diagnostics_channel";
import KeyboardKey from "./KeyboardKey";
import { EKeyboardCode } from "./keyboard/EKeyboardCode";

export default class KeysPressed {
	keys: Array<KeyboardKey>;
	constructor() {
		this.keys = [];
	}

	pressKey(character: string, code: EKeyboardCode) {
		let keyBoardKey = this.getKeyByCharacterAndCode(character, code);
		if (keyBoardKey == null)
			keyBoardKey = this.createKeyboardKeyAndAddToList(character, code);
		keyBoardKey.press();
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
		keyBoardKey.release();
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

	onlyKeyStrokeIsPressed(
		keystroke: Array<{
			isEKeyboardCode: boolean;
			value: string | EKeyboardCode;
			isPressed?: boolean;
		}>
	) {
		let keyStrokeIsPressed = true;
		let keysThatShouldntBePressed = { ...this.keys };
		for (let currentKeyboardKeyInKeyStroke of keystroke) {
			//Check for EKeyboardCode
			if (currentKeyboardKeyInKeyStroke.isEKeyboardCode) {
				let allKeyBoardKeysWithCode = this.getAllKeysByCode(
					currentKeyboardKeyInKeyStroke.value as EKeyboardCode
				);
				let shouldBePressed =
					currentKeyboardKeyInKeyStroke.isPressed == undefined
						? true
						: currentKeyboardKeyInKeyStroke.isPressed;
				let oneIsPressed = allKeyBoardKeysWithCode.some(
					(currentKeyboardKey) => {
						return currentKeyboardKey.isPressed == shouldBePressed;
					}
				);
				if (!oneIsPressed) {
					keyStrokeIsPressed = false;
					break;
				}
			}

			//Check for character
			let allKeyBoardKeysWithCharacter = this.getAllKeysByCharacter(
				currentKeyboardKeyInKeyStroke.value
			);
			let shouldBePressed =
				currentKeyboardKeyInKeyStroke.isPressed == undefined
					? true
					: currentKeyboardKeyInKeyStroke.isPressed;
			let oneIsPressed = allKeyBoardKeysWithCharacter.some(
				(currentKeyboardKey) => {
					return currentKeyboardKey.isPressed == shouldBePressed;
				}
			);
			if (!oneIsPressed) {
				keyStrokeIsPressed = false;
				break;
			}
		}
		return keyStrokeIsPressed;
	}
}
