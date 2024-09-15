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

export default class ControlsMenu extends GUI_Seperate implements State {
	mainProgram: Minecraft;
	isActive = false;
	constructor(constructorObject: { mainProgram: Minecraft }) {
		super(
			constructorObject.mainProgram.engine,
			`gui_${ControlsMenu.constructor.name}`
		);
		this.mainProgram = constructorObject.mainProgram;
		this.desiredFps = this.mainProgram.settings.videoSettings.menuFPS;
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

		//Create Outer Container
		const container = new BABYLON_GUI.Rectangle();
		container.thickness = 0;
		container.width = "100%";
		container.height = "100%";
		this.guiContainer.addControl(container);

		let grid = new BABYLON_GUI.Grid("container_grid");
		grid.addRowDefinition(100, true);
		grid.addRowDefinition(1);
		grid.addRowDefinition(65, true);
		grid.width = "100%";
		container.addControl(grid);

		//Top
		let heading = new TextThatFitsInOneLineWithAutoResize({
			name: "heading",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			text: {
				color: "black",
				lineBreak: false,
				textContent: "Steuerung",
			},
			height: "100%",
			width: "100%",
		});

		grid.addControl(heading.textWrapper, 0, 0);

		// Create a scroll viewer
		let scrollViewer = new BABYLON_GUI.ScrollViewer();
		scrollViewer.width = 1;
		scrollViewer.height = 1;
		scrollViewer.verticalBar.width = 1;
		scrollViewer.verticalBar.color = "gray";
		scrollViewer.background = "#3d2d1d";
		scrollViewer.barSize = 20;
		scrollViewer.thickness = 0;
		scrollViewer.left = 0.3;
		scrollViewer.top = 0.3;
		grid.addControl(scrollViewer, 1, 0);

		// Create a panel to hold the content
		let panel = new BABYLON_GUI.StackPanel();
		scrollViewer.addControl(panel);
		panel.isVertical = true;
		panel.spacing = 10;

		const createHeading = (text: string) => {
			let textBlock = new BABYLON_GUI.TextBlock();
			textBlock.text = text;
			textBlock.resizeToFit = true;
			textBlock.color = "white";
			textBlock.fontSize = 30;
			return textBlock;
		};

		panel.addControl(createHeading("Bewegung"));

		let keyBindingSetter_JUMP = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Springen",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.JUMP,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.JUMP,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.JUMP =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_JUMP.keyBindingGrid);

		let keyBindingSetter_FORWARD = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Vorwärts",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.FORWARD,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.FORWARD,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.FORWARD =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_FORWARD.keyBindingGrid);

		let keyBindingSetter_LEFT = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Links",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.LEFT,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.LEFT,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.LEFT =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_LEFT.keyBindingGrid);

		let keyBindingSetter_BACKWARDS = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Rückwärts",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.BACKWARDS,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.BACKWARDS,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.BACKWARDS =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_BACKWARDS.keyBindingGrid);

		let keyBindingSetter_RIGHT = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Rechts",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.RIGHT,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.RIGHT,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.RIGHT =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_RIGHT.keyBindingGrid);

		let keyBindingSetter_SNEAK = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Schleichen",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.SNEAK,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.SNEAK,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.SNEAK =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_SNEAK.keyBindingGrid);

		let keyBindingSetter_SPRINT = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Sprinten",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.SPRINT,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.SPRINT,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.SPRINT =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_SPRINT.keyBindingGrid);

		panel.addControl(createHeading("Im Spiel"));

		let keyBindingSetter_ATTACK_DESTROY = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Angreifen / Zerstören",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.ATTACK_DESTROY,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.ATTACK_DESTROY,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.ATTACK_DESTROY =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_ATTACK_DESTROY.keyBindingGrid);

		let keyBindingSetter_PICK_BLOCK = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Block / Item auswählen",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.PICK_BLOCK,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.PICK_BLOCK,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.PICK_BLOCK =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_PICK_BLOCK.keyBindingGrid);

		let keyBindingSetter_USE_ITEM = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Item verwenden / Block platzieren",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.USE_ITEM_PLACE_BLOCK,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings
					.USE_ITEM_PLACE_BLOCK,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.USE_ITEM_PLACE_BLOCK =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_USE_ITEM.keyBindingGrid);

		panel.addControl(createHeading("Inventar"));
		let keyBindingSetter_TOGGLE_INVENTORY = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Inventar öffnen / schließen",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.TOGGLE_INVENTORY,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.TOGGLE_INVENTORY,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.TOGGLE_INVENTORY =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_TOGGLE_INVENTORY.keyBindingGrid);
		let keyBindingSetter_DROP_ITEM = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Item fallen lassen",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.DROP_ITEM,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.DROP_ITEM,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.DROP_ITEM =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_DROP_ITEM.keyBindingGrid);

