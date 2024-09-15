import GlobalOptions from "./GlobalOptions";
import Keyboard_Keybinding from "./Keyboard_Keybinding";
import Mouse_Keybinding from "./Mouse_Keybinding";

export default class KeyBindings_Settings {
	[key: string]: Keyboard_Keybinding | Mouse_Keybinding;
	JUMP: Keyboard_Keybinding | Mouse_Keybinding;
	FORWARD: Keyboard_Keybinding | Mouse_Keybinding;
	BACKWARDS: Keyboard_Keybinding | Mouse_Keybinding;
	LEFT: Keyboard_Keybinding | Mouse_Keybinding;
	RIGHT: Keyboard_Keybinding | Mouse_Keybinding;
	SNEAK: Keyboard_Keybinding | Mouse_Keybinding;
	SPRINT: Keyboard_Keybinding | Mouse_Keybinding;
	ATTACK_DESTROY: Keyboard_Keybinding | Mouse_Keybinding;
	PICK_BLOCK: Keyboard_Keybinding | Mouse_Keybinding;
	USE_ITEM_PLACE_BLOCK: Keyboard_Keybinding | Mouse_Keybinding;
	DROP_ITEM: Keyboard_Keybinding | Mouse_Keybinding;
	HOTBAR_SLOT_0: Keyboard_Keybinding | Mouse_Keybinding;
	HOTBAR_SLOT_1: Keyboard_Keybinding | Mouse_Keybinding;
	HOTBAR_SLOT_2: Keyboard_Keybinding | Mouse_Keybinding;
	HOTBAR_SLOT_3: Keyboard_Keybinding | Mouse_Keybinding;
	HOTBAR_SLOT_4: Keyboard_Keybinding | Mouse_Keybinding;
	HOTBAR_SLOT_5: Keyboard_Keybinding | Mouse_Keybinding;
	HOTBAR_SLOT_6: Keyboard_Keybinding | Mouse_Keybinding;
	HOTBAR_SLOT_7: Keyboard_Keybinding | Mouse_Keybinding;
	HOTBAR_SLOT_8: Keyboard_Keybinding | Mouse_Keybinding;
	TOGGLE_INVENTORY: Keyboard_Keybinding | Mouse_Keybinding;
	OPEN_CHAT: Keyboard_Keybinding | Mouse_Keybinding;
	TOGGLE_PERSPECTIVE: Keyboard_Keybinding | Mouse_Keybinding;

	constructor() {
		const { controls } = GlobalOptions.options.settings.standardSettings;

		this.JUMP = controls.keybindingSettings.JUMP;
		this.FORWARD = controls.keybindingSettings.FORWARD;
		this.BACKWARDS = controls.keybindingSettings.BACKWARDS;
		this.LEFT = controls.keybindingSettings.LEFT;
		this.RIGHT = controls.keybindingSettings.RIGHT;
		this.SNEAK = controls.keybindingSettings.SNEAK;
		this.SPRINT = controls.keybindingSettings.SPRINT;
		this.ATTACK_DESTROY = controls.keybindingSettings.ATTACK_DESTROY;
		this.PICK_BLOCK = controls.keybindingSettings.PICK_BLOCK;
		this.USE_ITEM_PLACE_BLOCK =
			controls.keybindingSettings.USE_ITEM_PLACE_BLOCK;
		this.DROP_ITEM = controls.keybindingSettings.DROP_ITEM;
		this.HOTBAR_SLOT_0 = controls.keybindingSettings.HOTBAR_SLOT_0;
		this.HOTBAR_SLOT_1 = controls.keybindingSettings.HOTBAR_SLOT_1;
		this.HOTBAR_SLOT_2 = controls.keybindingSettings.HOTBAR_SLOT_2;
		this.HOTBAR_SLOT_3 = controls.keybindingSettings.HOTBAR_SLOT_3;
		this.HOTBAR_SLOT_4 = controls.keybindingSettings.HOTBAR_SLOT_4;
		this.HOTBAR_SLOT_5 = controls.keybindingSettings.HOTBAR_SLOT_5;
		this.HOTBAR_SLOT_6 = controls.keybindingSettings.HOTBAR_SLOT_6;
		this.HOTBAR_SLOT_7 = controls.keybindingSettings.HOTBAR_SLOT_7;
		this.HOTBAR_SLOT_8 = controls.keybindingSettings.HOTBAR_SLOT_8;
		this.TOGGLE_INVENTORY = controls.keybindingSettings.TOGGLE_INVENTORY;
		this.OPEN_CHAT = controls.keybindingSettings.OPEN_CHAT;
		this.TOGGLE_PERSPECTIVE = controls.keybindingSettings.TOGGLE_PERSPECTIVE;
	}
}
