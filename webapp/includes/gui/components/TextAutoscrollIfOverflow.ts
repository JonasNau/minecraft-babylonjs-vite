import * as BABYLON_GUI from "@babylonjs/gui";
import { Animation, AnimationGroup } from "@babylonjs/core";
import { MemoryHelperEventListeners } from "j-memoryhelper-functions";
import GlobalOptions from "../../settings/GlobalOptions";

export type TextAutoScrollIfOverflowOptions = {
	name: string;
	width?: string;
	height?: string;
	text: {
		fontSize: string;
		color?: string;
		textContent?: string;
		fontFamily?: string;
		charactersPerSecond: number;
	};
	memoryHelperEventlistener: MemoryHelperEventListeners;
	advancedDynamicTexture: BABYLON_GUI.AdvancedDynamicTexture;
};

export default class TextAutoScrollIfOverflow {
	advancedDynamicTexture: BABYLON_GUI.AdvancedDynamicTexture;
	charactersPerSecond: number;
	textWrapper: BABYLON_GUI.Rectangle;
	textblock: BABYLON_GUI.TextBlock;
	memoryHelperEventListeners: MemoryHelperEventListeners;
	animationGroup: AnimationGroup | null;

	constructor(options: TextAutoScrollIfOverflowOptions) {
		this.charactersPerSecond = options.text.charactersPerSecond;
		this.memoryHelperEventListeners = options.memoryHelperEventlistener;
		this.advancedDynamicTexture = options.advancedDynamicTexture;

		this.textWrapper = new BABYLON_GUI.Rectangle(`wrapper_${options.name}`);
		this.textWrapper.thickness = 0; // Remove border
		if (options.width) this.textWrapper.width = options.width;
		if (options.height) this.textWrapper.height = options.height;

		this.textblock = new BABYLON_GUI.TextBlock(options.name);
		this.textWrapper.addControl(this.textblock);
		if (options.text.textContent)
			this.textblock.text = options.text.textContent;
		this.textblock.fontSize = options.text.fontSize;
		this.textblock.fontFamily =
			options.text.fontFamily ?? GlobalOptions.options.standardFont;
		this.textblock.color = options.text.color ?? "black";
		this.textblock.resizeToFit = true;

		this.animationGroup = null;

		this.memoryHelperEventListeners.addAndRegisterEventListener({
			ownerOfEventListener: window,
			type: "resize",
			eventListenerFunction: () => {
				this.recalculateAndSet();
			},
		});
		this.recalculateAndSet();
	}

	setText(text: string) {
		this.textblock.text = text;
		this.recalculateAndSet();
	}

	recalculateAndSet() {
		this.advancedDynamicTexture.onBeginRenderObservable.addOnce((eventData) => {
			if (this.animationGroup) {
				this.animationGroup.stop();
				this.animationGroup.dispose();
				this.textblock.left = 0;
				this.animationGroup = null;
			}

			const textWidth = this.textblock.widthInPixels;
			const wrapperWidth = this.textWrapper.widthInPixels || 0;

			if (textWidth > wrapperWidth) {
				const durationInSeconds =
					this.textblock.text.length / this.charactersPerSecond;
				const framesPerSecond = 30; // Adjust the frame rate as needed

				this.animationGroup = new AnimationGroup("textAnimationGroup");
				const animation = new Animation(
					"textAnimation",
					"left",
					framesPerSecond,
					Animation.ANIMATIONTYPE_FLOAT,
					Animation.ANIMATIONLOOPMODE_CYCLE
				);
				const keys = [
					{ frame: 0, value: textWidth },
					{
						frame: durationInSeconds * framesPerSecond,
						value: -textWidth,
					},
				];
				animation.setKeys(keys);

				this.animationGroup.addTargetedAnimation(animation, this.textblock);
				this.animationGroup.start();
				this.animationGroup.loopAnimation = true;
			}
		});
	}
}
