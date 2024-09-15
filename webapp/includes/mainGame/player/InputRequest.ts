export default class InputRequest {
	private requested: boolean;
	constructor() {
		this.requested = false;
	}

	getRequested(): boolean {
		return this.requested;
	}

	setRequested(requested: boolean) {
		this.requested = requested;
	}
}
