import * as BABYLON from "@babylonjs/core";
import * as BABYLON_GUI from "@babylonjs/gui";

import GUI_Seperate from "../../gui/GUI_Seperate";
import State from "../../state-controller/State";
import MenuButton from "../../gui/components/MenuButton";
import { Minecraft } from "../../Minecraft";
import TextThatFitsInOneLineWithAutoResize from "../../gui/components/TextThatFitsInOneLineWithAutoResize";
import GlobalVariables from "../../GlobalVariables";
import { EMinecraftStartScreenMessage } from "./EMinecraftStartScreenMessage";
import { getRandomIntBetween } from "j-random-functions";

export default class MainMenu extends GUI_Seperate implements State {
	mainProgram: Minecraft;
	isActive = false;

	constructor(constructorObject: { mainProgram: Minecraft }) {
		super(
			constructorObject.mainProgram.engine,
			`gui_${MainMenu.constructor.name}`
		);
		this.mainProgram = constructorObject.mainProgram;
		this.desiredFps = this.mainProgram.settings.videoSettings.menuFPS;
	}

	loadComponents() {
		if (!this.guiContainer) throw new Error("No guiContainerDefined");
		this.clearScene();
		if (!this.scene) {
			throw new Error(
				"Couldn't load components because the scene is not loaded"
			);
		}

		this.scene.clearColor = BABYLON.Color4.FromHexString("#10de47");

		//Create Outer Container
		const container = new BABYLON_GUI.Rectangle();
		container.thickness = 0;
		container.width = "100%";
		container.height = "100%";
		this.guiContainer.addControl(container);

		let grid = new BABYLON_GUI.Grid("main_menu_grid");
		grid.clipContent = false; //To let the dynamic text overflow
		grid.addRowDefinition(0.35);
		grid.addRowDefinition(0.65);
		container.addControl(grid);

		//MINECRAFT - TOP
		///Create Minecraft Text
		let heading = new TextThatFitsInOneLineWithAutoResize({
			name: "heading",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			text: {
				color: "black",
				lineBreak: false,
				textContent: "Minecraft",
			},
			height: "60%",
			width: "70%",
		});
		grid.addControl(heading.textWrapper, 0, 0);

		///Text that gets smaller and bigger
		let textThatGetsSmallerAndBigger = new TextThatFitsInOneLineWithAutoResize({
			name: "textThatGetsSmallerAndBigger",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			text: {
				color: "yellow",
				lineBreak: false,
				textContent: this.getRandomStartScreenMessage(),
			},
			height: "30%",
			width: "35%",
		});
		textThatGetsSmallerAndBigger.textWrapper.verticalAlignment =
			BABYLON_GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
		textThatGetsSmallerAndBigger.textWrapper.horizontalAlignment =
			BABYLON_GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
		textThatGetsSmallerAndBigger.textWrapper.rotation =
			BABYLON.Tools.ToRadians(-20);

		heading.textWrapper.clipContent = false;
		heading.textWrapper.addControl(textThatGetsSmallerAndBigger.textWrapper);

		//ScaleX
		let scaleX = new BABYLON.Animation(
			"textScaleAnimation",
			"scaleX",
			10,
			BABYLON.Animation.ANIMATIONTYPE_FLOAT,
			BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
		);
		scaleX.setKeys([
			{ frame: 0, value: 1 },
			{ frame: 5, value: 0.95 },
			{ frame: 10, value: 1 },
		]);

		//ScaleY
		let scaleY = new BABYLON.Animation(
			"textScaleAnimation",
			"scaleY",
			10,
			BABYLON.Animation.ANIMATIONTYPE_FLOAT,
			BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
		);
		scaleY.setKeys([
			{ frame: 0, value: 1 },
			{ frame: 5, value: 0.95 },
			{ frame: 10, value: 1 },
		]);

		textThatGetsSmallerAndBigger.textblock.animations = [];
		textThatGetsSmallerAndBigger.textblock.animations.push(scaleX, scaleY);

		this.scene.beginAnimation(
			textThatGetsSmallerAndBigger.textblock,
			0,
			this.desiredFps,
			true
		);

		let btn_stackPanel = new BABYLON_GUI.StackPanel();

		//BUTTONS - MIDDLE
		///Einzelspieler
		let btn_einzelspieler = new MenuButton({
			clickSound: true,
			text: {
				textContent: "Einzelspieler",
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_einzelspieler",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			soundContainer: this.mainProgram.soundContainer,
			onclick: () => {
				this.mainProgram.menuStateController.setState(
					this.mainProgram.stateList.states.menus.gameSelectMenu.overview
				);
			},
		});

		///Einstellungen
		let btn_einstellungen = new MenuButton({
			clickSound: true,
			text: {
				textContent: "Einstellungen",
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_einstellungen",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			soundContainer: this.mainProgram.soundContainer,
			onclick: () => {
				this.mainProgram.menuStateController.setState(
					this.mainProgram.stateList.states.menus.settings.settingsMenu
				);
			},
		});

		///Spiel Beenden
		let btn_beenden = new MenuButton({
			clickSound: true,
			text: {
				textContent: "Spiel Beenden",
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_spiel_beenden",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			soundContainer: this.mainProgram.soundContainer,
			onclick: () => {
				this.mainProgram.settings.saveToLocalStorage();
				window.location.reload();
			},
		});

		btn_stackPanel.addControl(btn_einzelspieler.btn);
		btn_stackPanel.addControl(btn_einstellungen.btn);
		btn_stackPanel.addControl(btn_beenden.btn);

		btn_stackPanel.horizontalAlignment =
			BABYLON_GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		btn_stackPanel.verticalAlignment =
			BABYLON_GUI.Control.VERTICAL_ALIGNMENT_TOP;

		btn_stackPanel.spacing = 20;
		btn_stackPanel.width = "60%";
		grid.addControl(btn_stackPanel, 1, 0);

		//VERSION - BOTTOM-LEFT
		let txt_version_info = new BABYLON_GUI.TextBlock("version_info");
		txt_version_info.fontSize = 25;
		txt_version_info.resizeToFit = true;

		txt_version_info.text = `${GlobalVariables.version}`;

		txt_version_info.verticalAlignment =
			BABYLON_GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
		txt_version_info.horizontalAlignment =
			BABYLON_GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		container.addControl(txt_version_info);

		//WebGPU - BOTTOM-Right
		let txt_webGPUEnabled = new BABYLON_GUI.TextBlock("version_info");
		txt_webGPUEnabled.fontSize = 25;
		txt_webGPUEnabled.resizeToFit = true;

		txt_webGPUEnabled.text = `${
			this.mainProgram.settings.videoSettings.webGPUEnabled ? "WebGPU" : "WebGL"
		}`;

		txt_webGPUEnabled.verticalAlignment =
			BABYLON_GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
		txt_webGPUEnabled.horizontalAlignment =
			BABYLON_GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
		container.addControl(txt_webGPUEnabled);
	}

	enter() {
		this.desiredFps = this.mainProgram.settings.videoSettings.menuFPS;
		this.startGUI();
		this.loadComponents();
		document.body.setAttribute("data-menu", "ingame-main-menu");
	}

	exit(): void {
		this.exitGUI();
	}

	getRandomStartScreenMessage(): string {
		let messageIndex = getRandomIntBetween(
			0,
			Object.keys(EMinecraftStartScreenMessage).length - 1
		);
		return Object.values(EMinecraftStartScreenMessage)[messageIndex];
	}
}
