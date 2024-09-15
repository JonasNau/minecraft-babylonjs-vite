import InputController from "../input-control/InputController";
import { EKeyboardCode } from "../input-control/keyboard/EKeyboardCode";
import { EMouseKeys } from "../input-control/mouse/EMouseKeys";
import IDebugElement from "./IDebugElement";

export default class InputControlerDebugger implements IDebugElement {
	inputController: InputController;
	htmlElementOfCurrentDebuggerContainer?: HTMLElement;
	htmlElementToAttach?: HTMLElement;
	listenToElement: HTMLElement;
	isActive = false;
	isPaused = false;
	eventListeners: {
		mouse: {
			down?: EventListener;
			up?: EventListener;
		};
		keyboard: {
			down?: EventListener;
			up?: EventListener;
		};
	};

	constructor(inputController: InputController, listenToElement: HTMLElement) {
		this.inputController = inputController;
		this.listenToElement = listenToElement;

		this.eventListeners = {
			mouse: {},
			keyboard: {},
		};
	}

	setContainer(
		htmlElementOfCurrentDebuggerContainer: HTMLElement,
		htmlElementToAttach: HTMLElement
	): void {
		this.htmlElementOfCurrentDebuggerContainer =
			htmlElementOfCurrentDebuggerContainer;
		this.htmlElementToAttach = htmlElementToAttach;
	}

	update(keyboardList: HTMLElement, mouseList: HTMLElement): void {
		keyboardList.innerHTML = "";
		mouseList.innerHTML = "";

		//Keyboard
		///Alt
		let alt = document.createElement("li");
		alt.textContent = `ALT is pressed: ${this.inputController.keyboardInputController.altIsPressed()}`;
		keyboardList.appendChild(alt);
		///CTRL
		let ctrl = document.createElement("li");
		ctrl.textContent = `CTRL is pressed: ${this.inputController.keyboardInputController.ctrlIsPressed()}`;
		keyboardList.appendChild(ctrl);
		///SHIFT
		let shift = document.createElement("li");
		shift.textContent = `SHIFT is pressed: ${this.inputController.keyboardInputController.shiftIsPressed()}`;
		keyboardList.appendChild(shift);

		//HR
		keyboardList.appendChild(document.createElement("hr"));

		let keyboardKeys = this.inputController.keyboardInputController.keys;
		for (const key of keyboardKeys) {
			let li = document.createElement("li");
			li.textContent = `Char: ${key.character} | isPressed: ${key.isPressed} | keyCode: ${key.code}`;
			keyboardList.appendChild(li);
		}

		//Mouse
		mouseList.innerHTML = `
    <li>Main (Left):\t ${
			this.inputController.mouseInputController.getMouseKey(EMouseKeys.MAIN)
				?.isPressed
		}</li>
    <li>Secondard (Right):\t ${
			this.inputController.mouseInputController.getMouseKey(
				EMouseKeys.SECONDARY
			)?.isPressed
		}</li>
    <li>Wheel (Auxilary):\t ${
			this.inputController.mouseInputController.getMouseKey(EMouseKeys.AUXILARY)
				?.isPressed
		}</li>
    <li>Fourth:\t ${
			this.inputController.mouseInputController.getMouseKey(EMouseKeys.FOURTH)
				?.isPressed
		}</li>
    <li>Fifth:\t ${
			this.inputController.mouseInputController.getMouseKey(EMouseKeys.FOURTH)
				?.isPressed
		}</li>
    `;
	}

	start() {
		if (
			!this.htmlElementOfCurrentDebuggerContainer ||
			!this.htmlElementToAttach
		) {
			throw new Error(
				"The debug layer is not attached to an html element. call setContainer() first."
			);
		}
		this.isPaused = false;
		this.htmlElementOfCurrentDebuggerContainer.removeAttribute("data-paused");
		this.htmlElementOfCurrentDebuggerContainer.classList.remove("hidden");

		this.htmlElementToAttach.innerHTML = `
    <h3>Keyboard</h3>
    <ul data-debug="keyboard">
    </ul>
    <hr/>
    <h3>Mouse</h3>
    <ul data-debug="mouse">
    </ul>
    `;

		let keyboardList = this.htmlElementToAttach.querySelector(
			"ul[data-debug=keyboard]"
		)! as HTMLElement;
		let mouseList = this.htmlElementToAttach.querySelector(
			"ul[data-debug=mouse]"
		)! as HTMLElement;

		this.listenToElement.addEventListener(
			"keydown",
			(this.eventListeners.keyboard.down = () => {
				this.update(keyboardList, mouseList);
			})
		);
		this.listenToElement.addEventListener(
			"keyup",
			(this.eventListeners.keyboard.up = () => {
				this.update(keyboardList, mouseList);
			})
		);

		this.listenToElement.addEventListener(
			"pointerdown",
			(this.eventListeners.mouse.down = () => {
				this.update(keyboardList, mouseList);
			})
		);

		this.listenToElement.addEventListener(
			"pointerup",
			(this.eventListeners.mouse.up = () => {
				this.update(keyboardList, mouseList);
			})
		);

		this.update(keyboardList, mouseList);

		this.isActive = true;
	}

	hide() {
		if (
			!this.htmlElementOfCurrentDebuggerContainer ||
			!this.htmlElementToAttach
		) {
			throw new Error(
				"The debug layer is not attached to an html element. call setContainer() first."
			);
		}
		this.pause();
		this.htmlElementOfCurrentDebuggerContainer.removeAttribute("data-paused");
		this.htmlElementOfCurrentDebuggerContainer.classList.add("hidden");
		this.htmlElementOfCurrentDebuggerContainer.innerHTML = "";
		this.htmlElementToAttach.innerHTML = "";

		this.isActive = false;
	}

	pause() {
		if (
			!this.htmlElementOfCurrentDebuggerContainer ||
			!this.htmlElementToAttach
		) {
			throw new Error(
				"The debug layer is not attached to an html element. call setContainer() first."
			);
		}
		this.htmlElementOfCurrentDebuggerContainer.setAttribute(
			"data-paused",
			"true"
		);
		if (this.eventListeners.keyboard.down) {
			this.listenToElement.removeEventListener(
				"keydown",
				this.eventListeners.keyboard.down
			);
		}
		if (this.eventListeners.keyboard.up) {
			this.listenToElement.removeEventListener(
				"keydown",
				this.eventListeners.keyboard.up
			);
		}
		if (this.eventListeners.mouse.down) {
			this.listenToElement.removeEventListener(
				"keydown",
				this.eventListeners.mouse.down
			);
		}
		if (this.eventListeners.mouse.up) {
			this.listenToElement.removeEventListener(
				"keydown",
				this.eventListeners.mouse.up
			);
		}

		this.isPaused = true;
	}

	resume() {
		this.isPaused = false;
		this.start();
	}
}
