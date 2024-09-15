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

export default class GraphicsMenu extends GUI_Seperate implements State {
	mainProgram: Minecraft;
	isActive = false;
	constructor(constructorObject: { mainProgram: Minecraft }) {
		super(
			constructorObject.mainProgram.engine,
			`gui_${GraphicsMenu.constructor.name}`
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
				textContent: "Grafik",
			},
			height: "100%",
			width: "100%",
		});

		grid.addControl(heading.textWrapper, 0, 0);

		let grid_graphics_settings = new BABYLON_GUI.Grid("grid_graphics_settings");
		grid.addControl(grid_graphics_settings, 1, 0);
		grid_graphics_settings.addColumnDefinition(0.5);
		grid_graphics_settings.addColumnDefinition(0.5);
		grid_graphics_settings.addRowDefinition(65, true);
		grid_graphics_settings.addRowDefinition(65, true);
		grid_graphics_settings.addRowDefinition(65, true);
		grid_graphics_settings.addRowDefinition(65, true);
		grid_graphics_settings.addRowDefinition(65, true);
		grid_graphics_settings.addRowDefinition(65, true);
		grid_graphics_settings.addRowDefinition(65, true);
		grid_graphics_settings.addRowDefinition(65, true);

		grid_graphics_settings.paddingLeft = "10px";
		grid_graphics_settings.paddingRight = "10px";
		grid_graphics_settings.paddingTop = "10px";

		//Render distance
		let slider_render_distance = new MenuSliderWithLabelAndValueDisplay({
			guiContainer: this.guiContainer,
			name: "slider_render_distance",
			height: "100%",
			width: "100%",
			memoryHelperEventlisteners: this.memoryHelpers.eventListeners,
			layout: {
				label: {
					gridColumnWidth: {
						value: 0.2,
					},
					color: "white",
					textContent: "Render Distanz:",
					height: "100%",
				},
				slider: {
					gridColumnWidth: {
						value: 0.8,
					},
					value: this.mainProgram.settings.videoSettings.renderDistance,
					backgroundColor: "black",
					color: "gray",
					min: 1,
					max: 40,
					height: "100%",
					width: "100%",
					onValueChangedObservable: (eventData) => {
						try {
							let newValue = parseInt(eventData.toFixed(0));
							this.mainProgram.settings.videoSettings.setRenderDistance(
								newValue
							);
							slider_render_distance.valueDisplay.setText(`${newValue}`);
						} catch (error) {
							console.error(error);
						}
						slider_render_distance.slider.value =
							this.mainProgram.settings.videoSettings.renderDistance;
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
					textContent: `${this.mainProgram.settings.videoSettings.renderDistance.toFixed(
						0
					)}`,
				},
			},
		});
		grid_graphics_settings.addControl(slider_render_distance.slider_grid, 0, 0);
		//Simulation distance
		let slider_simulation_distance = new MenuSliderWithLabelAndValueDisplay({
			guiContainer: this.guiContainer,
			name: "slider_simulation_distance",
			height: "100%",
			width: "100%",
			memoryHelperEventlisteners: this.memoryHelpers.eventListeners,
			layout: {
				label: {
					gridColumnWidth: {
						value: 0.2,
					},
					color: "white",
					textContent: "Simulations Distanz:",
					height: "100%",
				},
				slider: {
					gridColumnWidth: {
						value: 0.8,
					},
					value: this.mainProgram.settings.videoSettings.simulationDistance,
					backgroundColor: "black",
					color: "gray",
					min: 1,
					max: 40,
					height: "100%",
					width: "100%",
					onValueChangedObservable: (eventData) => {
						try {
							let newValue = parseInt(eventData.toFixed(0));
							this.mainProgram.settings.videoSettings.setSimulationDistance(
								newValue
							);
							slider_simulation_distance.valueDisplay.setText(`${newValue}`);
						} catch (error) {
							console.error(error);
						}
						slider_simulation_distance.slider.value =
							this.mainProgram.settings.videoSettings.simulationDistance;
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
					textContent: `${this.mainProgram.settings.videoSettings.simulationDistance.toFixed(
						0
					)}`,
				},
			},
		});
		grid_graphics_settings.addControl(
			slider_simulation_distance.slider_grid,
			0,
			1
		);

		//Max FPS
		let slider_max_fps = new MenuSliderWithLabelAndValueDisplay({
			guiContainer: this.guiContainer,
			name: "slider_max_fps",
			height: "100%",
			width: "100%",
			memoryHelperEventlisteners: this.memoryHelpers.eventListeners,
			layout: {
				label: {
					gridColumnWidth: {
						value: 0.2,
					},
					color: "white",
					textContent: "max. FPS (Spiel):",
					height: "100%",
				},
				slider: {
					gridColumnWidth: {
						value: 0.8,
					},
					value: this.mainProgram.settings.videoSettings.maxFPS,
					backgroundColor: "black",
					color: "gray",
					min: 1,
					max: Math.min(Math.round(this.mainProgram.engine.getFps()), 240),
					height: "100%",
					width: "100%",
					onValueChangedObservable: (eventData) => {
						try {
							let newValue = parseInt(eventData.toFixed(0));
							this.mainProgram.settings.videoSettings.setMaxFPS(newValue);
							slider_max_fps.valueDisplay.setText(`${newValue}`);
						} catch (error) {
							console.error(error);
						}
						slider_max_fps.slider.value =
							this.mainProgram.settings.videoSettings.maxFPS;
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
					textContent: `${this.mainProgram.settings.videoSettings.maxFPS.toFixed(
						0
					)}`,
				},
			},
		});
		grid_graphics_settings.addControl(slider_max_fps.slider_grid, 1, 0);

		//Max FPS (Menu)
		let slider_max_fps_menu = new MenuSliderWithLabelAndValueDisplay({
			guiContainer: this.guiContainer,
			name: "slider_max_fps_menu",
			height: "100%",
			width: "100%",
			memoryHelperEventlisteners: this.memoryHelpers.eventListeners,
			layout: {
				label: {
					gridColumnWidth: {
						value: 0.2,
					},
					color: "white",
					textContent: "max. FPS (Menü):",
					height: "100%",
				},
				slider: {
					gridColumnWidth: {
						value: 0.8,
					},
					value: this.mainProgram.settings.videoSettings.menuFPS,
					backgroundColor: "black",
					color: "gray",
					min: 1,
					max: 120,
					height: "100%",
					width: "100%",
					onValueChangedObservable: (eventData) => {
						try {
							let newValue = parseInt(eventData.toFixed(0));
							this.mainProgram.settings.videoSettings.setMenuFPS(newValue);
							slider_max_fps_menu.valueDisplay.setText(`${newValue}`);
						} catch (error) {
							console.error(error);
						}
						slider_max_fps_menu.slider.value =
							this.mainProgram.settings.videoSettings.menuFPS;
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
					textContent: `${this.mainProgram.settings.videoSettings.menuFPS.toFixed(
						0
					)}`,
				},
			},
		});
		slider_max_fps_menu.slider.onPointerUpObservable.add((eventData) => {
			this.mainProgram.menuStateController.setState(
				this.mainProgram.stateList.states.menus.settings.graphicsMenu
			);
		});
		grid_graphics_settings.addControl(slider_max_fps_menu.slider_grid, 1, 1);

		//Brightness
		//Max FPS
		let slider_brightness = new MenuSliderWithLabelAndValueDisplay({
			guiContainer: this.guiContainer,
			name: "slider_brightness",
			height: "100%",
			width: "100%",
			memoryHelperEventlisteners: this.memoryHelpers.eventListeners,
			layout: {
				label: {
					gridColumnWidth: {
						value: 0.2,
					},
					color: "white",
					textContent: "Helligkeit:",
					height: "100%",
				},
				slider: {
					gridColumnWidth: {
						value: 0.8,
					},
					value: this.mainProgram.settings.videoSettings.brightness * 100,
					backgroundColor: "black",
					color: "gray",
					min: 0,
					max: 100,
					height: "100%",
					width: "100%",
					onValueChangedObservable: (eventData) => {
						try {
							let newValue = parseInt(eventData.toFixed(0));
							this.mainProgram.settings.videoSettings.setBrightnes(
								newValue / 100
							);
							slider_brightness.valueDisplay.setText(`${newValue}`);
						} catch (error) {
							console.error(error);
						}
						slider_brightness.slider.value =
							this.mainProgram.settings.videoSettings.brightness * 100;
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
					textContent: `${(
						this.mainProgram.settings.videoSettings.brightness * 100
					).toFixed(0)}`,
				},
			},
		});
		grid_graphics_settings.addControl(slider_brightness.slider_grid, 2, 0);

		let btn_webGPU = new MenuButton({
			clickSound: true,
			height: "100%",
			text: {
				textContent: this.mainProgram.settings.videoSettings.webGPUEnabled
					? "WebGPU: aktiviert"
					: "WebGPU: deaktiviert",
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_toogle_webGPU",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			soundContainer: this.mainProgram.soundContainer,
			width: "80%",
			onclick: async () => {
				try {
					await this.mainProgram.settings.videoSettings.setWebGPUEnabled(
						!this.mainProgram.settings.videoSettings.webGPUEnabled
					);
				} catch (error) {
					alert(
						"WebGPU wird von deinem System nicht unterstützt. Überprüfe die Version deines Browsers oder des Betriebssystems."
					);
				}

				btn_webGPU.setText(
					this.mainProgram.settings.videoSettings.getWebGPUIsEnabled(
						this.mainProgram.engine
					)
						? "WebGPU: aktiviert"
						: "WebGPU: deaktiviert"
				);
				if (
					this.mainProgram.settings.videoSettings.webGPUEnabled !==
					this.mainProgram.settings.videoSettings.getWebGPUIsEnabled(
						this.mainProgram.engine
					)
				) {
					if (
						confirm(
							"Wenn du die Render-Engine ändern möchtest muss das Spiel neugestartet werden. Der nicht gespeichterte Spielstand geht dabei verloren. Möchtest du jetzt neustarten?"
						)
					) {
						this.mainProgram.exit();
						return;
					}
				}
			},
		});
		grid_graphics_settings.addControl(btn_webGPU.btn, 2, 1);

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
