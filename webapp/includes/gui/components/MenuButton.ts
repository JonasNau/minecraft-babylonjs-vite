import * as BABYLON_GUI from "@babylonjs/gui";
import { MemoryHelperEventListeners } from "j-memoryhelper-functions";
import SoundLibrary from "../../controller/sound-controller/sound/SoundLibrary";
import SoundInstance from "../../controller/sound-controller/sound/SoundInstance";
import SoundContainer from "../../controller/sound-controller/sound/SoundContainer";
import GlobalOptions from "../../settings/GlobalOptions";
import TextThatFitsInOneLineWithAutoResize from "./TextThatFitsInOneLineWithAutoResize";

export type MenuButtonOptions = {
	name: string;
	width?: string;
	height?: string | number;
	heightInPixels?: number;
	text: {
		color?: string;
		textContent: string;
		autoScaleTextInOneLine:
			| false
			| {
					widthInPercent: number;
					heightInPercent: number;
			  };
		lineBreak: boolean | BABYLON_GUI.TextWrapping;
		fontFamily?: string;
		fontSize?: number;
	};
	clickSound: boolean | SoundInstance;
	memoryHelperEventlistener?: MemoryHelperEventListeners;
	guiContainer?: BABYLON_GUI.AdvancedDynamicTexture;
	onclick?: (eventData?: BABYLON_GUI.Vector2WithInfo) => void;
	soundContainer?: SoundContainer;
	background?: string;
	backgroundHover?: string;
};

export default class MenuButton {
	btn: BABYLON_GUI.Button;
	btn_textblockWrapper: BABYLON_GUI.Rectangle;
	btn_textblock: BABYLON_GUI.TextBlock;
	textThatFitsInOneLineWithAutoResizeInstance?: TextThatFitsInOneLineWithAutoResize;

	constructor(options: MenuButtonOptions) {
		//Singleplayer Button
		this.btn = new BABYLON_GUI.Button(options.name);
		this.btn.width = options.width ?? "100%";

		if (options.text.autoScaleTextInOneLine) {
			//Automatically fit text in one line
			if (!options.memoryHelperEventlistener || !options.guiContainer) {
				throw new Error("There is some parameter missing.");
			}

			let textContainer = new TextThatFitsInOneLineWithAutoResize({
				guiContainer: options.guiContainer,
				memoryHelperEventlistener: options.memoryHelperEventlistener,
				name: `txt_${options.name}`,
				text: {
					textContent: options.text.textContent,
					lineBreak: options.text.lineBreak,
					fontFamily: options.text.fontFamily,
				},
				width: `${options.text.autoScaleTextInOneLine.widthInPercent}%`,
				height: `${options.text.autoScaleTextInOneLine.heightInPercent}%`,
			});
			this.textThatFitsInOneLineWithAutoResizeInstance = textContainer;
			this.btn_textblockWrapper = textContainer.textWrapper;
			this.btn_textblock = textContainer.textblock;
		} else {
			this.btn_textblock = new BABYLON_GUI.TextBlock(`txt_${options.name}`);
			this.btn_textblock.text = options.text.textContent;

			if (options.text.fontSize !== undefined)
				this.btn_textblock.fontSize = options.text.fontSize;
			if (options.text.lineBreak !== undefined)
				this.btn_textblock.textWrapping = options.text.lineBreak;

			this.btn_textblockWrapper = new BABYLON_GUI.Rectangle(
				`wrapper_txt_${options.name}`
			);
			this.btn_textblockWrapper.thickness = 0;
			this.btn_textblockWrapper.width = "100%";
			this.btn_textblockWrapper.height = "100%";
		}
		this.btn_textblockWrapper.addControl(this.btn_textblock);
		this.btn.addControl(this.btn_textblockWrapper);
		//Standard Styles
		this.btn_textblock.fontFamily =
			options.text.fontFamily ?? GlobalOptions.options.standardFont;

		this.btn_textblock.color = options.text.color ?? "white";
		this.btn.background =
			GlobalOptions.options.appearance.menuButton.backgroundColor;
		this.btn.disabledColor =
			GlobalOptions.options.appearance.menuButton.backgroundDisabledColor;
		if (options.heightInPixels) {
			this.btn.heightInPixels = options.heightInPixels;
		} else if (options.height) {
			this.btn.height = options.height;
		} else {
			this.btn.heightInPixels =
				GlobalOptions.options.appearance.menuButton.standardHeight;
		}

		this.btn.thickness = 3;
		this.btn.color = "black";

		if (options.clickSound !== false) {
			if (options.soundContainer === undefined) {
				throw new Error(
					"To play the sound the button needs the soundContainer: SoundContainer in its options"
				);
				return;
			}
			this.btn.onPointerClickObservable.add((eventData) => {
				if (options.clickSound === true) {
					if (options.soundContainer === undefined) {
						throw new Error(
							"To play the sound the button needs the soundContainer: SoundContainer in its options"
						);
						return;
					}
					options.soundContainer.playSoundBySoundInstance(
						SoundLibrary.soundList.ui.click_sounds.click_button
					);
				} else if (options.clickSound instanceof SoundInstance) {
					if (options.soundContainer === undefined) {
						throw new Error(
							"To play the sound the button needs the soundContainer: SoundContainer in its options"
						);
						return;
					}
					options.soundContainer.playSoundBySoundInstance(options.clickSound);
				}
				//Call the callback
				if (options.onclick) options.onclick(eventData);
			});
		}

		//Hover effects
		// Set up the pointer enter event handler
		this.btn.onPointerEnterObservable.add(() => {
			this.btn.background = options.backgroundHover ?? "lightblue"; // change the background color when the button is hovered over
		});

		// Set up the pointer exit event handler
		this.btn.onPointerOutObservable.add(() => {
			this.btn.background = options.background ?? "#a5a5a5"; // change the background color back when the pointer leaves the button
		});
	}

	setText(text: string) {
		if (this.textThatFitsInOneLineWithAutoResizeInstance) {
			this.textThatFitsInOneLineWithAutoResizeInstance.setText(text);
		} else {
			this.btn_textblock.text = text;
		}
	}
}
