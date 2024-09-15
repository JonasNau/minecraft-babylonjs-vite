import * as BABYLON_GUI from "@babylonjs/gui";
import { WorldEntry } from "../../controller/WorldContoller";
export default class WorldEntryComponent {
	isSelected: boolean;
	worldEntry: WorldEntry;
	babylonComponent: BABYLON_GUI.Grid;
	isHovered: boolean;
	constructor(
		worldEntry: WorldEntry,
		babylonComponent: BABYLON_GUI.Grid,
		isSelected = false
	) {
		this.worldEntry = worldEntry;
		this.isSelected = isSelected;
		this.babylonComponent = babylonComponent;
		this.isHovered = false;
	}
}
