import KeySequenceEmptyError from "../../errors/input-controller/keySequence/KeySequenceEmptyError";
import { EKeyboardCodeSideIndependent } from "../EKeyboardCodeSideIndependent";
import InputController from "../InputController";
import InputEventListener from "../InputEventListener";
import { EKeyboardCode } from "../keyboard/EKeyboardCode";
import { EMouseKeys } from "../mouse/EMouseKeys";
import KeySequencePart from "./KeySequencePart";
import KeySequencePart_Keyboard from "./KeySequencePart_Keyboard";
import KeySequencePart_Mouse from "./KeySequencePart_Mouse";

export default class KeySequence {
	listenToElement: HTMLElement;
	isTriggered: boolean;
	keySequenceParts: Array<KeySequencePart>;
	numberOfKeysPressedInARow: number;
	callback?: Function;
	inputController?: InputController;
	inputEventListener?: InputEventListener;
	constructor(listenToElement: HTMLElement) {
		this.listenToElement = listenToElement;
		this.isTriggered = false;
		this.keySequenceParts = new Array<KeySequencePart>();
		this.numberOfKeysPressedInARow = 0;
	}

	add(keySequencePart: KeySequencePart) {
		this.keySequenceParts.push(keySequencePart);
	}

	static from(
		listenToElement: HTMLElement,
		keySequenceParts: Array<KeySequencePart>,
		callback: Function
	): KeySequence {
		let keySequence = new KeySequence(listenToElement);
		keySequence.keySequenceParts = keySequenceParts;
		keySequence.callback = callback;
		return keySequence;
	}

	checkNextPartOfSequence() {
		if (!this.inputController) {
			throw new Error("Input controller not defined");
		}
		let nextKeyNeededToBePressed =
			this.keySequenceParts[this.numberOfKeysPressedInARow];
		if (nextKeyNeededToBePressed instanceof KeySequencePart_Keyboard) {
			//Check if the pressed key on the keyboard matches the input
			if (nextKeyNeededToBePressed.isEkeyboardCode()) {
				if (
					this.inputController.keyboardInputController.keyIsPressedByKeyCode(
						nextKeyNeededToBePressed.eKeyboardCode!
					)
				) {
					this.addOneToKeyStreak();
					return;
				}
				this.resetKeyStreak();
			} else if (nextKeyNeededToBePressed.isKeyboardCodeSideInpependent()) {
				switch (nextKeyNeededToBePressed.eKeyboardCodeSideInpependent) {
					case EKeyboardCodeSideIndependent.CTRL:
						if (this.inputController.keyboardInputController.ctrlIsPressed()) {
							this.addOneToKeyStreak();
							return;
						}
						this.resetKeyStreak();
						break;
					case EKeyboardCodeSideIndependent.ALT:
						if (this.inputController.keyboardInputController.altIsPressed()) {
							this.addOneToKeyStreak();
							return;
						}
						this.resetKeyStreak();
						break;
					case EKeyboardCodeSideIndependent.META:
						if (this.inputController.keyboardInputController.metaIsPressed()) {
							this.addOneToKeyStreak();
							return;
						}
						this.resetKeyStreak();
						break;
					case EKeyboardCodeSideIndependent.SHIFT:
						if (this.inputController.keyboardInputController.shiftIsPressed()) {
							this.addOneToKeyStreak();
							return;
						}
						this.resetKeyStreak();
						break;
					default:
						this.resetKeyStreak();
						break;
				}
			} else {
				if (nextKeyNeededToBePressed.character === undefined) {
					throw new Error(
						"The character to check in a key sequence is undefined"
					);
				}
				//Check character
				if (
					this.inputController.keyboardInputController.keyIsPressedByCharacter(
						nextKeyNeededToBePressed.character
					)
				) {
					this.addOneToKeyStreak();
					return;
				}
				this.resetKeyStreak();
			}
		} else if (nextKeyNeededToBePressed instanceof KeySequencePart_Mouse) {
			if (
				this.inputController.mouseInputController.mouseKeyIsPressed(
					nextKeyNeededToBePressed.key
				)
			) {
				this.addOneToKeyStreak();
				return;
			}
			this.resetKeyStreak();
		} else {
			this.resetKeyStreak();
			return;
		}
	}

