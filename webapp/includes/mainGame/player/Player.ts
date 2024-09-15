import { GAMEMODE } from "../../GAMEMODE";
import * as BABYLON from "@babylonjs/core";
import * as BABYLON_GUI from "@babylonjs/gui";
import PlayerPosition from "./PlayerPosition";
import Item from "../world/Item";

export default class Player {
	gamemode: GAMEMODE;
	position: PlayerPosition;
	facingDirection: BABYLON.Vector3;
	playerName: string;
	currentItem?: Item;

	constructor(options: {
		position?: PlayerPosition;
		facingDirection?: BABYLON.Vector3;
		playerName: string;
	}) {
		this.playerName = options.playerName;
		this.position = options.position ?? new PlayerPosition(0, 0, 0);
		this.facingDirection =
			options.facingDirection ?? new BABYLON.Vector3(1, 0, 0);
		this.gamemode = GAMEMODE.SURVIVAL;
	}
}
