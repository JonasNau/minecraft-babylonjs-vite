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

export default class MusicAndSoundsMenu extends GUI_Seperate implements State {
	mainProgram: Minecraft;
	isActive = false;
	constructor(constructorObject: { mainProgram: Minecraft }) {
		super(
			constructorObject.mainProgram.engine,
			`gui_${MusicAndSoundsMenu.constructor.name}`
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
		grid.addRowDefinition(45, true);
		grid.addRowDefinition(45, true);
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
				textContent: "Musik und Sounds",
			},
			height: "100%",
			width: "100%",
		});

		grid.addControl(heading.textWrapper, 0, 0);

		let slider_masterVolume = new MenuSliderWithLabelAndValueDisplay({
			guiContainer: this.guiContainer,
			name: "slider_master_volume",
			height: "100%",
			width: "100%",
			memoryHelperEventlisteners: this.memoryHelpers.eventListeners,
			layout: {
				label: {
					gridColumnWidth: {
						value: 0.2,
					},
					color: "white",
					textContent: "Master Lautstärke:",
					height: "100%",
				},
				slider: {
					gridColumnWidth: {
						value: 0.8,
					},
					value: this.mainProgram.settings.musicSettings.masterVolume * 100,
					backgroundColor: "black",
					color: "gray",
					min: 0,
					max: 100,
					height: "100%",
					width: "100%",
					onValueChangedObservable: (eventData) => {
						try {
							let newMasterVolume = parseInt(eventData.toFixed(0));
							this.mainProgram.settings.musicSettings.setMasterVolume(
								newMasterVolume / 100
							);
							slider_masterVolume.valueDisplay.setText(`${newMasterVolume}`);
							this.mainProgram.musicContainer.musicVolumeSetter.updateAllMusicVolumes();
							this.mainProgram.soundContainer.soundVolumeSetter.updateAllSoundVolumes();
						} catch (error) {
							console.error(error);
						}
						slider_masterVolume.slider.value =
							this.mainProgram.settings.musicSettings.masterVolume * 100;
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
						this.mainProgram.settings.musicSettings.masterVolume * 100
					).toFixed(0)}`,
				},
			},
		});
		slider_masterVolume.slider_grid.paddingLeft = "10px";
		slider_masterVolume.slider_grid.paddingRight = "10px";

		grid.addControl(slider_masterVolume.slider_grid, 1, 0);

		//Music

		let grid_music_settings = new BABYLON_GUI.Grid("grid_music_settings");
		grid_music_settings.addColumnDefinition(0.4);
		grid_music_settings.addColumnDefinition(0.2);
		grid_music_settings.addColumnDefinition(0.1);
		grid_music_settings.addColumnDefinition(0.1);
		grid_music_settings.addColumnDefinition(0.1);
		grid_music_settings.addColumnDefinition(0.1);
		grid_music_settings.paddingLeft = "10px";
		grid_music_settings.paddingRight = "10px";
		grid_music_settings.paddingTop = "10px";

		grid.addControl(grid_music_settings, 2, 0);
		///Music volume

		let slider_musicVolume = new MenuSliderWithLabelAndValueDisplay({
			guiContainer: this.guiContainer,
			name: "slider_music_volume",
			height: "100%",
			width: "100%",
			memoryHelperEventlisteners: this.memoryHelpers.eventListeners,
			layout: {
				label: {
					gridColumnWidth: {
						value: 0.2,
					},
					color: "white",
					textContent: "Musik:",
					height: "100%",
				},
				slider: {
					gridColumnWidth: {
						value: 0.8,
					},
					value: this.mainProgram.settings.musicSettings.musicVolume * 100,
					backgroundColor: "black",
					color: "gray",
					min: 0,
					max: 100,
					height: "100%",
					width: "100%",
					onValueChangedObservable: (eventData) => {
						try {
							let newVolume = parseInt(eventData.toFixed(0));
							this.mainProgram.settings.musicSettings.setMusicVolume(
								newVolume / 100
							);
							slider_musicVolume.valueDisplay.setText(`${newVolume}`);
							this.mainProgram.musicContainer.musicVolumeSetter.updateAllMusicVolumes();
							this.mainProgram.soundContainer.soundVolumeSetter.updateAllSoundVolumes();
						} catch (error) {
							console.error(error);
						}
						slider_musicVolume.slider.value =
							this.mainProgram.settings.musicSettings.musicVolume * 100;
						if (this.mainProgram.settings.musicSettings.musicVolume > 0) {
							if (
								!this.mainProgram.musicPlayer.isPlaying() &&
								!this.mainProgram.musicPlayer.getIsLoading()
							) {
								if (this.mainProgram.musicPlayer.randomize) {
									this.mainProgram.musicPlayer.playRandom();
								} else {
									this.mainProgram.musicPlayer.play();
								}
							}
						} else {
							this.mainProgram.musicPlayer.stop();
						}
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
						this.mainProgram.settings.musicSettings.musicVolume * 100
					).toFixed(0)}`,
				},
			},
		});
		grid_music_settings.addControl(slider_musicVolume.slider_grid, 0, 0);
		//Name of current

		let txt_name_of_current_music = new TextAutoScrollIfOverflow({
			width: "95%",
			advancedDynamicTexture: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			name: "txt_name_of_current_music",
			text: { fontSize: "20px", color: "white", charactersPerSecond: 1.5 },
		});
		if (this.mainProgram.musicPlayer.isPlaying()) {
			txt_name_of_current_music.setText(
				this.mainProgram.musicPlayer.tracks[
					this.mainProgram.musicPlayer.currentTrackIndex
				].soundDisplayName
			);
		}
		this.mainProgram.musicPlayer.memoryHelper.memoryHelperCallbacks.add(
			ECallbacksMusicPlayer.PLAY_NEXT,
			() => {
				txt_name_of_current_music.setText(
					this.mainProgram.musicPlayer.tracks[
						this.mainProgram.musicPlayer.currentTrackIndex
					].soundDisplayName
				);
			}
		);
		this.mainProgram.musicPlayer.memoryHelper.memoryHelperCallbacks.add(
			ECallbacksMusicPlayer.END,
			() => {
				txt_name_of_current_music.setText("Keine Wiedergabe");
			}
		);

		//grid_music_settings.addControl(txt_name_of_current_music, 0, 1);
		grid_music_settings.addControl(txt_name_of_current_music.textWrapper, 0, 1);
		///play previous
		let btn_play_previous = new MenuButton({
			clickSound: true,
			height: "100%",
			text: {
				textContent: "vorheriges",
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_music_previous",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			soundContainer: this.mainProgram.soundContainer,
			width: "100%",
			onclick: () => {
				this.mainProgram.musicPlayer.previous();
			},
		});
		grid_music_settings.addControl(btn_play_previous.btn, 0, 2);

		///play next
		let btn_play_next = new MenuButton({
			clickSound: true,
			height: "100%",
			text: {
				textContent: "nächstes",
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_music_next",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			soundContainer: this.mainProgram.soundContainer,
			width: "100%",
			onclick: () => {
				if (this.mainProgram.musicPlayer.randomize) {
					this.mainProgram.musicPlayer.playRandom();
				} else {
					this.mainProgram.musicPlayer.next();
				}
			},
		});
		grid_music_settings.addControl(btn_play_next.btn, 0, 3);
		///stop
		let btn_stop = new MenuButton({
			clickSound: true,
			height: "100%",
			text: {
				textContent: "stop",
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_music_stop",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			soundContainer: this.mainProgram.soundContainer,
			width: "100%",
			onclick: () => {
				this.mainProgram.musicPlayer.stop();
			},
		});
		grid_music_settings.addControl(btn_stop.btn, 0, 4);
		///toggle random
		let btn_music_toggle_random = new MenuButton({
			clickSound: true,
			height: "100%",
			text: {
				textContent: this.mainProgram.musicPlayer.randomize
					? "zufällig"
					: "nicht zufällig",
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 90 },
				lineBreak: false,
			},
			name: "btn_music_stop",
			guiContainer: this.guiContainer,
			memoryHelperEventlistener: this.memoryHelpers.eventListeners,
			soundContainer: this.mainProgram.soundContainer,
			width: "100%",
			onclick: () => {
				this.mainProgram.musicPlayer.randomize =
					!this.mainProgram.musicPlayer.randomize;
				btn_music_toggle_random.setText(
					this.mainProgram.musicPlayer.randomize ? "zufällig" : "nicht zufällig"
				);
			},
		});
		grid_music_settings.addControl(btn_music_toggle_random.btn, 0, 5);

		let grid_volumeSliders = new BABYLON_GUI.Grid("grid_volumeSliders");
		grid_volumeSliders.addColumnDefinition(0.5, false);
		grid_volumeSliders.addColumnDefinition(0.5, false);
		grid_volumeSliders.addRowDefinition(0.2, false);
		grid_volumeSliders.addRowDefinition(0.2, false);
		grid_volumeSliders.addRowDefinition(0.2, false);
		grid_volumeSliders.addRowDefinition(0.2, false);

		grid.addControl(grid_volumeSliders, 3, 0);

		//Different Volumes
		let slider_jukeboxAndNotebooks = new MenuSliderWithLabelAndValueDisplay({
			guiContainer: this.guiContainer,
			name: "slider_jukeboxAndNotebooks",
			height: "60px",
			width: "100%",
			memoryHelperEventlisteners: this.memoryHelpers.eventListeners,
			layout: {
				label: {
					gridColumnWidth: {
						value: 0.2,
					},
					color: "white",
					textContent: "Jukebox und Notenblöcke:",
					height: "100%",
				},
				slider: {
					gridColumnWidth: {
						value: 0.8,
					},
					value:
						this.mainProgram.settings.musicSettings.jukeboxAndNoteBlocksVolume *
						100,
					backgroundColor: "black",
					color: "gray",
					min: 0,
					max: 100,
					height: "100%",
					width: "100%",
					onValueChangedObservable: (eventData) => {
						try {
							let newVolume = parseInt(eventData.toFixed(0));
							this.mainProgram.settings.musicSettings.setJukeboxAndNoteBlocksVolume(
								newVolume / 100
							);
							slider_jukeboxAndNotebooks.valueDisplay.setText(`${newVolume}`);
							this.mainProgram.musicContainer.musicVolumeSetter.updateAllMusicVolumes();
							this.mainProgram.soundContainer.soundVolumeSetter.updateAllSoundVolumes();
						} catch (error) {
							console.error(error);
						}
						slider_jukeboxAndNotebooks.slider.value =
							this.mainProgram.settings.musicSettings
								.jukeboxAndNoteBlocksVolume * 100;
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
						this.mainProgram.settings.musicSettings.jukeboxAndNoteBlocksVolume *
						100
					).toFixed(0)}`,
				},
			},
		});
		grid_volumeSliders.addControl(slider_jukeboxAndNotebooks.slider_grid, 0, 0);

		let slider_weather = new MenuSliderWithLabelAndValueDisplay({
			guiContainer: this.guiContainer,
			name: "slider_weather",
			height: "60px",
			width: "100%",
			memoryHelperEventlisteners: this.memoryHelpers.eventListeners,
			layout: {
				label: {
					gridColumnWidth: {
						value: 0.2,
					},
					color: "white",
					textContent: "Wetter:",
					height: "100%",
				},
				slider: {
					gridColumnWidth: {
						value: 0.8,
					},
					value: this.mainProgram.settings.musicSettings.weatherVolume * 100,
					backgroundColor: "black",
					color: "gray",
					min: 0,
					max: 100,
					height: "100%",
					width: "100%",
					onValueChangedObservable: (eventData) => {
						try {
							let newVolume = parseInt(eventData.toFixed(0));
							this.mainProgram.settings.musicSettings.setWeatherVolume(
								newVolume / 100
							);
							slider_weather.valueDisplay.setText(`${newVolume}`);
							this.mainProgram.musicContainer.musicVolumeSetter.updateAllMusicVolumes();
							this.mainProgram.soundContainer.soundVolumeSetter.updateAllSoundVolumes();
						} catch (error) {
							console.error(error);
						}
						slider_weather.slider.value =
							this.mainProgram.settings.musicSettings.weatherVolume * 100;
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
						this.mainProgram.settings.musicSettings.jukeboxAndNoteBlocksVolume *
						100
					).toFixed(0)}`,
				},
			},
		});
		grid_volumeSliders.addControl(slider_weather.slider_grid, 0, 1);

		let slider_friendly_creatures = new MenuSliderWithLabelAndValueDisplay({
			guiContainer: this.guiContainer,
			name: "slider_friendly_creatures",
			height: "60px",
			width: "100%",
			memoryHelperEventlisteners: this.memoryHelpers.eventListeners,
			layout: {
				label: {
					gridColumnWidth: {
						value: 0.2,
					},
					color: "white",
					textContent: "Freundliche Kreaturen:",
					height: "100%",
				},
				slider: {
					gridColumnWidth: {
						value: 0.8,
					},
					value:
						this.mainProgram.settings.musicSettings.friendlyCreaturesVolume *
						100,
					backgroundColor: "black",
					color: "gray",
					min: 0,
					max: 100,
					height: "100%",
					width: "100%",
					onValueChangedObservable: (eventData) => {
						try {
							let newVolume = parseInt(eventData.toFixed(0));
							this.mainProgram.settings.musicSettings.setFriendlyCreaturesVolume(
								newVolume / 100
							);
							slider_friendly_creatures.valueDisplay.setText(`${newVolume}`);
							this.mainProgram.musicContainer.musicVolumeSetter.updateAllMusicVolumes();
							this.mainProgram.soundContainer.soundVolumeSetter.updateAllSoundVolumes();
						} catch (error) {
							console.error(error);
						}
						slider_friendly_creatures.slider.value =
							this.mainProgram.settings.musicSettings.friendlyCreaturesVolume *
							100;
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
						this.mainProgram.settings.musicSettings.friendlyCreaturesVolume *
						100
					).toFixed(0)}`,
				},
			},
		});
		grid_volumeSliders.addControl(slider_friendly_creatures.slider_grid, 1, 0);

		let slider_hostile_creatures = new MenuSliderWithLabelAndValueDisplay({
			guiContainer: this.guiContainer,
			name: "slider_hostile_creatures",
			height: "60px",
			width: "100%",
			memoryHelperEventlisteners: this.memoryHelpers.eventListeners,
			layout: {
				label: {
					gridColumnWidth: {
						value: 0.2,
					},
					color: "white",
					textContent: "Feindliche Kreaturen:",
					height: "100%",
				},
				slider: {
					gridColumnWidth: {
						value: 0.8,
					},
					value:
						this.mainProgram.settings.musicSettings.hostileCreaturesVolume *
						100,
					backgroundColor: "black",
					color: "gray",
					min: 0,
					max: 100,
					height: "100%",
					width: "100%",
					onValueChangedObservable: (eventData) => {
						try {
							let newVolume = parseInt(eventData.toFixed(0));
							this.mainProgram.settings.musicSettings.setHostileCreaturesVolume(
								newVolume / 100
							);
							slider_hostile_creatures.valueDisplay.setText(`${newVolume}`);
							this.mainProgram.musicContainer.musicVolumeSetter.updateAllMusicVolumes();
							this.mainProgram.soundContainer.soundVolumeSetter.updateAllSoundVolumes();
						} catch (error) {
							console.error(error);
						}
						slider_hostile_creatures.slider.value =
							this.mainProgram.settings.musicSettings.hostileCreaturesVolume *
							100;
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
						this.mainProgram.settings.musicSettings.hostileCreaturesVolume * 100
					).toFixed(0)}`,
				},
			},
		});
		grid_volumeSliders.addControl(slider_hostile_creatures.slider_grid, 1, 1);

		let slider_blocks = new MenuSliderWithLabelAndValueDisplay({
			guiContainer: this.guiContainer,
			name: "slider_blocks",
			height: "60px",
			width: "100%",
			memoryHelperEventlisteners: this.memoryHelpers.eventListeners,
			layout: {
				label: {
					gridColumnWidth: {
						value: 0.2,
					},
					color: "white",
					textContent: "Blöcke:",
					height: "100%",
				},
				slider: {
					gridColumnWidth: {
						value: 0.8,
					},
					value: this.mainProgram.settings.musicSettings.blocksVolume * 100,
					backgroundColor: "black",
					color: "gray",
					min: 0,
					max: 100,
					height: "100%",
					width: "100%",
					onValueChangedObservable: (eventData) => {
						try {
							let newVolume = parseInt(eventData.toFixed(0));
							this.mainProgram.settings.musicSettings.setBlocksVolume(
								newVolume / 100
							);
							slider_blocks.valueDisplay.setText(`${newVolume}`);
							this.mainProgram.musicContainer.musicVolumeSetter.updateAllMusicVolumes();
							this.mainProgram.soundContainer.soundVolumeSetter.updateAllSoundVolumes();
						} catch (error) {
							console.error(error);
						}
						slider_blocks.slider.value =
							this.mainProgram.settings.musicSettings.blocksVolume * 100;
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
						this.mainProgram.settings.musicSettings.blocksVolume * 100
					).toFixed(0)}`,
				},
			},
		});
		grid_volumeSliders.addControl(slider_blocks.slider_grid, 2, 0);

		let slider_players = new MenuSliderWithLabelAndValueDisplay({
			guiContainer: this.guiContainer,
			name: "slider_players",
			height: "60px",
			width: "100%",
			memoryHelperEventlisteners: this.memoryHelpers.eventListeners,
			layout: {
				label: {
					gridColumnWidth: {
						value: 0.2,
					},
					color: "white",
					textContent: "Spieler:",
					height: "100%",
				},
				slider: {
					gridColumnWidth: {
						value: 0.8,
					},
					value: this.mainProgram.settings.musicSettings.playersVolume * 100,
					backgroundColor: "black",
					color: "gray",
					min: 0,
					max: 100,
					height: "100%",
					width: "100%",
					onValueChangedObservable: (eventData) => {
						try {
							let newVolume = parseInt(eventData.toFixed(0));
							this.mainProgram.settings.musicSettings.setPlayersVolume(
								newVolume / 100
							);
							slider_players.valueDisplay.setText(`${newVolume}`);
							this.mainProgram.musicContainer.musicVolumeSetter.updateAllMusicVolumes();
							this.mainProgram.soundContainer.soundVolumeSetter.updateAllSoundVolumes();
						} catch (error) {
							console.error(error);
						}
						slider_players.slider.value =
							this.mainProgram.settings.musicSettings.playersVolume * 100;
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
						this.mainProgram.settings.musicSettings.playersVolume * 100
					).toFixed(0)}`,
				},
			},
		});
		grid_volumeSliders.addControl(slider_players.slider_grid, 2, 1);

		let slider_voice_speech = new MenuSliderWithLabelAndValueDisplay({
			guiContainer: this.guiContainer,
			name: "slider_voice_speech",
			height: "60px",
			width: "100%",
			memoryHelperEventlisteners: this.memoryHelpers.eventListeners,
			layout: {
				label: {
					gridColumnWidth: {
						value: 0.2,
					},
					color: "white",
					textContent: "Sprachchat:",
					height: "100%",
				},
				slider: {
					gridColumnWidth: {
						value: 0.8,
					},
					value:
						this.mainProgram.settings.musicSettings.voiceSpeechVolume * 100,
					backgroundColor: "black",
					color: "gray",
					min: 0,
					max: 100,
					height: "100%",
					width: "100%",
					onValueChangedObservable: (eventData) => {
						try {
							let newVolume = parseInt(eventData.toFixed(0));
							this.mainProgram.settings.musicSettings.setVoiceSpeechVolume(
								newVolume / 100
							);
							slider_voice_speech.valueDisplay.setText(`${newVolume}`);
							this.mainProgram.musicContainer.musicVolumeSetter.updateAllMusicVolumes();
							this.mainProgram.soundContainer.soundVolumeSetter.updateAllSoundVolumes();
						} catch (error) {
							console.error(error);
						}
						slider_voice_speech.slider.value =
							this.mainProgram.settings.musicSettings.voiceSpeechVolume * 100;
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
						this.mainProgram.settings.musicSettings.voiceSpeechVolume * 100
					).toFixed(0)}`,
				},
			},
		});
		grid_volumeSliders.addControl(slider_voice_speech.slider_grid, 3, 0);

		let slider_ui = new MenuSliderWithLabelAndValueDisplay({
			guiContainer: this.guiContainer,
			name: "slider_ui",
			height: "60px",
			width: "100%",
			memoryHelperEventlisteners: this.memoryHelpers.eventListeners,
			layout: {
				label: {
					gridColumnWidth: {
						value: 0.2,
					},
					color: "white",
					textContent: "Menü:",
					height: "100%",
				},
				slider: {
					gridColumnWidth: {
						value: 0.8,
					},
					value: this.mainProgram.settings.musicSettings.uiVolume * 100,
					backgroundColor: "black",
					color: "gray",
					min: 0,
					max: 100,
					height: "100%",
					width: "100%",
					onValueChangedObservable: (eventData) => {
						try {
							let newVolume = parseInt(eventData.toFixed(0));
							this.mainProgram.settings.musicSettings.setUiVolume(
								newVolume / 100
							);
							slider_ui.valueDisplay.setText(`${newVolume}`);
							this.mainProgram.musicContainer.musicVolumeSetter.updateAllMusicVolumes();
							this.mainProgram.soundContainer.soundVolumeSetter.updateAllSoundVolumes();
						} catch (error) {
							console.error(error);
						}
						slider_ui.slider.value =
							this.mainProgram.settings.musicSettings.uiVolume * 100;
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
						this.mainProgram.settings.musicSettings.uiVolume * 100
					).toFixed(0)}`,
				},
			},
		});
		grid_volumeSliders.addControl(slider_ui.slider_grid, 3, 1);

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
		grid.addControl(btn_back.btn, 4, 0);
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
