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

export default class GameSelectMenu extends GUI_Seperate implements State {
	mainProgram: Minecraft;
	isActive = false;
	worldEntryComponentList?: Array<WorldEntryComponent>;
	// eslint-disable-next-line @typescript-eslint/ban-types
	registeredKeyStrokes: Array<RegisteredKeyStroke>;
	constructor(constructorObject: { mainProgram: Minecraft }) {
		super(
			constructorObject.mainProgram.engine,
			`gui_${GameSelectMenu.constructor.name}`
		);
		this.mainProgram = constructorObject.mainProgram;
		this.desiredFps = this.mainProgram.settings.videoSettings.menuFPS;
		this.registeredKeyStrokes = new Array();
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
		grid.addRowDefinition(0.8);
		grid.addRowDefinition(0.2);
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
				textContent: "Weltenübersicht",
			},
			height: "100%",
			width: "100%",
		});

		grid.addControl(heading.textWrapper, 0, 0);

		// Create a scroll viewer
		let scrollViewer = new BABYLON_GUI.ScrollViewer();
		scrollViewer.width = 1;
		scrollViewer.height = "95%";
		scrollViewer.verticalBar.width = 1;
		scrollViewer.verticalBar.color = "gray";
		scrollViewer.background = "#3d2d1d";
		scrollViewer.barSize = 20;
		scrollViewer.thickness = 0;
		scrollViewer.left = 0.3;
		scrollViewer.top = 0.3;
		scrollViewer.verticalAlignment = BABYLON_GUI.Control.VERTICAL_ALIGNMENT_TOP;
		grid.addControl(scrollViewer, 1, 0);

		// Create a panel to hold the content
		let panel = new BABYLON_GUI.StackPanel();
		scrollViewer.addControl(panel);
		panel.isVertical = true;
		panel.spacing = 10;

		//Create buttons
		let world_configure_btns = new BABYLON_GUI.Grid();
		grid.addControl(world_configure_btns, 2, 0);

		world_configure_btns.addColumnDefinition(0.5);
		world_configure_btns.addColumnDefinition(0.5);
		world_configure_btns.addRowDefinition(0.5);
		world_configure_btns.addRowDefinition(0.5);

		world_configure_btns.height = "100%";
		world_configure_btns.width = "100%";
		///Play selected world
		let btn_play_selected = new MenuButton({
			clickSound: true,
			height: "95%",
			text: {
				textContent: "Welt starten",
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_play_selected",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			soundContainer: this.mainProgram.soundContainer,
			width: "90%",
			onclick: () => {
				if (!btn_play_selected.btn.isEnabled) return;
				if (
					!this.worldEntryComponentList ||
					!this.worldEntryComponentList.length
				)
					return;
				let selectedWorld = this.worldEntryComponentList.find(
					(current) => current.isSelected
				);

				if (!selectedWorld) return;
				this.loadWorld(selectedWorld.worldEntry);
			},
		});

		btn_play_selected.btn.isEnabled = false;

		world_configure_btns.addControl(btn_play_selected.btn, 0, 0);
		//Edit
		let btn_edit_selected = new MenuButton({
			clickSound: true,
			height: "95%",
			text: {
				textContent: "Welt bearbeiten",
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_edit_selected",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			soundContainer: this.mainProgram.soundContainer,
			width: "90%",
			onclick: () => {
				if (!btn_edit_selected.btn.isEnabled) return;
				if (
					!this.worldEntryComponentList ||
					!this.worldEntryComponentList.length
				)
					return;
				let selectedWorld = this.worldEntryComponentList.find(
					(current) => current.isSelected
				);

				if (!selectedWorld) return;
				throw new NotImplementedError(
					"Editing the world is not implemented yet."
				);
			},
		});
		btn_edit_selected.btn.isEnabled = false;

		world_configure_btns.addControl(btn_edit_selected.btn, 0, 1);
		//Delete
		let btn_delete_selected = new MenuButton({
			clickSound: true,
			height: "95%",
			text: {
				textContent: "Welt löschen",
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_delete_selected",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			soundContainer: this.mainProgram.soundContainer,
			width: "90%",
			onclick: async () => {
				if (!btn_delete_selected.btn.isEnabled) return;
				if (
					!this.worldEntryComponentList ||
					!this.worldEntryComponentList.length
				)
					return;
				let selectedWorld = this.worldEntryComponentList.find(
					(current) => current.isSelected
				);

				if (!selectedWorld) return;
				try {
					await this.mainProgram.worldController.deleteWorldFromList(
						selectedWorld.worldEntry.internalName
					);
					await this.mainProgram.worldController.deleteWorld(
						selectedWorld.worldEntry.internalName
					);
				} catch (error) {
					alert("Deleting the world failed: " + error);
				}

				this.mainProgram.menuStateController.setState(
					this.mainProgram.stateList.states.menus.gameSelectMenu?.overview
				);
			},
		});
		btn_delete_selected.btn.isEnabled = false;

		world_configure_btns.addControl(btn_delete_selected.btn, 1, 0);
		//Create new World
		let btn_create_new = new MenuButton({
			clickSound: true,
			height: "95%",
			text: {
				textContent: "Neue Welt erstellen",
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_create_new",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			soundContainer: this.mainProgram.soundContainer,
			width: "90%",
			onclick: async () => {
				this.mainProgram.menuStateController.setState(
					this.mainProgram.stateList.states.menus.gameSelectMenu.worldCreateMenu
				);
			},
		});
		world_configure_btns.addControl(btn_create_new.btn, 1, 1);

		enum BTN_BACKGROUND_COLOR {
			SELECTED = "lightgray",
			NONE = "transparent",
			HOVERED = "#eeeee4",
		}

		let unselectAll = () => {
			btn_play_selected.btn.isEnabled = false;
			btn_edit_selected.btn.isEnabled = false;
			btn_delete_selected.btn.isEnabled = false;
			//Unselect all other
			if (this.worldEntryComponentList && this.worldEntryComponentList.length) {
				for (const current of this.worldEntryComponentList) {
					current.isSelected = false;
					if (!current.isHovered) {
						current.babylonComponent.background = BTN_BACKGROUND_COLOR.NONE;
					}
				}
			}
		};

		const createWorldSelectOption = async (
			worldEntry: WorldEntry
		): Promise<WorldEntryComponent> => {
			if (!this.guiContainer) {
				throw new Error("The gui container must not be empty");
			}

			let worldGrid = new BABYLON_GUI.Grid("world_select_grid");
			worldGrid.addColumnDefinition(120, true);
			worldGrid.addColumnDefinition(1, false);
			worldGrid.height = "120px";
			worldGrid.background = "";

			let worldEntryComponent = new WorldEntryComponent(
				worldEntry,
				worldGrid,
				false
			);

			let worldImageWrapper = new BABYLON_GUI.Rectangle("world_image");
			worldGrid.addControl(worldImageWrapper, 0, 0);
			worldImageWrapper.width = "100%";
			worldImageWrapper.height = "100%";
			worldImageWrapper.background = "green";

			let worldImage = new BABYLON_GUI.Image(
				"world_image",
				`/media/images/favicon.ico`
			);
			worldImageWrapper.addControl(worldImage);

			let playbutton_off = BABYLON_GUI.Button.CreateImageOnlyButton(
				"playbutton_off",
				(await this.mainProgram.ressourcePackController.getFullPathToFileInFirstFoundRessourcePack(
					"texture/menu/gameSelect/playbutton_off.png"
				)) ?? ""
			);
			playbutton_off.isVisible = false;
			playbutton_off.image!.stretch = BABYLON_GUI.Image.STRETCH_UNIFORM;
			playbutton_off.image!.height = "80%";
			playbutton_off.image!.verticalAlignment =
				BABYLON_GUI.Control.VERTICAL_ALIGNMENT_CENTER;

			let playbutton_on = BABYLON_GUI.Button.CreateImageOnlyButton(
				"playbutton_off",
				(await this.mainProgram.ressourcePackController.getFullPathToFileInFirstFoundRessourcePack(
					"texture/menu/gameSelect/playbutton_on.png"
				)) ?? ""
			);
			playbutton_on.isVisible = false;
			playbutton_on.image!.stretch = BABYLON_GUI.Image.STRETCH_UNIFORM;
			playbutton_on.image!.height = "80%";
			playbutton_on.image!.verticalAlignment =
				BABYLON_GUI.Control.VERTICAL_ALIGNMENT_CENTER;

			worldImageWrapper.addControl(playbutton_off);
			worldImageWrapper.addControl(playbutton_on);

			let descriptionGrid = new BABYLON_GUI.Grid("description_grid");
			worldGrid.addControl(descriptionGrid, 0, 1);
			descriptionGrid.addRowDefinition(30, true); //World name
			descriptionGrid.addRowDefinition(30, true); //Internal name, last save date
			descriptionGrid.addRowDefinition(20, true); //Gamemode, GameVersion

			let worldName = new TextAutoScrollIfOverflow({
				advancedDynamicTexture: this.guiContainer,
				memoryHelperEventlistener: this.memoryHelpers.eventListeners,
				name: "world_name",
				text: { charactersPerSecond: 1, fontSize: "30px", color: "white" },
			});
			worldName.setText(worldEntry.name);

			descriptionGrid.addControl(worldName.textWrapper, 0, 0);

			let internalNameAndLastCreationDate = new TextAutoScrollIfOverflow({
				advancedDynamicTexture: this.guiContainer,
				memoryHelperEventlistener: this.memoryHelpers.eventListeners,
				name: "internalNameAndLastCreationDate",
				text: { charactersPerSecond: 1, fontSize: "20px", color: "gray" },
			});
			internalNameAndLastCreationDate.setText(
				`${worldEntry.internalName} (${
					worldEntry.lastSaveState?.toLocaleDateString() ?? "noch nie"
				})`
			);
			descriptionGrid.addControl(
				internalNameAndLastCreationDate.textWrapper,
				1,
				0
			);

			let gamemodeAndVersion = new TextAutoScrollIfOverflow({
				advancedDynamicTexture: this.guiContainer,
				memoryHelperEventlistener: this.memoryHelpers.eventListeners,
				name: "gamemodeAndVersion",
				text: { charactersPerSecond: 1, fontSize: "20px", color: "gray" },
			});
			gamemodeAndVersion.setText(
				`${convertGamemodeToWord(worldEntry.gameMode)}, Version: ${
					worldEntry.version
				}`
			);
			descriptionGrid.addControl(gamemodeAndVersion.textWrapper, 2, 0);

			worldGrid.onPointerEnterObservable.add((eventData) => {
				worldEntryComponent.isHovered = true;
				playbutton_off.isVisible = true;

				worldEntryComponent.babylonComponent.background =
					BTN_BACKGROUND_COLOR.HOVERED;
			});

			worldGrid.onPointerOutObservable.add((eventData) => {
				worldEntryComponent.isHovered = false;
				playbutton_off.isVisible = false;

				if (!worldEntryComponent.isSelected) {
					worldEntryComponent.babylonComponent.background =
						BTN_BACKGROUND_COLOR.NONE;
				}
			});

			worldGrid.onPointerClickObservable.add((eventData) => {
				if (worldEntryComponent.isSelected) {
					this.loadWorld(worldEntry);
					return;
				}
				unselectAll();
				//Select current
				worldEntryComponent.isSelected = true;
				btn_play_selected.btn.isEnabled = true;
				btn_edit_selected.btn.isEnabled = true;
				btn_delete_selected.btn.isEnabled = true;
				worldEntryComponent.babylonComponent.background =
					BTN_BACKGROUND_COLOR.SELECTED;
			});

			//Listen to the playbutton's click
			playbutton_off.onPointerClickObservable.add((eventData) => {
				this.loadWorld(worldEntry);
			});

			playbutton_off.onPointerDownObservable.add((eventData) => {
				playbutton_on.isVisible = true;
			});

			playbutton_off.onPointerUpObservable.add((eventData) => {
				playbutton_on.isVisible = false;
			});

			return worldEntryComponent;
		};

		let registeredKeyStroke_unselectAll = {
			keystroke: Keystroke.fromMixedContent(EKeyboardCode.Escape),
			callback: () => {
				unselectAll();
			},
		} satisfies RegisteredKeyStroke;
		this.mainProgram.inputController.registerKeyStroke(
			registeredKeyStroke_unselectAll.keystroke,
			registeredKeyStroke_unselectAll.callback
		);
		this.registeredKeyStrokes.push(registeredKeyStroke_unselectAll);

		let allWorlds = await this.mainProgram.worldController.getAllWorlds();

		this.worldEntryComponentList = new Array<WorldEntryComponent>();

		for (const worldEntry of allWorlds) {
			let guiWorldEntryComponent = await createWorldSelectOption(worldEntry);
			this.worldEntryComponentList.push(guiWorldEntryComponent);
			panel.addControl(guiWorldEntryComponent.babylonComponent);
		}

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
					this.mainProgram.stateList.states.menus.main.mainMenu
				);
			},
		});
		//btn_wrapper.addControl(btn_back.btn);
		grid.addControl(btn_back.btn, 3, 0);
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
