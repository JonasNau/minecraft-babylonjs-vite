import * as objectFunctions from "j-object-functions";
import { EKeyboardCodeSideIndependent } from "./EKeyboardCodeSideIndependent";
import Keystroke from "./keystroke/KeyStroke";
import KeyStrokePart_Keyboard from "./keystroke/KeyStrokePart_Keyboard";
import KeyStrokePart_Mouse from "./keystroke/KeyStrokePart_Mouse";
import KeyboardKey from "./KeyboardKey";
import { EKeyboardCode } from "./keyboard/EKeyboardCode";
import { isEqual } from "lodash";
import { removeFromArray } from "j-object-functions";
import KeboardInputController from "./keyboard/KeyboardInputController";
import MouseInputController from "./mouse/MouseInputController";
import MouseKey from "./mouse/MouseKey";
import KeySequenceController from "./keysequence/KeySequenceController";
import InputEventListener from "./InputEventListener";
import { KeyboardEvents } from "./keyboard/KeyboardEvents";

export default class InputController {
	elementToListenTo: HTMLElement;
	keyboardInputController: KeboardInputController;
	mouseInputController: MouseInputController;
	keySequenceController: KeySequenceController;
	inputListenerForStatusChange?: InputEventListener;
	registerdKeyStrokes: Array<{
		keyStroke: Keystroke;
		callback: (event: Event) => void;
		keyDownOrUp: KeyboardEvents;
	}>;
	inputListenerForRegisteredKeyStrokes?: InputEventListener;

	constructor(elementToListenTo: HTMLElement) {
		this.elementToListenTo = elementToListenTo;
		this.keyboardInputController = new KeboardInputController();
		this.mouseInputController = new MouseInputController();
		this.keySequenceController = new KeySequenceController(this);
		this.registerdKeyStrokes = [];
	}

