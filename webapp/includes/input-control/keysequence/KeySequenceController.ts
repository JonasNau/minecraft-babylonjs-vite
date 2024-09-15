import * as objectFunctions from "j-object-functions";
import KeySequenceEmptyError from "../../errors/input-controller/keySequence/KeySequenceEmptyError";
import InputController from "../InputController";
import KeySequence from "./KeySequence";
import KeySequencePart from "./KeySequencePart";
import { EKeyboardCodeSideIndependent } from "../EKeyboardCodeSideIndependent";
import { EKeyboardCode } from "../keyboard/EKeyboardCode";
import { EMouseKeys } from "../mouse/EMouseKeys";
import KeySequencePart_Keyboard from "./KeySequencePart_Keyboard";
import KeySequencePart_Mouse from "./KeySequencePart_Mouse";
import * as lodash from "lodash";

export default class KeySequenceController {
	inputController: InputController;
	registeredKeySequences: Array<KeySequence>;
	constructor(inputController: InputController) {
		this.inputController = inputController;
		this.registeredKeySequences = new Array<KeySequence>();
	}

	registerKeySequence(keySequence: KeySequence): boolean {
		keySequence.startListenToSequence(this.inputController);
		this.registeredKeySequences.push();
		return true;
	}

	registerFromMixedContent(
		keystrokeParts: Array<
			| KeySequencePart
			| KeySequencePart_Keyboard
			| KeySequencePart_Mouse
			| EKeyboardCode
			| EKeyboardCodeSideIndependent
			| EMouseKeys
			| string
		>,
		// eslint-disable-next-line @typescript-eslint/ban-types
		callback: Function
	): KeySequence {
		let keySequence = KeySequence.fromMixedContent(
			this.inputController.elementToListenTo,
			...keystrokeParts
		);
		keySequence.callback = callback;
		this.registerKeySequence(keySequence);
		return keySequence;
	}

	unregisterKeySequence(keySequence: KeySequence): boolean {
		let keySequenceFound = this.registeredKeySequences.find(
			(currentSequence) => {
				return currentSequence === keySequence;
			}
		);
		if (keySequenceFound === undefined) {
			return false;
		}

		keySequenceFound.unregister();
		this.registeredKeySequences = objectFunctions.removeFromArray(
			this.registeredKeySequences,
			keySequenceFound,
			true
		);

		return true;
	}

	unregisterFromMixedContent(
		...keystrokeParts: Array<
			| KeySequencePart
			| KeySequencePart_Keyboard
			| KeySequencePart_Mouse
			| EKeyboardCode
			| EKeyboardCodeSideIndependent
			| EMouseKeys
			| string
		>
	): boolean {
		let keySequecneFound = this.registeredKeySequences.find(
			(currentKeySequence) => {
				if (currentKeySequence.keySequenceParts.length != keystrokeParts.length)
					return false;
				return currentKeySequence.keySequenceParts.every(
					(currentKeySequencePart, index) => {
						return lodash.isEqual(
							currentKeySequencePart,
							keystrokeParts[index]
						);
					}
				);
			}
		);
		if (!keySequecneFound) {
			return false;
		}
		return this.unregisterKeySequence(keySequecneFound);
	}
}
