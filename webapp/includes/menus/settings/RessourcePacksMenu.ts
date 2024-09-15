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
import SoundLibrary from "../../controller/sound-controller/sound/SoundLibrary";
import Checkbox2DUIComponent from "../../gui/components/Checkbox";
import RessourcePackEntry from "../../gui/components/ui/ressourcePackSettings/RessourcePackEntry";
import GlobalOptions from "../../settings/GlobalOptions";
import { EArrayRearangeDirection } from "j-object-functions";

export default class RessourcePacksMenu extends GUI_Seperate implements State {
	mainProgram: Minecraft;
	ressourcePackList?: BABYLON_GUI.StackPanel;
	isActive = false;
	constructor(constructorObject: { mainProgram: Minecraft }) {
		super(
			constructorObject.mainProgram.engine,
			`gui_${RessourcePacksMenu.constructor.name}`
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
				textContent: "Ressourcenpakete",
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
		this.ressourcePackList = new BABYLON_GUI.StackPanel();
		scrollViewer.addControl(this.ressourcePackList);
		this.ressourcePackList.isVertical = true;
		this.ressourcePackList.spacing = 10;

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
				//Unload all Ressource
				this.mainProgram.soundContainer.unloadAll();

				this.mainProgram.menuStateController.setState(
					this.mainProgram.stateList.states.menus.settings.settingsMenu
				);
			},
		});
		//btn_wrapper.addControl(btn_back.btn);
		grid.addControl(btn_back.btn, 2, 0);
		grid.paddingBottomInPixels = 50;

		this.updateRessourcePackList();
	}

	updateRessourcePackList() {
		if (!this.guiContainer) return;
		if (!this.ressourcePackList) {
			throw new Error("No ressource pack list found");
		}

		const createHeading = (text: string) => {
			let textBlock = new BABYLON_GUI.TextBlock();
			textBlock.text = text;
			textBlock.resizeToFit = true;
			textBlock.color = "white";
			textBlock.fontSize = 30;
			return textBlock;
		};

		this.ressourcePackList.clearControls();

		let allRessourcePacksAvailable = structuredClone(
			this.mainProgram.settings.ressourcePackSettings.available
		);
		let allAvailableRessourcePacksToHide = structuredClone(
			allRessourcePacksAvailable
		);
		allAvailableRessourcePacksToHide = allAvailableRessourcePacksToHide.filter(
			(predicate) => {
				return !this.mainProgram.settings.ressourcePackSettings.active.includes(
					predicate
				);
			}
		);
		this.ressourcePackList.addControl(createHeading("Aktiv"));

		for (const currentActiveRessourcePack of this.mainProgram.settings
			.ressourcePackSettings.active) {
			let ressourcePackEntry = new RessourcePackEntry({
				guiContainer: this.guiContainer,
				memoryHelperEventListeners: this.memoryHelpers.eventListeners,
				ressourcePackName: currentActiveRessourcePack,
				soundContainer: this.mainProgram.soundContainer,
			});
			ressourcePackEntry.checkbox.checkbox.isChecked = true;
			ressourcePackEntry.checkbox.checkbox.onIsCheckedChangedObservable.add(
				(isChecked) => {
					if (isChecked === false) {
						this.mainProgram.settings.ressourcePackSettings.removeRessourcePackFromActive(
							currentActiveRessourcePack
						);
					}
					this.updateRessourcePackList();
				}
			);
			ressourcePackEntry.up.btn.onPointerClickObservable.add(() => {
				this.mainProgram.settings.ressourcePackSettings.rearangeRessourcePack(
					currentActiveRessourcePack,
					EArrayRearangeDirection.BACKWARDS
				);
				this.updateRessourcePackList();
			});
			ressourcePackEntry.down.btn.onPointerClickObservable.add(() => {
				this.mainProgram.settings.ressourcePackSettings.rearangeRessourcePack(
					currentActiveRessourcePack,
					EArrayRearangeDirection.FORWARD
				);
				this.updateRessourcePackList();
			});
			this.ressourcePackList.addControl(ressourcePackEntry.ressourcePackEntry);
		}

		this.ressourcePackList.addControl(createHeading("Inaktiv"));

		for (const currentInactiveRessourcePack of allAvailableRessourcePacksToHide) {
			let ressourcePackEntry = new RessourcePackEntry({
				guiContainer: this.guiContainer,
				memoryHelperEventListeners: this.memoryHelpers.eventListeners,
				ressourcePackName: currentInactiveRessourcePack,
				soundContainer: this.mainProgram.soundContainer,
			});
			ressourcePackEntry.checkbox.checkbox.isChecked = false;
			ressourcePackEntry.checkbox.checkbox.onIsCheckedChangedObservable.add(
				(isChecked) => {
					if (isChecked === true) {
						this.mainProgram.settings.ressourcePackSettings.addRessourcePackToActive(
							currentInactiveRessourcePack,
							0
						);
					}
					this.updateRessourcePackList();
				}
			);
			ressourcePackEntry.up.btn.onPointerClickObservable.add(() => {
				this.mainProgram.settings.ressourcePackSettings.rearangeRessourcePack(
					currentInactiveRessourcePack,
					EArrayRearangeDirection.BACKWARDS
				);
				this.updateRessourcePackList();
			});
			ressourcePackEntry.down.btn.onPointerClickObservable.add(() => {
				this.mainProgram.settings.ressourcePackSettings.rearangeRessourcePack(
					currentInactiveRessourcePack,
					EArrayRearangeDirection.FORWARD
				);
				this.updateRessourcePackList();
			});
			this.ressourcePackList.addControl(ressourcePackEntry.ressourcePackEntry);
		}
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
