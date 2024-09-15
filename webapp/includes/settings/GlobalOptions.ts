import { EKeyboardCode } from "../input-control/keyboard/EKeyboardCode";
import { EMouseKeys } from "../input-control/mouse/EMouseKeys";
import Keyboard_Keybinding from "./Keyboard_Keybinding";
import Mouse_Keybinding from "./Mouse_Keybinding";

export default class GlobalOptions {
	static options = {
		standardFont: "Times new Roman",
		soundContainer: {
			removeFromBufferIfNotUsedForSeconds: 300,
			bufferSounds: true,
			bufferCleanerIntervalInSeconds: 20,
		},
		musicContainer: {
			removeFromBufferIfNotUsedForSeconds: 600,
			bufferMusic: true,
			bufferCleanerIntervalInSeconds: 60,
		},
		settings: {
			standardSettings: {
				musicSettings: {
					masterVolume: 0.5,
					musicVolume: 0.3,
					jukeboxAndNoteBlocksVolume: 1,
					weatherVolume: 1,
					blocksVolume: 1,
					hostileCreaturesVolume: 1,
					friendlyCreaturesVolume: 1,
					playersVolume: 1,
					voiceSpeechVolume: 1,
					uiVolume: 1,
				},
				fovSettings: {
					fov: 70,
				},
				videoSettings: {
					renderDistance: 4,
					simulationDistance: 8,
					maxFPS: 60,
					menuFPS: 30,
					brightness: 1,
				},
				controls: {
					keybindingSettings: {
						JUMP: new Keyboard_Keybinding({
							code: EKeyboardCode.Space,
							displayName: EKeyboardCode.Space,
						}),

						FORWARD: new Keyboard_Keybinding({
							code: EKeyboardCode.KeyW,
							displayName: EKeyboardCode.KeyW,
						}),
						BACKWARDS: new Keyboard_Keybinding({
							code: EKeyboardCode.KeyS,
							displayName: EKeyboardCode.KeyS,
						}),
						LEFT: new Keyboard_Keybinding({
							code: EKeyboardCode.KeyA,
							displayName: EKeyboardCode.KeyA,
						}),
						RIGHT: new Keyboard_Keybinding({
							code: EKeyboardCode.KeyD,
							displayName: EKeyboardCode.KeyD,
						}),
						SNEAK: new Keyboard_Keybinding({
							code: EKeyboardCode.ShiftLeft,
							displayName: EKeyboardCode.ShiftLeft,
						}),
						SPRINT: new Keyboard_Keybinding({
							code: EKeyboardCode.ControlLeft,
							displayName: EKeyboardCode.ControlLeft,
						}),
						ATTACK_DESTROY: new Mouse_Keybinding(EMouseKeys.MAIN, "Primär"),
						PICK_BLOCK: new Mouse_Keybinding(EMouseKeys.AUXILARY, "Mausrad"),
						USE_ITEM_PLACE_BLOCK: new Mouse_Keybinding(
							EMouseKeys.SECONDARY,
							"Sekundär"
						),
						DROP_ITEM: new Keyboard_Keybinding({
							code: EKeyboardCode.KeyQ,
							displayName: EKeyboardCode.KeyQ,
						}),
						HOTBAR_SLOT_0: new Keyboard_Keybinding({
							code: EKeyboardCode.Digit1,
							displayName: EKeyboardCode.Digit1,
						}),
						HOTBAR_SLOT_1: new Keyboard_Keybinding({
							code: EKeyboardCode.Digit2,
							displayName: EKeyboardCode.Digit2,
						}),
						HOTBAR_SLOT_2: new Keyboard_Keybinding({
							code: EKeyboardCode.Digit3,
							displayName: EKeyboardCode.Digit3,
						}),
						HOTBAR_SLOT_3: new Keyboard_Keybinding({
							code: EKeyboardCode.Digit4,
							displayName: EKeyboardCode.Digit4,
						}),
						HOTBAR_SLOT_4: new Keyboard_Keybinding({
							code: EKeyboardCode.Digit5,
							displayName: EKeyboardCode.Digit5,
						}),
						HOTBAR_SLOT_5: new Keyboard_Keybinding({
							code: EKeyboardCode.Digit6,
							displayName: EKeyboardCode.Digit6,
						}),
						HOTBAR_SLOT_6: new Keyboard_Keybinding({
							code: EKeyboardCode.Digit7,
							displayName: EKeyboardCode.Digit7,
						}),
						HOTBAR_SLOT_7: new Keyboard_Keybinding({
							code: EKeyboardCode.Digit8,
							displayName: EKeyboardCode.Digit8,
						}),
						HOTBAR_SLOT_8: new Keyboard_Keybinding({
							code: EKeyboardCode.Digit9,
							displayName: EKeyboardCode.Digit9,
						}),
						TOGGLE_INVENTORY: new Keyboard_Keybinding({
							code: EKeyboardCode.KeyE,
							displayName: EKeyboardCode.KeyE,
						}),
						OPEN_CHAT: new Keyboard_Keybinding({
							code: EKeyboardCode.KeyT,
							displayName: EKeyboardCode.KeyT,
						}),
						TOGGLE_PERSPECTIVE: new Keyboard_Keybinding({
							code: EKeyboardCode.F5,
							displayName: EKeyboardCode.F5,
						}),
					},
				},
				ressourcePack: {
					available: ["default", "my-ressource-pack"],
					active: ["default"],
				},
			},
		},
		appearance: {
			menuButton: {
				standardHeight: 65,
				backgroundColor: "#a5a5a5",
				backgroundDisabledColor: "#2b2b2b",
			},
		},
		mainGame: {
			performance: {
				calculationsPerSecond: 60,
				updateFPSDisplayPerSecond: 1,
			},
			world: {
				minY: 0,
				maxY: 10,
				chunkSize: 16,
				maxZIndex: 0,
			},
		},
		indexedDBDatabases: {
			// block_data: {
			// 	NAME: "block_data",
			// 	CURRENT_VERSION: 1,
			// 	objectStoreNames: {
			// 		BLOCK_DATA: "block_data",
			// 	}
			// },
			// entity_data: {
			// 	NAME: "entity_data",
			// 	CURRENT_VERSION: 1,
			// },
			// player_data: {
			// 	NAME: "player_data",
			// 	CURRENT_VERSION: 1,
			// },
			worlds: {
				NAME: "worlds",
				CURRENT_VERSION: 1,
				objectStoreNames: {
					WORLDS_LIST: "worlds_list",
				},
			},
			worldDB: {
				worldDBPrefix: "world_",
				DB_VERSION: 1,
				objectStores: {
					block_data: {
						name: "block_data",
					},
				},
			},
		},
		worldCreateOptions: {
			DEFAULT_FLAT: {
				SIZE: 200,
			},
		},
	};
}
