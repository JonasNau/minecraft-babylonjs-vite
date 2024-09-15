export default class Orientation {
	orientation: number;
	constructor(orientation?: number) {
		this.orientation = 0;

		if (orientation !== undefined) this.setOrientation(orientation);
	}

	setOrientation(orientation: number) {
		orientation = Math.ceil(orientation);
		if (orientation < 0 || orientation > 360 - 1) {
			throw new Error("Orientation can only be an integer from 0 to 360");
		}
		this.orientation = orientation;
	}

	getOrientationInt(): number {
		return this.orientation;
	}
}

export enum EOrientation {
	NORTH = 0,
	EAST = 90,
	SOUTH = 180,
	WEST = 270,
}