	onlyKeyStrokeIsPressed(keystroke: Keystroke) {
		let keyStrokeIsPressed = true;
		let keysThatShouldntBePressed: Array<KeyboardKey | MouseKey> = new Array();
		keysThatShouldntBePressed = keysThatShouldntBePressed.concat(
			this.keyboardInputController.keys,
			Array.from(this.mouseInputController.keys.values())
		);

		for (let currentKeystrokePart of keystroke.keyStrokeParts) {
			if (currentKeystrokePart instanceof KeyStrokePart_Keyboard) {
				//Check for EKeyboardCode
				if (
					currentKeystrokePart.isEkeyboardCode() &&
					currentKeystrokePart.eKeyboardCode
				) {
					let allKeyBoardKeysWithCode =
						this.keyboardInputController.getAllKeysByCode(
							currentKeystrokePart.eKeyboardCode
						);

					//Remove all found keys from the list of keys that should not be pressed
					allKeyBoardKeysWithCode.forEach((key) => {
						keysThatShouldntBePressed = objectFunctions.removeFromArray(
							keysThatShouldntBePressed,
							key,
							true
						);
					});

					let shouldBePressed = currentKeystrokePart.shouldBePressed;

					if (!allKeyBoardKeysWithCode.length) {
						//Key wasn't pressed yet
						if (shouldBePressed) {
							keyStrokeIsPressed = false;
							break;
						}
					}

					let oneHasTheValue = allKeyBoardKeysWithCode.some(
						(currentKeyboardKey) => {
							return currentKeyboardKey.isPressed == shouldBePressed;
						}
					);
					if (!oneHasTheValue) {
						keyStrokeIsPressed = false;
						break;
					}
					continue;
				} else if (currentKeystrokePart.isIgnoreSite()) {
					let allKeyBoardKeysWithCode = new Array<KeyboardKey>();
					if (
						currentKeystrokePart.ignoreSiteCode ==
						EKeyboardCodeSideIndependent.CTRL
					) {
						allKeyBoardKeysWithCode = allKeyBoardKeysWithCode.concat(
							this.keyboardInputController.getAllKeysByCode(
								EKeyboardCode.ControlRight
							)
						);
						allKeyBoardKeysWithCode = allKeyBoardKeysWithCode.concat(
							this.keyboardInputController.getAllKeysByCode(
								EKeyboardCode.ControlLeft
							)
						);
					} else if (
						currentKeystrokePart.ignoreSiteCode ==
						EKeyboardCodeSideIndependent.ALT
					) {
						allKeyBoardKeysWithCode = allKeyBoardKeysWithCode.concat(
							this.keyboardInputController.getAllKeysByCode(
								EKeyboardCode.AltRight
							)
						);
						allKeyBoardKeysWithCode = allKeyBoardKeysWithCode.concat(
							this.keyboardInputController.getAllKeysByCode(
								EKeyboardCode.AltLeft
							)
						);
					} else if (
						currentKeystrokePart.ignoreSiteCode ==
						EKeyboardCodeSideIndependent.META
					) {
						allKeyBoardKeysWithCode = allKeyBoardKeysWithCode.concat(
							this.keyboardInputController.getAllKeysByCode(
								EKeyboardCode.MetaRight
							)
						);
						allKeyBoardKeysWithCode = allKeyBoardKeysWithCode.concat(
							this.keyboardInputController.getAllKeysByCode(
								EKeyboardCode.MetaLeft
							)
						);
					} else if (
						currentKeystrokePart.ignoreSiteCode ==
						EKeyboardCodeSideIndependent.SHIFT
					) {
						allKeyBoardKeysWithCode = allKeyBoardKeysWithCode.concat(
							this.keyboardInputController.getAllKeysByCode(
								EKeyboardCode.ShiftLeft
							)
						);
						allKeyBoardKeysWithCode = allKeyBoardKeysWithCode.concat(
							this.keyboardInputController.getAllKeysByCode(
								EKeyboardCode.ShiftRight
							)
						);
					}

					//Remove all found keys from the list of keys that should not be pressed
					allKeyBoardKeysWithCode.forEach((key) => {
						keysThatShouldntBePressed = objectFunctions.removeFromArray(
							keysThatShouldntBePressed,
							key,
							true
						);
					});

					let shouldBePressed = currentKeystrokePart.shouldBePressed;

					if (!allKeyBoardKeysWithCode.length) {
						//Key wasn't pressed yet
						if (shouldBePressed) {
							keyStrokeIsPressed = false;
							break;
						}
					}

					let oneHasTheValue = allKeyBoardKeysWithCode.some(
						(currentKeyboardKey) => {
							return currentKeyboardKey.isPressed == shouldBePressed;
						}
					);
					if (!oneHasTheValue) {
						keyStrokeIsPressed = false;
						break;
					}
					continue;
				}

				if (currentKeystrokePart.character === undefined) {
					console.warn(
						`One defined key part in the keystroke is defined by a character but the character is undefned`,
						{ currentKeystrokePart }
					);
					continue;
				}

				//Check for character
				let allKeyBoardKeysWithCharacter =
					this.keyboardInputController.getAllKeysByCharacter(
						currentKeystrokePart.character
					);
				//Remove all found keys from the list of keys that should not be pressed
				allKeyBoardKeysWithCharacter.forEach((key) => {
					keysThatShouldntBePressed = objectFunctions.removeFromArray(
						keysThatShouldntBePressed,
						key,
						true
					);
				});

				let shouldBePressed = currentKeystrokePart.shouldBePressed;

				if (!allKeyBoardKeysWithCharacter.length) {
					//Key wasn't pressed yet
					if (shouldBePressed) {
						keyStrokeIsPressed = false;
						break;
					}
				}

				let oneHasTheValue = allKeyBoardKeysWithCharacter.some(
					(currentKeyboardKey) => {
						return currentKeyboardKey.isPressed == shouldBePressed;
					}
				);
				if (!oneHasTheValue) {
					keyStrokeIsPressed = false;
					break;
				}
			} else if (currentKeystrokePart instanceof KeyStrokePart_Mouse) {
				if (currentKeystrokePart.key === undefined) {
					console.warn(`The mouse key is undefined`, { currentKeystrokePart });
					continue;
				}

				let mouseKey = this.mouseInputController.getMouseKey(
					currentKeystrokePart.key
				);
				if (!mouseKey) {
					keyStrokeIsPressed = false;
					break;
				}

				keysThatShouldntBePressed = objectFunctions.removeFromArray(
					keysThatShouldntBePressed,
					mouseKey,
					true
				);

				let shouldBePressed = currentKeystrokePart.shouldBePressed;

				if (mouseKey.isPressed !== shouldBePressed) {
					keyStrokeIsPressed = false;
					break;
				}
				continue;
			} else {
				throw new Error(
					"The key in keystroke is neither a keyboard key nor a mouse key."
				);
			}
		}

		let someOtherKeyIsPressed = keysThatShouldntBePressed.some((key) => {
			return key.isPressed == true;
		});

		if (someOtherKeyIsPressed) return false;

		return keyStrokeIsPressed;
	}

