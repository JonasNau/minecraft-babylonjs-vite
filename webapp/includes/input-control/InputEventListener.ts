export default class InputEventListener {
	listenToElement: HTMLElement;
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

	constructor(listenToElement: HTMLElement) {
		this.listenToElement = listenToElement;
		this.eventListeners = {
			mouse: {},
			keyboard: {},
		};
	}

	setMouseDown(callback: (event: PointerEvent) => void) {
		this.listenToElement.addEventListener(
			"pointerdown",
			(this.eventListeners.mouse.down = (event) => {
				if (event instanceof PointerEvent) callback(event);
			})
		);
	}

	removeMouseDown() {
		if (this.eventListeners.mouse.down) {
			this.listenToElement.removeEventListener(
				"pointerdown",
				this.eventListeners.mouse.down
			);
		}
	}

	setMouseUp(callback: (event: PointerEvent) => void) {
		this.listenToElement.addEventListener(
			"pointerup",
			(this.eventListeners.mouse.up = (event) => {
				if (event instanceof PointerEvent) callback(event);
			})
		);
	}

	removeMouseUp() {
		if (this.eventListeners.mouse.up) {
			this.listenToElement.removeEventListener(
				"pointerup",
				this.eventListeners.mouse.up
			);
		}
	}

	setKeyboardDown(callback: (event: KeyboardEvent) => void) {
		this.listenToElement.addEventListener(
			"keydown",
			(this.eventListeners.keyboard.down = (event) => {
				//event.preventDefault();
				if (event instanceof KeyboardEvent) callback(event);
			})
		);
	}

	removeKeyboardDown() {
		if (this.eventListeners.keyboard.down) {
			this.listenToElement.removeEventListener(
				"keydown",
				this.eventListeners.keyboard.down
			);
		}
	}

	setKeyboardUp(callback: (event: KeyboardEvent) => void) {
		this.listenToElement.addEventListener(
			"keyup",
			(this.eventListeners.keyboard.up = (event) => {
				if (event instanceof KeyboardEvent) callback(event);
			})
		);
	}

	removeKeyboardUp() {
		if (this.eventListeners.keyboard.up) {
			this.listenToElement.removeEventListener(
				"keyup",
				this.eventListeners.keyboard.up
			);
		}
	}
}
