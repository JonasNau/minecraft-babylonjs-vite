export default class FieldOfView_Settings {
	fov: number;
	readonly maxValue = 110;
	readonly minValue = 30;
	constructor() {
		this.fov = 70;
	}

	setDefault() {
		this.fov = 70;
	}

	set(number: number) {
		if (number > this.maxValue) {
			throw new Error(
				`The Field of view can't be larger than ${this.maxValue}`
			);
		}
		if (number < this.minValue) {
			throw new Error(
				`The Field of view can't be smaller than ${this.minValue}`
			);
		}
		this.fov = number;
	}
}