	addOneToKeyStreak() {
		if (this.numberOfKeysPressedInARow >= this.keySequenceParts.length - 1) {
			if (this.callback) {
				this.callback();
			} else {
				this.isTriggered = true;
			}
			this.resetKeyStreak();
			return;
		}
		this.numberOfKeysPressedInARow++;
	}

	resetKeyStreak() {
		this.numberOfKeysPressedInARow = 0;
	}

	startListenToSequence(inputController: InputController): boolean {
		if (!this.keySequenceParts.length) {
			console.error({ keySequenceParts: this.keySequenceParts });
			throw new KeySequenceEmptyError(
				"The key sequence you want to start to listen for is empty."
			);
		}
		this.inputController = inputController;

		let isListening = false;

		this.inputEventListener = new InputEventListener(this.listenToElement);

		if (
			this.keySequenceParts.some((keySequencePart) => {
				return keySequencePart instanceof KeySequencePart_Keyboard;
			})
		) {
			//Key Sequence contains a keyboard key
			this.inputEventListener.setKeyboardDown(() => {
				this.checkNextPartOfSequence();
			});
			isListening = true;
		}

		if (
			this.keySequenceParts.some((keySequencePart) => {
				return keySequencePart instanceof KeySequencePart_Mouse;
			})
		) {
			//Key Sequence contains a mouse key
			this.inputEventListener.setMouseDown(() => {
				this.checkNextPartOfSequence();
			});
			isListening = true;
		}

		if (!isListening) {
			delete this.inputEventListener;
		}

		return isListening;
	}

	unregister(): void {
		if (!this.inputEventListener) {
			return;
		}
		this.inputEventListener.removeKeyboardDown();
		this.inputEventListener.removeMouseDown();
		return;
	}

	static fromMixedContent(
		htmlElementToListenTo: HTMLElement,
		...keystrokeParts: Array<
			| KeySequencePart
			| KeySequencePart_Keyboard
			| KeySequencePart_Mouse
			| EKeyboardCode
			| EKeyboardCodeSideIndependent
			| EMouseKeys
			| string
		>
	): KeySequence {
		let keySequence = new KeySequence(htmlElementToListenTo);

		for (let keySequencePiece of keystrokeParts) {
			if (keySequencePiece instanceof KeySequencePart) {
				keySequence.add(keySequencePiece);
			} else if (
				Object.keys(EKeyboardCode).includes(keySequencePiece as EKeyboardCode)
			) {
				//Keyboard
				let keySequencePartKeyboard =
					KeySequencePart_Keyboard.createFromEkeyboardCode(
						keySequencePiece as EKeyboardCode,
						true
					);
				keySequence.add(keySequencePartKeyboard);
			} else if (
				Object.values(EKeyboardCodeSideIndependent).includes(
					keySequencePiece as EKeyboardCodeSideIndependent
				)
			) {
				//Keyboard
				let keySequencePartKeyboard =
					KeySequencePart_Keyboard.createFromIgnoreSideCode(
						keySequencePiece as EKeyboardCodeSideIndependent,
						true
					);
				keySequence.add(keySequencePartKeyboard);
			} else if (
				Object.values(EMouseKeys).includes(keySequencePiece as EMouseKeys)
			) {
				//Mouse
				let keySequencePartMouse = KeySequencePart_Mouse.createFrom(
					keySequencePiece as EMouseKeys,
					true
				);
				keySequence.add(keySequencePartMouse);
			} else {
				//Char on Keyboard
				//Keyboard
				let keySequencePartKeyboard =
					KeySequencePart_Keyboard.createFromCaracter(
						keySequencePiece as string,
						true
					);
				keySequence.add(keySequencePartKeyboard);
			}
		}
		return keySequence;
	}
}
