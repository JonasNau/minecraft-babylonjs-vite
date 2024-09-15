import { ESoundType } from "../ESoundType";
import SoundInstance from "./SoundInstance";

type SoundFolder = {
	[folderNameOrSoundName: string]: SoundInstance | SoundFolder;
};

export default class SoundLibrary {
	static soundList = {
		ui: {
			click_sounds: {
				click_button: new SoundInstance({
					soundFileName: "ui_click.mp3",
					soundDisplayName: "ui_click",
					babylonName: "ui-click",
					pathToSound: ["ui", "click_sounds"],
					soundType: ESoundType.UI,
				}),
				checkbox: {
					on: new SoundInstance({
						soundFileName: "on.mp3",
						soundDisplayName: "checkbox_on",
						babylonName: "checkbox-on",
						pathToSound: ["ui", "click_sounds", "checkbox"],
						soundType: ESoundType.UI,
					}),
					off: new SoundInstance({
						soundFileName: "off.mp3",
						soundDisplayName: "checkbox_off",
						babylonName: "checkbox-off",
						pathToSound: ["ui", "click_sounds", "checkbox"],
						soundType: ESoundType.UI,
					}),
					click: new SoundInstance({
						soundFileName: "click.mp3",
						soundDisplayName: "checkbox_click",
						babylonName: "checkbox-click",
						pathToSound: ["ui", "click_sounds", "checkbox"],
						soundType: ESoundType.UI,
					}),
				},
				confirm: new SoundInstance({
					soundFileName: "ui_confirm.mp3",
					soundDisplayName: "ui_click",
					babylonName: "ui-click",
					pathToSound: ["ui", "click_sounds"],
					soundType: ESoundType.UI,
				}),
			},
			slider: {
				slider: new SoundInstance({
					soundFileName: "slider.mp3",
					soundDisplayName: "slider",
					babylonName: "slider",
					pathToSound: ["ui", "slider"],
					soundType: ESoundType.UI,
				}),
			},
		},
	};
	constructor() {}

	static getRelativePathToSound(sound: SoundInstance) {
		let path = sound.pathToSound.join("/");
		return path;
	}
}
