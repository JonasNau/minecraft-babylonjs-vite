import { EKeyboardCodeSideIndependent } from "../EKeyboardCodeSideIndependent";
import KeyStrokePart from "./KeyStrokePart";
import KeyStrokePart_Keyboard from "./KeyStrokePart_Keyboard";
import KeyStrokePart_Mouse from "./KeyStrokePart_Mouse";
import { EKeyboardCode } from "../keyboard/EKeyboardCode";
import { EMouseKeys } from "../mouse/EMouseKeys";

export default class Keystroke {
	keyStrokeParts: Array<KeyStrokePart>;
	constructor() {
		this.keyStrokeParts = new Array();
	}

	add(keyStrokePart: KeyStrokePart) {
		this.keyStrokeParts.push(keyStrokePart);
	}

	static from(keystrokeParts: Array<KeyStrokePart>): Keystroke {
		let keyStroke = new Keystroke();
		keyStroke.keyStrokeParts = keystrokeParts;
		return keyStroke;
	}

	static fromMixedContent(
		...keystrokeParts: Array<
			| KeyStrokePart
			| KeyStrokePart_Keyboard
			| KeyStrokePart_Mouse
			| EKeyboardCode
			| EKeyboardCodeSideIndependent
			| EMouseKeys
			| string
		>
	): Keystroke {
		let keyStroke = new Keystroke();

		for (let keyStrokePiece of keystrokeParts) {
			if (keyStrokePiece instanceof KeyStrokePart) {
				keyStroke.add(keyStrokePiece);
			} else if (
				Object.keys(EKeyboardCode).includes(keyStrokePiece as EKeyboardCode)
			) {
				//Keyboard
				let keystrokePartkeyboard =
					KeyStrokePart_Keyboard.createFromEkeyboardCode(
						keyStrokePiece as EKeyboardCode,
						true
					);
				keyStroke.add(keystrokePartkeyboard);
			} else if (
				Object.values(EKeyboardCodeSideIndependent).includes(
					keyStrokePiece as EKeyboardCodeSideIndependent
				)
			) {
				//Keyboard
				let keystrokePartkeyboard =
					KeyStrokePart_Keyboard.createFromIgnoreSideCode(
						keyStrokePiece as EKeyboardCodeSideIndependent,
						true
					);
				keyStroke.add(keystrokePartkeyboard);
			} else if (
				Object.values(EMouseKeys).includes(keyStrokePiece as EMouseKeys)
			) {
				//Mouse
				let keystrokePartMouse = KeyStrokePart_Mouse.createFrom(
					keyStrokePiece as EMouseKeys,
					true
				);
				keyStroke.add(keystrokePartMouse);
			} else {
				//Char on Keyboard
				//Keyboard
				let keystrokePartkeyboard = KeyStrokePart_Keyboard.createFromCaracter(
					keyStrokePiece as string,
					true
				);
				keyStroke.add(keystrokePartkeyboard);
			}
		}
		return keyStroke;
	}
}
