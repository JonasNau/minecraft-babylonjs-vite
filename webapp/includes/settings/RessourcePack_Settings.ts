import GlobalOptions from "./GlobalOptions";
import * as objectFunctions from "j-object-functions";

export default class RessourcePack_Settings {
	available: string[];
	active: string[];
	constructor() {
		this.available =
			GlobalOptions.options.settings.standardSettings.ressourcePack.available;
		this.active =
			GlobalOptions.options.settings.standardSettings.ressourcePack.active;
	}

	addRessourcePackToActive(ressourcePackName: string, order: number): boolean {
		if (this.active.includes(ressourcePackName)) {
			console.log(
				`The ressource pack '${ressourcePackName}' is already active`
			);
			return false;
		}

		objectFunctions.insertToArrayAtIndex(this.active, ressourcePackName, order);
		return true;
	}

	removeRessourcePackFromActive(ressourcePackName: string) {
		if (this.active.length === 1) return;
		if (ressourcePackName === "default") return;
		this.active = objectFunctions.removeFromArray(
			this.active,
			ressourcePackName,
			false,
			false,
			objectFunctions.ERemoveDirection.START
		);
	}

	rearangeRessourcePack(
		ressourcePackName: string,
		direction: objectFunctions.EArrayRearangeDirection
	): boolean {
		return objectFunctions.moveElementInArrayOneIndex(
			this.active,
			ressourcePackName,
			direction
		);
	}
}