		let keyBindingSetter_HOTBAR_SLOT_0 = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Steckplatz 1",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.HOTBAR_SLOT_0,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.HOTBAR_SLOT_0,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.HOTBAR_SLOT_0 =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_HOTBAR_SLOT_0.keyBindingGrid);

		let keyBindingSetter_HOTBAR_SLOT_1 = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Steckplatz 2",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.HOTBAR_SLOT_1,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.HOTBAR_SLOT_1,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.HOTBAR_SLOT_1 =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_HOTBAR_SLOT_1.keyBindingGrid);

		let keyBindingSetter_HOTBAR_SLOT_2 = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Steckplatz 3",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.HOTBAR_SLOT_2,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.HOTBAR_SLOT_2,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.HOTBAR_SLOT_2 =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_HOTBAR_SLOT_2.keyBindingGrid);

		let keyBindingSetter_HOTBAR_SLOT_3 = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Steckplatz 4",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.HOTBAR_SLOT_3,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.HOTBAR_SLOT_3,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.HOTBAR_SLOT_3 =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_HOTBAR_SLOT_3.keyBindingGrid);

		let keyBindingSetter_HOTBAR_SLOT_4 = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Steckplatz 5",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.HOTBAR_SLOT_4,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.HOTBAR_SLOT_4,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.HOTBAR_SLOT_4 =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_HOTBAR_SLOT_4.keyBindingGrid);

		let keyBindingSetter_HOTBAR_SLOT_5 = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Steckplatz 6",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.HOTBAR_SLOT_5,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.HOTBAR_SLOT_5,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.HOTBAR_SLOT_5 =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_HOTBAR_SLOT_5.keyBindingGrid);

		let keyBindingSetter_HOTBAR_SLOT_6 = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Steckplatz 7",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.HOTBAR_SLOT_6,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.HOTBAR_SLOT_6,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.HOTBAR_SLOT_6 =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_HOTBAR_SLOT_6.keyBindingGrid);

		let keyBindingSetter_HOTBAR_SLOT_7 = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Steckplatz 8",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.HOTBAR_SLOT_7,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.HOTBAR_SLOT_7,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.HOTBAR_SLOT_7 =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_HOTBAR_SLOT_7.keyBindingGrid);

		let keyBindingSetter_HOTBAR_SLOT_8 = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Steckplatz 9",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.HOTBAR_SLOT_8,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.HOTBAR_SLOT_8,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.HOTBAR_SLOT_8 =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_HOTBAR_SLOT_8.keyBindingGrid);

		panel.addControl(createHeading("Mehrspieler"));
		let keyBindingSetter_OPEN_CHAT = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Chat öffnen",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.OPEN_CHAT,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings.OPEN_CHAT,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.OPEN_CHAT =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_OPEN_CHAT.keyBindingGrid);

		panel.addControl(createHeading("Weitere"));
		let keyBindingSetter_TOGGLE_PERSPECTIVE = new KeyBindingSetter({
			guiContainer: this.guiContainer,
			inputController: this.mainProgram.inputController,
			keyBindingName: {
				text: "Perspektive wechseln",
				color: "white",
				fontSize: "30px",
			},
			soundContainer: this.mainProgram.soundContainer,
			memoryHelpersEventliseners: this.memoryHelpers.eventListeners,
			standardOption:
				GlobalOptions.options.settings.standardSettings.controls
					.keybindingSettings.TOGGLE_PERSPECTIVE,
			keyBindingGetter: () =>
				this.mainProgram.settings.controlsSettings.keyBindings
					.TOGGLE_PERSPECTIVE,
			keyBindingSetter: (keyBinding) =>
				(this.mainProgram.settings.controlsSettings.keyBindings.TOGGLE_PERSPECTIVE =
					keyBinding),
		});
		panel.addControl(keyBindingSetter_TOGGLE_PERSPECTIVE.keyBindingGrid);

		let btn_back = new MenuButton({
			clickSound: true,
			height: "100%",
			text: {
				textContent: "Zurück",
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
					this.mainProgram.stateList.states.menus.settings.settingsMenu
				);
			},
		});
		//btn_wrapper.addControl(btn_back.btn);
		grid.addControl(btn_back.btn, 2, 0);
		grid.paddingBottomInPixels = 50;
	}

	async enter() {
		this.desiredFps = this.mainProgram.settings.videoSettings.menuFPS;
		this.startGUI();
		await this.loadComponents();
	}

	exit() {
		this.exitGUI();
	}
}
