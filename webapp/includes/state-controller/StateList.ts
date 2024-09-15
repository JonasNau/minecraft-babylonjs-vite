import MainGame from "../mainGame/MainGame";
import GameSelectMenu from "../menus/gameSelect/GameSelectMenu";
import WorldCreateMenu from "../menus/gameSelect/WorldCreateMenu";
import MainMenu from "../menus/main/MainMenu";
import ControlsMenu from "../menus/settings/ControlsMenu";
import GraphicsMenu from "../menus/settings/GraphicsMenu";
import MusicAndSoundsMenu from "../menus/settings/MusicAndSoundsMenu";
import RessourcePacksMenu from "../menus/settings/RessourcePacksMenu";
import SettingsMenu from "../menus/settings/SettingsMenu";
import State from "./State";

export type StateEntry = State | { [hirarcyName: string]: StateEntry };

export default class StateList {
	public states: {
		menus: {
			main: {
				mainMenu?: MainMenu;
			};
			settings: {
				settingsMenu?: SettingsMenu;
				musicAndSoundsMenu?: MusicAndSoundsMenu;
				graphicsMenu?: GraphicsMenu;
				controlsMenu?: ControlsMenu;
				ressourcePackMenu?: RessourcePacksMenu;
			};
			gameSelectMenu: {
				overview?: GameSelectMenu;
				worldCreateMenu?: WorldCreateMenu;
			};

			//Pause Menu
			//Hidden Cheat Menu
		};
		//Main Game
		mainGame?: MainGame;
	};

	constructor() {
		this.states = { menus: { main: {}, settings: {}, gameSelectMenu: {} } };
	}
}
