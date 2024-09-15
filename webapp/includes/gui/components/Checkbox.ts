import * as BABYLON_GUI from "@babylonjs/gui";
import SoundInstance from "../../controller/sound-controller/sound/SoundInstance";
import SoundContainer from "../../controller/sound-controller/sound/SoundContainer";
import SoundLibrary from "../../controller/sound-controller/sound/SoundLibrary";

export type Checkbox2DUIComponentOptions = {
	soundContainer?: SoundContainer;
	name: string;
	sounds: false | Checkbox2DUIComponentOptionsSounds;
};

export type Checkbox2DUIComponentOptionsSounds = {
	on?: boolean | SoundInstance;
	off?: boolean | SoundInstance;
	click?: boolean | SoundInstance;
};

export default class Checkbox2DUIComponent {
	checkbox: BABYLON_GUI.Checkbox;
	constructor(options: Checkbox2DUIComponentOptions) {
		this.checkbox = new BABYLON_GUI.Checkbox(options.name);

		if (options.sounds !== false && options.soundContainer) {
			this.checkbox.onPointerClickObservable.add(() => {
				let value = this.checkbox.isChecked;
				if (!options.soundContainer || options.sounds === false) return;

				if (options.sounds.on === true) {
					//Sound on
					if (value === true) {
						options.soundContainer.playSoundBySoundInstance(
							SoundLibrary.soundList.ui.click_sounds.checkbox.on
						);
					}
				} else if (typeof options.sounds.on == "object") {
					if (value === true) {
						options.soundContainer.playSoundBySoundInstance(options.sounds.on);
					}
				}
				if (options.sounds.off === true) {
					//Sound off
					if (value === false) {
						options.soundContainer.playSoundBySoundInstance(
							SoundLibrary.soundList.ui.click_sounds.checkbox.off
						);
					}
				} else if (typeof options.sounds.off == "object") {
					if (value === false) {
						options.soundContainer.playSoundBySoundInstance(options.sounds.off);
					}
				}
				if (options.sounds.click === true) {
					//Sound on

					options.soundContainer.playSoundBySoundInstance(
						SoundLibrary.soundList.ui.click_sounds.checkbox.click
					);
				} else if (typeof options.sounds.click == "object") {
					options.soundContainer.playSoundBySoundInstance(options.sounds.click);
				}
			});
		}
	}
}
