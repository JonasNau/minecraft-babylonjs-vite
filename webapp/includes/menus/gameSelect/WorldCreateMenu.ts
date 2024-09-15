import * as BABYLON from "@babylonjs/core";
import * as BABYLON_GUI from "@babylonjs/gui";

import GUI_Seperate from "../../gui/GUI_Seperate";
import State from "../../state-controller/State";
import { Minecraft } from "../../Minecraft";
import TextThatFitsInOneLineWithAutoResize from "../../gui/components/TextThatFitsInOneLineWithAutoResize";
import { MenuSliderWithLabelAndValueDisplay } from "../../gui/components/MenuSlider";
import MenuButton from "../../gui/components/MenuButton";
import TextAutoScrollIfOverflow from "../../gui/components/TextAutoscrollIfOverflow";
import { ECallbacksMusicPlayer } from "../../controller/sound-controller/music/MusicPlayer";
import Keyboard_Keybinding from "../../settings/Keyboard_Keybinding";
import Mouse_Keybinding from "../../settings/Mouse_Keybinding";
import KeyStrokePart_Keyboard from "../../input-control/keystroke/KeyStrokePart_Keyboard";
import KeyStrokePart_Mouse from "../../input-control/keystroke/KeyStrokePart_Mouse";
import { EMouseKeys } from "../../input-control/mouse/EMouseKeys";
import GlobalOptions from "../../settings/GlobalOptions";
import KeyBindingSetter from "../../gui/components/settings/keyBindings/KeyBindingSetter";
import { GAMEMODE, convertGamemodeToWord } from "../../GAMEMODE";
import GlobalVariables from "../../GlobalVariables";
import { WorldEntry } from "../../controller/WorldContoller";
import { getPathToAssetsFolder } from "../../helperFunctions/asset-functions";
import WorldEntryComponent from "./WorldEntryComponent";
import NotImplementedError from "../../errors/NotImplementedError";
import Keystroke from "../../input-control/keystroke/KeyStroke";
import { EKeyboardCode } from "../../input-control/keyboard/EKeyboardCode";
import { RegisteredKeyStroke } from "../../input-control/keystroke/RegisteredKeyStroke";
import {
	getNextEntryOfArrayCycleThrough,
	moveElementInArrayOneIndex,
	removeFromArray,
} from "j-object-functions";

export enum WorldType {
	FLAT,
}

export type GameCreateOptions = {
	gamemode: GAMEMODE;
	worldName: string;
	worldType: WorldType;
};

export default class WorldCreateMenu extends GUI_Seperate implements State {
	mainProgram: Minecraft;
	isActive = false;
	worldEntryComponentList?: Array<WorldEntryComponent>;
	// eslint-disable-next-line @typescript-eslint/ban-types
	registeredKeyStrokes: Array<RegisteredKeyStroke>;

	gameCreateOptions?: GameCreateOptions;

	errorMessages: string[];

	constructor(constructorObject: { mainProgram: Minecraft }) {
		super(
			constructorObject.mainProgram.engine,
			`gui_${WorldCreateMenu.constructor.name}`
		);
		this.mainProgram = constructorObject.mainProgram;
		this.desiredFps = this.mainProgram.settings.videoSettings.menuFPS;
		this.registeredKeyStrokes = new Array();
		this.errorMessages = new Array<string>();
	}