	listenToInputs() {
		this.inputListenerForStatusChange = new InputEventListener(
			this.elementToListenTo
		);

		this.inputListenerForStatusChange.setKeyboardDown((event) => {
			// console.log("keydown", event.key);
			this.keyboardInputController.pressKey(
				event.key,
				event.code as EKeyboardCode
			);
		});

		this.inputListenerForStatusChange.setKeyboardUp((event) => {
			// console.log("keyup", event.key);
			this.keyboardInputController.releaseKey(
				event.key,
				event.code as EKeyboardCode
			);
		});

		this.inputListenerForStatusChange.setMouseDown((event) => {
			this.mouseInputController.pressKey(event.button);
		});

		this.inputListenerForStatusChange.setMouseUp((event) => {
			this.mouseInputController.releaseKey(event.button);
		});
	}

	stopListeningToInputs() {
		if (!this.inputListenerForStatusChange) {
			return;
		}
		this.inputListenerForStatusChange.removeKeyboardDown();
		this.inputListenerForStatusChange.removeKeyboardUp();
		this.inputListenerForStatusChange.removeMouseDown();
		this.inputListenerForStatusChange.removeMouseUp();
	}

	registerKeyStroke(
		keystroke: Keystroke,
		callback: (event: Event) => void,
		keyDownOrUp?: KeyboardEvents
	) {
		if (
			!this.registerdKeyStrokes.length ||
			!this.inputListenerForRegisteredKeyStrokes
		) {
			this.registerListenerForKeyStrokes();
		}
		if (this.keyStrokeIsAlreadyRegistered(keystroke)) {
			throw new Error(
				"The keystroke is already registered and canno't be registered again."
			);
		}
		let keyStrokeEntry = {
			keyStroke: keystroke,
			callback: callback,
			keyDownOrUp: keyDownOrUp ?? KeyboardEvents.KeyDown,
		};
		this.registerdKeyStrokes.push(keyStrokeEntry);
	}

	registerListenerForKeyStrokes() {
		if (this.inputListenerForRegisteredKeyStrokes) {
			this.unregisterListenerForKeyStrokes();
		}
		delete this.inputListenerForRegisteredKeyStrokes;
		this.inputListenerForRegisteredKeyStrokes = new InputEventListener(
			this.elementToListenTo
		);
		this.inputListenerForRegisteredKeyStrokes.setKeyboardDown((event) => {
			let keyStrokesWithKeyDown = this.registerdKeyStrokes.filter(
				(current) => current.keyDownOrUp === KeyboardEvents.KeyDown
			);
			//Check if keystrokes are pressed
			let keyStrokesThatMatch = keyStrokesWithKeyDown.filter(
				(currentKeyScroke) => {
					return this.onlyKeyStrokeIsPressed(currentKeyScroke.keyStroke);
				}
			);
			if (!keyStrokesThatMatch.length) return;
			this.checkWhichKeyStrokeMatchesMostAndFireCallback(
				event,
				keyStrokesThatMatch
			);
		});
		this.inputListenerForRegisteredKeyStrokes.setKeyboardUp((event) => {
			let keyStrokesWithKeyUp = this.registerdKeyStrokes.filter(
				(current) => current.keyDownOrUp === KeyboardEvents.KeyUp
			);
			//Check if keystrokes are pressed
			let keyStrokesThatMatch = keyStrokesWithKeyUp.filter(
				(currentKeyScroke) => {
					return this.onlyKeyStrokeIsPressed(currentKeyScroke.keyStroke);
				}
			);
			if (!keyStrokesThatMatch.length) return;
			this.checkWhichKeyStrokeMatchesMostAndFireCallback(
				event,
				keyStrokesThatMatch
			);
		});
	}

	stopListenerForKeyStrokes() {
		this.inputListenerForRegisteredKeyStrokes?.removeKeyboardDown();
		this.inputListenerForRegisteredKeyStrokes?.removeKeyboardUp();
		this.inputListenerForRegisteredKeyStrokes?.removeMouseDown();
		this.inputListenerForRegisteredKeyStrokes?.removeMouseUp();
	}

