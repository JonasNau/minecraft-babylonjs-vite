import * as BABYLON from "@babylonjs/core";
import * as BABYLON_GUI from "@babylonjs/gui";

import GUI_Seperate from "../../gui/GUI_Seperate";
import State from "../../state-controller/State";
import { Minecraft } from "../../Minecraft";
import TextThatFitsInOneLineWithAutoResize from "../../gui/components/TextThatFitsInOneLineWithAutoResize";
import { MenuSliderWithLabelAndValueDisplay } from "../../gui/components/MenuSlider";
import MenuButton from "../../gui/components/MenuButton";

export default class SettingsMenu extends GUI_Seperate implements State {
	mainProgram: Minecraft;
	isActive = false;
	constructor(constructorObject: { mainProgram: Minecraft }) {
		super(
			constructorObject.mainProgram.engine,
			`gui_${SettingsMenu.constructor.name}`
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
		grid.addRowDefinition(40, true);
		grid.addRowDefinition(1);

		grid.width = "75%";
		container.addControl(grid);

		//Top
		let heading = new TextThatFitsInOneLineWithAutoResize({
			name: "heading",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			text: {
				color: "black",
				lineBreak: false,
				textContent: "Einstellungen",
			},
			height: "100%",
			width: "100%",
		});

		grid.addControl(heading.textWrapper, 0, 0);

		let fovSlider = new MenuSliderWithLabelAndValueDisplay({
			guiContainer: this.guiContainer,
			name: "fov_slider",
			height: "100%",
			width: "100%",
			memoryHelperEventlisteners: this.memoryHelpers.eventListeners,
			layout: {
				label: {
					gridColumnWidth: {
						value: 0.2,
					},
					color: "white",
					textContent: "Sichtfeld (FOV):",
					height: "100%",
				},
				slider: {
					gridColumnWidth: {
						value: 0.6,
					},
					value: this.mainProgram.settings.fovSettings.fov,
					backgroundColor: "black",
					color: "gray",
					min: 30,
					max: 110,
					height: "100%",
					width: "100%",
					onValueChangedObservable: (eventData) => {
						try {
							let fov = parseInt(eventData.toFixed(0));
							fovSlider.valueDisplay.setText(`${fov}`);
							this.mainProgram.settings.fovSettings.set(fov);
						} catch (error) {
							console.error(error);
						}
						fovSlider.slider.value = this.mainProgram.settings.fovSettings.fov;
					},
					sound: {
						soundContainer: this.mainProgram.soundContainer,
						pointerUp: true,
					},
				},
				valueDisplay: {
					gridColumnWidth: {
						value: 0.2,
					},
					color: "white",
					textContent: `${this.mainProgram.settings.fovSettings.fov}`,
				},
			},
		});

		grid.addControl(fovSlider.slider_grid, 1, 0);

		let btn_stackPanel = new BABYLON_GUI.StackPanel();
		btn_stackPanel.verticalAlignment =
			BABYLON_GUI.Control.VERTICAL_ALIGNMENT_TOP;
		btn_stackPanel.paddingTopInPixels = 40;
		btn_stackPanel.spacing = 20;

		grid.addControl(btn_stackPanel, 2, 0);
		//Music and Sound settings
		let btn_music_and_sounds_settings = new MenuButton({
			clickSound: true,
			text: {
				textContent: "Musik und Soundeffekte",
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_music_and_sounds_settings",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			soundContainer: this.mainProgram.soundContainer,
			onclick: () => {
				this.mainProgram.menuStateController.setState(
					this.mainProgram.stateList.states.menus.settings.musicAndSoundsMenu
				);
			},
		});
		btn_stackPanel.addControl(btn_music_and_sounds_settings.btn);

		let btn_video_settings = new MenuButton({
			clickSound: true,
			text: {
				textContent: "Grafik",
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_video_settings",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			soundContainer: this.mainProgram.soundContainer,
			onclick: () => {
				this.mainProgram.menuStateController.setState(
					this.mainProgram.stateList.states.menus.settings.graphicsMenu
				);
			},
		});
		btn_stackPanel.addControl(btn_video_settings.btn);

		let btn_controls = new MenuButton({
			clickSound: true,
			text: {
				textContent: "Eingabe & Steuerung",
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_controls",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			soundContainer: this.mainProgram.soundContainer,
			onclick: () => {
				this.mainProgram.menuStateController.setState(
					this.mainProgram.stateList.states.menus.settings.controlsMenu
				);
			},
		});
		btn_stackPanel.addControl(btn_controls.btn);

		let btn_ressourcepacks = new MenuButton({
			clickSound: true,
			text: {
				textContent: "Ressourcenpakete",
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_controls",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			soundContainer: this.mainProgram.soundContainer,
			onclick: () => {
				this.mainProgram.menuStateController.setState(
					this.mainProgram.stateList.states.menus.settings.ressourcePackMenu
				);
			},
		});
		btn_stackPanel.addControl(btn_ressourcepacks.btn);

		let btn_back = new MenuButton({
			clickSound: true,
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
		btn_stackPanel.addControl(btn_back.btn);
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
