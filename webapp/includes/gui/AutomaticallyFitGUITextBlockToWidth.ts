import { AdvancedDynamicTexture } from "@babylonjs/gui";
import * as BABYLON_GUI from "@babylonjs/gui";
import { MemoryHelperEventListeners } from "j-memoryhelper-functions";

export default class AutomaticallyFitGUITextBlockToWidth {
	canvas: HTMLCanvasElement;
	canvas_context: CanvasRenderingContext2D;
	advancedDynamicTexture: AdvancedDynamicTexture;
	resizeEventListener?: EventListener;
	container: BABYLON_GUI.Control;
	textblock: BABYLON_GUI.TextBlock;
	memoryHelperEventListeners: MemoryHelperEventListeners;

	constructor(
		advancedDynamicTexture: AdvancedDynamicTexture,
		container: BABYLON_GUI.Control,
		textblock: BABYLON_GUI.TextBlock,
		memoryHelperEventListeners: MemoryHelperEventListeners
	) {
		this.canvas = document.createElement("canvas");
		let canvas_context = this.canvas.getContext("2d");
		if (!canvas_context) {
			throw new Error("Context of canvas inaccessible");
		}
		this.advancedDynamicTexture = advancedDynamicTexture;
		this.memoryHelperEventListeners = memoryHelperEventListeners;
		this.canvas_context = canvas_context;
		this.container = container;
		this.textblock = textblock;
	}

	automaticallyFitTextToContainer(ajustOnResize = true) {
		if (ajustOnResize) {
			this.resizeEventListener = () => {
				this.recalculateTextSizeAndSet();
			};
			this.memoryHelperEventListeners.addAndRegisterEventListener({
				ownerOfEventListener: window,
				type: "resize",
				eventListenerFunction: this.resizeEventListener,
			});
			this.recalculateTextSizeAndSet();
			return;
		}
		this.recalculateTextSizeAndSet();
	}

	recalculateTextSizeAndSet() {
		this.advancedDynamicTexture.onEndRenderObservable.addOnce(
			(eventData, eventState) => {
				let calculate = true;
				let textWidth = -1;
				let fontSize = this.container.heightInPixels;
				while (calculate) {
					this.canvas_context.font = `${fontSize}px ${this.textblock.fontFamily}`;
					textWidth = this.canvas_context.measureText(
						this.textblock.text
					).width;

					if (textWidth > this.container.widthInPixels) {
						fontSize--;
						continue;
					}
					calculate = false;
				}
				this.textblock.fontSizeInPixels = fontSize;
			}
		);
	}

	stopAutomaticallyFitTextToWidth() {
		if (!this.resizeEventListener) return;
		window.removeEventListener("resize", this.resizeEventListener);
	}

	setText(text: string) {
		this.textblock.text = text;
		this.recalculateTextSizeAndSet();
	}
}