	checkWhichKeyStrokeMatchesMostAndFireCallback(
		event: Event,
		keyStrokesThatMatch: Array<{
			keyStroke: Keystroke;
			callback: (event: Event) => void;
			keyDownOrUp: KeyboardEvents;
		}>
	) {
		//Get the keystrokes that match and have the most keys in it
		keyStrokesThatMatch = keyStrokesThatMatch.sort((a, b) => {
			return (
				b.keyStroke.keyStrokeParts.length - a.keyStroke.keyStrokeParts.length
			);
		});
		if (!keyStrokesThatMatch.length) return;

		let maxKeyStrokeLength =
			keyStrokesThatMatch[0].keyStroke.keyStrokeParts.length;

		keyStrokesThatMatch = keyStrokesThatMatch.filter((current) => {
			return current.keyStroke.keyStrokeParts.length === maxKeyStrokeLength;
		});

		if (keyStrokesThatMatch.length > 1) {
			console.debug({
				message: "Multiple Keystrokes with the same keystroke length match.",
				keyStrokesThatMatch,
			});
			throw new Error(
				"Multiple Keystrokes with the same keystroke length match."
			);
		}

		keyStrokesThatMatch[0].callback(event);
	}

	recordKeyStroke(
		maxKeys: number,
		mouseAllowed: boolean,
		keyboardAllowed: boolean
	): Promise<Keystroke> {
		return new Promise((resolve, reject) => {
			if (!mouseAllowed && !keyboardAllowed) {
				reject(
					"Cannot record keystroke because there is no input method allowed."
				);
			}

			let keyStroke = new Keystroke();
			this.stopListeningToInputs();
			this.stopListenerForKeyStrokes();

			let inputEventListener = new InputEventListener(this.elementToListenTo);
			if (keyboardAllowed) {
				inputEventListener.setKeyboardDown((keyboardEvent) => {
					keyboardEvent.preventDefault();
					if (keyboardEvent.code === EKeyboardCode.Escape) {
						clean();
						reject("User escaped");
					}
					if (
						this.keyboardInputController.keyIsPressedByKeyCode(
							keyboardEvent.code as EKeyboardCode
						)
					) {
						console.log("the user is holding the key");
						return;
					}
					if (keyStroke.keyStrokeParts.length > maxKeys) {
						resolveAndReturn();
						return;
					}
					let keyStrokePart_Keyboard = new KeyStrokePart_Keyboard(true);
					keyStrokePart_Keyboard.character = keyboardEvent.key;
					keyStrokePart_Keyboard.eKeyboardCode =
						keyboardEvent.code as EKeyboardCode;
					keyStroke.add(keyStrokePart_Keyboard);
					if (keyStroke.keyStrokeParts.length == maxKeys) {
						resolveAndReturn();
						return;
					}
				});
				inputEventListener.setKeyboardUp((keyboardEvent) => {
					keyboardEvent.preventDefault();
					resolveAndReturn();
				});
			}
			if (mouseAllowed) {
				inputEventListener.setMouseDown((mouseEvent) => {
					mouseEvent.preventDefault();
					if (keyStroke.keyStrokeParts.length > maxKeys) {
						resolveAndReturn();
						return;
					}
					let keyStrokePart_Mouse = new KeyStrokePart_Mouse(
						mouseEvent.button,
						true
					);
					keyStroke.add(keyStrokePart_Mouse);
					if (keyStroke.keyStrokeParts.length == maxKeys) {
						resolveAndReturn();
						return;
					}
				});
				inputEventListener.setMouseUp((mouseEvent) => {
					mouseEvent.preventDefault();
					resolveAndReturn();
				});
			}
			this.listenToInputs();
			this.registerListenerForKeyStrokes();

			const clean = () => {
				inputEventListener.removeKeyboardDown();
				inputEventListener.removeKeyboardUp();
				inputEventListener.removeMouseDown();
				inputEventListener.removeMouseUp();
			};

			const resolveAndReturn = () => {
				clean();
				resolve(keyStroke);
			};
		});
	}

	preventDefault(keyStroke: Keystroke) {
		this.registerKeyStroke(keyStroke, (event) => {
			event?.preventDefault();
		});
	}

	removePreventDefault(keyStroke: Keystroke) {
		this.unregisterKeyStroke(keyStroke);
	}

	unregisterListenerForKeyStrokes() {
		if (!this.inputListenerForRegisteredKeyStrokes) {
			return;
		}
		this.inputListenerForRegisteredKeyStrokes.removeKeyboardDown();
	}

	keyStrokeIsAlreadyRegistered(keyStroke: Keystroke): boolean {
		let found = this.registerdKeyStrokes.some((current) => {
			return isEqual(current.keyStroke, keyStroke);
		});
		return found;
	}

	unregisterKeyStroke(keystroke: Keystroke) {
		let found = this.registerdKeyStrokes.find((current) => {
			return isEqual(current.keyStroke, keystroke);
		});
		if (!found) return;
		this.registerdKeyStrokes = removeFromArray(this.registerdKeyStrokes, found);
	}
}
