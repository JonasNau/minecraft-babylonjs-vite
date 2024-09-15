import * as BABYLON_GUI from "@babylonjs/gui";
import { MemoryHelperEventListeners } from "j-memoryhelper-functions";
import AutomaticallyFitGUITextBlockToWidth from "../AutomaticallyFitGUITextBlockToWidth";
import GlobalOptions from "../../settings/GlobalOptions";

export type TextThatFitsInOneLineWithAutoResizeOptions = {
	name: string;
	width?: string;
	height?: string;
	text: {
		color?: string;
		textContent?: string;
		lineBreak: boolean | BABYLON_GUI.TextWrapping;
		fontFamily?: string;
	};
	memoryHelperEventlistener: MemoryHelperEventListeners;
	guiContainer: BABYLON_GUI.AdvancedDynamicTexture;
};

export default class TextThatFitsInOneLineWithAutoResize {
	textWrapper: BABYLON_GUI.Rectangle;
	textblock: BABYLON_GUI.TextBlock;
	autoFitTextInstance: AutomaticallyFitGUITextBlockToWidth;

	constructor(options: TextThatFitsInOneLineWithAutoResizeOptions) {
		//Singleplayer Button
		this.textWrapper = new BABYLON_GUI.Rectangle(`wrapper_${options.name}`);
		this.textWrapper.thickness = 0; //Remove border
		if (options.width) this.textWrapper.width = options.width;
		if (options.height) this.textWrapper.height = options.height;

		this.textblock = new BABYLON_GUI.TextBlock(`${options.name}`);
		if (options.text.textContent)
			this.textblock.text = options.text.textContent;

		this.textblock.fontFamily =
			options.text.fontFamily ?? GlobalOptions.options.standardFont;
		this.textblock.color = options.text.color ?? "black";

		if (options.text.lineBreak !== undefined)
			this.textblock.textWrapping = options.text.lineBreak;

		// this.textblock.width = "100%";
		// this.textblock.height = "100%";
		this.textblock.resizeToFit = true;

		this.textWrapper.addControl(this.textblock);

		this.autoFitTextInstance = new AutomaticallyFitGUITextBlockToWidth(
			options.guiContainer,
			this.textWrapper,
			this.textblock,
			options.memoryHelperEventlistener
		);
		this.autoFitTextInstance.automaticallyFitTextToContainer();

		//Standard Styles
		this.textblock.color = options.text.color ?? `black`;
	}

	setText(text: string) {
		this.autoFitTextInstance.setText(text);
	}
}
