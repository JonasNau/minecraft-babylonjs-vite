import * as BABYLON_GUI from "@babylonjs/gui";
import Checkbox2DUIComponent from "../../Checkbox";
import MenuButton from "../../MenuButton";
import SoundContainer from "../../../../controller/sound-controller/sound/SoundContainer";
import { MemoryHelperEventListeners } from "j-memoryhelper-functions";

export type RessourcePackEntryOptions = {
	guiContainer: BABYLON_GUI.AdvancedDynamicTexture;
	ressourcePackName: string;
	soundContainer: SoundContainer;
	memoryHelperEventListeners: MemoryHelperEventListeners;
};

export default class RessourcePackEntry {
	ressourcePackEntry: BABYLON_GUI.Grid;
	txt_ressourcePackName: BABYLON_GUI.TextBlock;
	grid_move: BABYLON_GUI.Grid;
	up: MenuButton;
	down: MenuButton;
	checkbox: Checkbox2DUIComponent;
	constructor(options: RessourcePackEntryOptions) {
		options;

		this.ressourcePackEntry = new BABYLON_GUI.Grid("grid_ressource_pack_entry");
		this.ressourcePackEntry.addColumnDefinition(0.8);
		this.ressourcePackEntry.addColumnDefinition(50, true);
		this.ressourcePackEntry.addColumnDefinition(0.1);
		this.ressourcePackEntry.addRowDefinition(60, true);
		this.ressourcePackEntry.adaptHeightToChildren = true;
		this.ressourcePackEntry.background = "gray";

		//Name
		this.txt_ressourcePackName = new BABYLON_GUI.TextBlock("ressourcePackName");
		this.ressourcePackEntry.addControl(this.txt_ressourcePackName, 0, 0);
		this.txt_ressourcePackName.resizeToFit = true;
		this.txt_ressourcePackName.fontSize = "30px";
		this.txt_ressourcePackName.textWrapping = BABYLON_GUI.TextWrapping.Ellipsis;
		if (options.ressourcePackName)
			this.txt_ressourcePackName.text = options.ressourcePackName;
		//Active

		this.checkbox = new Checkbox2DUIComponent({
			name: "checkbox_ressourcepack_active",
			soundContainer: options.soundContainer,
			sounds: { on: true, off: true },
		});
		this.checkbox.checkbox.height = "50px";
		this.checkbox.checkbox.width = "50px";
		this.checkbox.checkbox.color = "white";
		this.ressourcePackEntry.addControl(this.checkbox.checkbox, 0, 1);

		//Move
		this.grid_move = new BABYLON_GUI.Grid();
		this.ressourcePackEntry.addControl(this.grid_move, 0, 2);
		this.grid_move.addRowDefinition(50, true);
		this.grid_move.addColumnDefinition(0.5);
		this.grid_move.addColumnDefinition(0.5);
		this.grid_move.adaptHeightToChildren = true;

		this.up = new MenuButton({
			clickSound: true,
			height: "50px",
			text: {
				textContent: "↑",
				autoScaleTextInOneLine: { heightInPercent: 90, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_up",
			guiContainer: options.guiContainer,
			memoryHelperEventlistener: options.memoryHelperEventListeners,
			soundContainer: options.soundContainer,
			width: "100%",
		});

		this.grid_move.addControl(this.up.btn, 0, 0);
		this.down = new MenuButton({
			clickSound: true,
			height: "50px",
			text: {
				textContent: "↓",
				autoScaleTextInOneLine: { heightInPercent: 90, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_down",
			guiContainer: options.guiContainer,
			memoryHelperEventlistener: options.memoryHelperEventListeners,
			soundContainer: options.soundContainer,
			width: "100%",
		});
		this.grid_move.addControl(this.down.btn, 0, 1);
	}
}