	async loadComponents() {
		if (!this.guiContainer) throw new Error("No guiContainerDefined");
		this.clearScene();
		if (!this.scene) {
			throw new Error(
				"Couldn't load components because the scene is not loaded"
			);
		}
		this.scene.clearColor = BABYLON.Color4.FromHexString("#6F4E37");

		this.gameCreateOptions = {
			gamemode: GAMEMODE.CREATIVE,
			worldName:
				await this.mainProgram.worldController.getFreeInternalWorldName(),
			worldType: WorldType.FLAT,
		};

		//Create Outer Container
		const container = new BABYLON_GUI.Rectangle();
		container.thickness = 0;
		container.width = "100%";
		container.height = "100%";
		this.guiContainer.addControl(container);

		let grid = new BABYLON_GUI.Grid("container_grid");
		grid.addRowDefinition(100, true);
		grid.addRowDefinition(0.2);
		grid.addRowDefinition(0.2);
		grid.addRowDefinition(65, true);
		grid.addRowDefinition(65, true);
		grid.addRowDefinition(65, true);
		grid.width = "100%";
		grid.paddingLeftInPixels = 20;
		grid.paddingRightInPixels = 20;
		container.addControl(grid);

		//Top
		let heading = new TextThatFitsInOneLineWithAutoResize({
			name: "heading",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			text: {
				color: "black",
				lineBreak: false,
				textContent: "Welt erstellen",
			},
			height: "100%",
			width: "100%",
		});

		grid.addControl(heading.textWrapper, 0, 0);

		let btn_create_new = new MenuButton({
			clickSound: true,
			height: "95%",
			text: {
				textContent: "Welt erstellen",
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_create_new",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			soundContainer: this.mainProgram.soundContainer,
			width: "50%",
			onclick: async () => {
				//validate
				if (!this.gameCreateOptions) {
					alert(
						"Ein Fehler ist aufgetreten. Versuche es später erneut oder starte das Spiel neu."
					);
					throw new Error("The gameCreateOptions are not defined");
				}
				//Check availability of world
				let worldName = txtInput.text.trim();
				let isAvailable = !(await this.mainProgram.worldController.worldExists(
					worldName
				));

				if (!isAvailable) {
					return;
				}

				this.mainProgram.createWorld(this.gameCreateOptions);
			},
		});
		grid.addControl(btn_create_new.btn, 4, 0);

		//World name
		let worldNameWrapper = new BABYLON_GUI.Grid("world_name_grid");
		worldNameWrapper.width = "40%";
		grid.addControl(worldNameWrapper, 1, 0);
		worldNameWrapper.addColumnDefinition(1);
		worldNameWrapper.addRowDefinition(20, true);
		worldNameWrapper.addRowDefinition(40, true);
		worldNameWrapper.addRowDefinition(40, true);

		let errorMsg = new BABYLON_GUI.TextBlock();
		errorMsg.fontSize = "20px";
		errorMsg.color = "red";
		errorMsg.isVisible = false;
		worldNameWrapper.addControl(errorMsg, 2, 0);
		errorMsg.text = "Eine Welt mit diesem Namen existiert bereits.";

		///heading
		let worldName_description = new BABYLON_GUI.TextBlock(
			"worldName_description",
			"Name der Welt:"
		);
		worldName_description.color = "white";
		worldName_description.fontSize = "20px";
		worldName_description.resizeToFit = true;
		worldName_description.horizontalAlignment =
			BABYLON_GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		worldNameWrapper.addControl(worldName_description, 0, 0);

		///input
		let txtInput = new BABYLON_GUI.InputText();
		txtInput.thickness = 2;
		txtInput.color = "white";
		txtInput.height = "40px";
		txtInput.width = "100.0%";
		txtInput.fontSize = 30;
		txtInput.text = this.gameCreateOptions.worldName;
		txtInput.horizontalAlignment =
			BABYLON_GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		worldNameWrapper.addControl(txtInput, 1, 0);

		txtInput.onTextChangedObservable.add(async () => {
			if (!this.gameCreateOptions) return;
			//Check availability of world
			let worldName = txtInput.text.trim();
			let isAvailable = !(await this.mainProgram.worldController.worldExists(
				worldName
			));
			//set valid or invalid
			if (!isAvailable) {
				errorMsg.isVisible = true;
				txtInput.color = "red";
			} else {
				errorMsg.isVisible = false;
				txtInput.color = "green";
			}

			this.gameCreateOptions.worldName = worldName;
		});

		let btn_gamemode = new MenuButton({
			clickSound: true,
			height: "60px",
			text: {
				textContent: convertGamemodeToWord(this.gameCreateOptions.gamemode),
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_gamemode",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			soundContainer: this.mainProgram.soundContainer,
			width: "50%",
			onclick: async () => {
				if (!this.gameCreateOptions) return;
				let gamemodes = [
					GAMEMODE.CREATIVE,
					GAMEMODE.SURVIVAL,
					GAMEMODE.SEPECTATOR,
				];
				let next = getNextEntryOfArrayCycleThrough<GAMEMODE>(
					gamemodes,
					this.gameCreateOptions.gamemode
				);
				this.gameCreateOptions.gamemode = next;
				btn_gamemode.setText(
					convertGamemodeToWord(this.gameCreateOptions.gamemode)
				);
			},
		});
		grid.addControl(btn_gamemode.btn, 2, 0);

		let btn_further_settings = new MenuButton({
			clickSound: true,
			height: "95%",
			text: {
				textContent: "Weitere Einstellungen",
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_further_settings",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			soundContainer: this.mainProgram.soundContainer,
			width: "50%",
			onclick: async () => {},
		});
		btn_further_settings.btn.isEnabled = false;
		grid.addControl(btn_further_settings.btn, 3, 0);

		let btn_back = new MenuButton({
			clickSound: true,
			height: "100%",
			text: {
				textContent: "Abbrechen",
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_back",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			soundContainer: this.mainProgram.soundContainer,
			width: "50%",
			onclick: () => {
				this.mainProgram.menuStateController.setState(
					this.mainProgram.stateList.states.menus.gameSelectMenu.overview
				);
			},
		});
		//btn_wrapper.addControl(btn_back.btn);
		grid.addControl(btn_back.btn, 5, 0);
		grid.paddingBottomInPixels = 50;
	}

	async enter() {
		this.desiredFps = this.mainProgram.settings.videoSettings.menuFPS;
		this.startGUI();
		await this.loadComponents();
	}

	async loadWorld(worldEntry: WorldEntry) {
		this.mainProgram.loadWorld(worldEntry);
	}

	exit() {
		//Unregister all keystrokes
		for (const keystroke of this.registeredKeyStrokes) {
			this.mainProgram.inputController.unregisterKeyStroke(keystroke.keystroke);
		}
		this.exitGUI();
	}
}
