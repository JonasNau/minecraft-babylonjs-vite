import * as BABYLON_GUI from "@babylonjs/gui";
import KeyStrokePart_Keyboard from "../../../../input-control/keystroke/KeyStrokePart_Keyboard";
import KeyStrokePart_Mouse from "../../../../input-control/keystroke/KeyStrokePart_Mouse";
import { EMouseKeys } from "../../../../input-control/mouse/EMouseKeys";
import GlobalOptions from "../../../../settings/GlobalOptions";
import Keyboard_Keybinding from "../../../../settings/Keyboard_Keybinding";
import Mouse_Keybinding from "../../../../settings/Mouse_Keybinding";
import MenuButton from "../../MenuButton";
import TextAutoScrollIfOverflow from "../../TextAutoscrollIfOverflow";
import { MemoryHelperEventListeners } from "j-memoryhelper-functions";
import SoundContainer from "../../../../controller/sound-controller/sound/SoundContainer";
import InputController from "../../../../input-control/InputController";

export type KeyBindingSetterOptions = {
	guiContainer: BABYLON_GUI.AdvancedDynamicTexture;
	memoryHelpersEventliseners: MemoryHelperEventListeners;
	heightInPixels?: number;
	keyBindingName: {
		text: string;
		fontSize: string;
		color: string;
	};
	soundContainer: SoundContainer;
	keyBindingGetter: () => Keyboard_Keybinding | Mouse_Keybinding;
	keyBindingSetter: (
		keyBinding: Keyboard_Keybinding | Mouse_Keybinding
	) => void;
	standardOption: Keyboard_Keybinding | Mouse_Keybinding;
	inputController: InputController;
};

export default class KeyBindingSetter {
	keyBindingGrid: BABYLON_GUI.Grid;
	keyBindingName: TextAutoScrollIfOverflow;
	btnValueAndSet: MenuButton;
	btnReset: MenuButton;

	constructor(options: KeyBindingSetterOptions) {
		this.keyBindingGrid = new BABYLON_GUI.Grid("grid_keybinding");
		this.keyBindingGrid.heightInPixels = options.heightInPixels ?? 50;
		this.keyBindingGrid.addColumnDefinition(0.3);
		this.keyBindingGrid.addColumnDefinition(0.3);
		this.keyBindingGrid.addColumnDefinition(0.3);

		this.keyBindingName = new TextAutoScrollIfOverflow({
			advancedDynamicTexture: options.guiContainer,
			memoryHelperEventlistener: options.memoryHelpersEventliseners,
			name: "keyBinding_name",
			text: {
				textContent: options.keyBindingName.text,
				charactersPerSecond: 1,
				fontSize: options.keyBindingName.fontSize,
				color: options.keyBindingName.color,
			},
		});
		this.keyBindingGrid.addControl(this.keyBindingName.textWrapper, 0, 0);

		this.btnValueAndSet = new MenuButton({
			soundContainer: options.soundContainer,
			guiContainer: options.guiContainer,
			memoryHelperEventlistener: options.memoryHelpersEventliseners,
			height: "100%",
			clickSound: true,
			name: "btnValueAndSet",
			text: {
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 80 },
				textContent: `${options.keyBindingGetter().displayName}`,
				lineBreak: false,
			},
			onclick: async (eventData) => {
				try {
					this.btnValueAndSet.setText("Eingabe...");
					let keyStroke = await options.inputController.recordKeyStroke(
						1,
						true,
						true
					);
					console.log("Recorded keystroke:", keyStroke);
					let keyStrokePart = keyStroke.keyStrokeParts[0];
					if (keyStrokePart instanceof KeyStrokePart_Keyboard) {
						let keybinding = new Keyboard_Keybinding({
							character: keyStrokePart.character,
							code: keyStrokePart.eKeyboardCode,
							displayName: keyStrokePart.character,
						});
						options.keyBindingSetter(keybinding);
						this.btnValueAndSet.setText(`${keybinding.displayName}`);
					} else if (keyStrokePart instanceof KeyStrokePart_Mouse) {
						let name = "MAUS";
						switch (keyStrokePart.key) {
							case EMouseKeys.MAIN:
								name = "Primär";
								break;
							case EMouseKeys.SECONDARY:
								name = "Sekundär";
								break;
							case EMouseKeys.AUXILARY:
								name = "Mausrad";
								break;
							case EMouseKeys.FOURTH:
								name = "Virte Maustaste";
								break;
							case EMouseKeys.FIFTH:
								name = "Fünfte Maustaste";
								break;
						}
						let keybinding = new Mouse_Keybinding(keyStrokePart.key, name);
						options.keyBindingSetter(keybinding);
						this.btnValueAndSet.setText(`${keybinding.displayName}`);
					} else {
						this.btnValueAndSet.setText("Ungültig...");
					}
				} catch (e) {
					console.error(e);
					this.btnValueAndSet.setText(
						`${options.keyBindingGetter().displayName}`
					);
				}
			},
		});
		this.keyBindingGrid.addControl(this.btnValueAndSet.btn, 0, 1);

		this.btnReset = new MenuButton({
			soundContainer: options.soundContainer,
			guiContainer: options.guiContainer,
			memoryHelperEventlistener: options.memoryHelpersEventliseners,
			height: "100%",
			clickSound: true,
			name: "btn_reset",
			width: "80%",
			text: {
				autoScaleTextInOneLine: { heightInPercent: 80, widthInPercent: 80 },
				textContent: "Zurücksetzen",
				lineBreak: false,
			},
			onclick: async (eventData) => {
				options.keyBindingSetter(options.standardOption);
				this.btnValueAndSet.setText(
					`${options.keyBindingGetter().displayName}`
				);
			},
		});
		this.keyBindingGrid.addControl(this.btnReset.btn, 0, 2);
	}
}
