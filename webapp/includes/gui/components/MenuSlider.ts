import * as BABYLON_GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import TextThatFitsInOneLineWithAutoResize, {
	TextThatFitsInOneLineWithAutoResizeOptions,
} from "./TextThatFitsInOneLineWithAutoResize";
import { MemoryHelperEventListeners } from "j-memoryhelper-functions";
import SoundInstance from "../../controller/sound-controller/sound/SoundInstance";
import SoundContainer from "../../controller/sound-controller/sound/SoundContainer";
import SoundLibrary from "../../controller/sound-controller/sound/SoundLibrary";

export type MenuSliderLabelDefinitionOptions = {
	gridColumnWidth: {
		value: number;
		isPixel?: boolean;
	};
	textContent?: string;
	width?: string;
	height?: string;
	color?: string;
	fontFamily?: string;
	align?: {
		horizontal?: typeof BABYLON_GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		vertical?: typeof BABYLON_GUI.Control.VERTICAL_ALIGNMENT_CENTER;
	};
};

export type MenuSliderDefinitionOptions = {
	gridColumnWidth: {
		value: number;
		isPixel?: boolean;
	};
	min?: number;
	max?: number;
	value?: number;
	width?: string;
	height?: string;
	color?: string;
	backgroundColor?: string;
	onValueChangedObservable?: (
		eventData: number,
		eventState: BABYLON.EventState
	) => void;
	sound?: {
		soundContainer?: SoundContainer;
		pointerUp?: SoundInstance | boolean;
	};
};

export type MenuSliderLabelValueDefinitionOptions = {
	gridColumnWidth: {
		value: number;
		isPixel?: boolean;
	};
	textContent?: string;
	width?: string;
	height?: string;
	color?: string;
	fontFamily?: string;
	align?: {
		horizontal?: typeof BABYLON_GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		vertical?: typeof BABYLON_GUI.Control.VERTICAL_ALIGNMENT_CENTER;
	};
};

export type MenuSliderWithLabelAndValueDisplayOptions = {
	name: string;
	height?: string;
	width?: string;
	layout: {
		label: MenuSliderLabelDefinitionOptions;
		slider: MenuSliderDefinitionOptions;
		valueDisplay: MenuSliderLabelValueDefinitionOptions;
	};
	guiContainer: BABYLON_GUI.AdvancedDynamicTexture;
	memoryHelperEventlisteners: MemoryHelperEventListeners;
};

export class MenuSliderWithLabelAndValueDisplay {
	slider_grid: BABYLON_GUI.Grid;
	label: TextThatFitsInOneLineWithAutoResize;
	slider: BABYLON_GUI.Slider;
	valueDisplay: TextThatFitsInOneLineWithAutoResize;
	constructor(options: MenuSliderWithLabelAndValueDisplayOptions) {
		//Create Slider Grid
		this.slider_grid = new BABYLON_GUI.Grid(options.name);
		if (options.height) this.slider_grid.height = options.height;
		if (options.width) this.slider_grid.width = options.width;

		//Create Label
		this.label = new TextThatFitsInOneLineWithAutoResize({
			name: "label_slider",
			guiContainer: options.guiContainer,
			memoryHelperEventlistener: options.memoryHelperEventlisteners,
			text: {
				color: options.layout.label.color ?? "white",
				fontFamily: options.layout.label.fontFamily,
				lineBreak: false,
				textContent: options.layout.label.textContent,
			},
			height: options.layout.label.height,
			width: options.layout.label.width,
		});
		if (options.layout.label.align?.horizontal)
			this.label.textblock.horizontalAlignment =
				options.layout.label.align?.horizontal;
		if (options.layout.label.align?.vertical)
			this.label.textblock.verticalAlignment =
				options.layout.label.align?.vertical;

		//Create value display
		this.valueDisplay = new TextThatFitsInOneLineWithAutoResize({
			name: "label_slider_value",
			guiContainer: options.guiContainer,
			memoryHelperEventlistener: options.memoryHelperEventlisteners,
			text: {
				color: options.layout.valueDisplay.color ?? "white",
				fontFamily: options.layout.valueDisplay.fontFamily,
				lineBreak: false,
				textContent: options.layout.valueDisplay.textContent,
			},
			height: options.layout.valueDisplay.height,
			width: options.layout.valueDisplay.width,
		});

		if (options.layout.valueDisplay.align?.horizontal)
			this.valueDisplay.textblock.horizontalAlignment =
				options.layout.valueDisplay.align?.horizontal;
		if (options.layout.valueDisplay.align?.vertical)
			this.valueDisplay.textblock.verticalAlignment =
				options.layout.valueDisplay.align?.vertical;

		//Create Slider
		this.slider = new BABYLON_GUI.Slider();
		if (options.layout.slider.min != undefined)
			this.slider.minimum = options.layout.slider.min;
		if (options.layout.slider.max != undefined)
			this.slider.maximum = options.layout.slider.max;
		if (options.layout.slider.value != undefined)
			this.slider.value = options.layout.slider.value;
		if (options.layout.slider.height != undefined)
			this.slider.height = options.layout.slider.height;
		if (options.layout.slider.width != undefined)
			this.slider.width = options.layout.slider.width;
		if (options.layout.slider.color != undefined)
			this.slider.color = options.layout.slider.color;
		if (options.layout.slider.backgroundColor != undefined)
			this.slider.background = options.layout.slider.backgroundColor;

		//Create columns
		this.slider_grid.addColumnDefinition(
			options.layout.label.gridColumnWidth.value,
			options.layout.label.gridColumnWidth.isPixel
		);
		this.slider_grid.addColumnDefinition(
			options.layout.slider.gridColumnWidth.value,
			options.layout.slider.gridColumnWidth.isPixel
		);
		this.slider_grid.addColumnDefinition(
			options.layout.valueDisplay.gridColumnWidth.value,
			options.layout.valueDisplay.gridColumnWidth.isPixel
		);

		this.slider_grid.addControl(this.label.textWrapper, 0, 0);
		this.slider_grid.addControl(this.slider, 0, 1);
		this.slider_grid.addControl(this.valueDisplay.textWrapper, 0, 2);

		if (options.layout.slider.onValueChangedObservable) {
			this.slider.onValueChangedObservable.add((eventData, eventState) => {
				if (!options.layout.slider.onValueChangedObservable) {
					throw new Error(
						"options.layout.slider.onValueChangedObservable should have a function but has not."
					);
				}
				options.layout.slider.onValueChangedObservable(eventData, eventState);
			});
		}

		if (options.layout.slider.sound !== undefined) {
			if (options.layout.slider.sound.pointerUp) {
				this.slider.onPointerUpObservable.add((eventData) => {
					if (options.layout.slider.sound?.pointerUp instanceof SoundInstance) {
						options.layout.slider.sound.soundContainer?.playSoundBySoundInstance(
							options.layout.slider.sound.pointerUp
						);
					} else if (options.layout.slider.sound?.pointerUp === true) {
						options.layout.slider.sound.soundContainer?.playSoundBySoundInstance(
							SoundLibrary.soundList.ui.slider.slider
						);
					}
				});
			}
		}
	}
}
