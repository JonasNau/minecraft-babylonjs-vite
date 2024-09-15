import State from "./State";
import StateNotInitializedError from "../errors/state-controller/StateNotInitializedError";

export default class StateController {
	currentState?: State;

	constructor() {}

	async setState(state: State | undefined) {
		if (!state) {
			return new StateNotInitializedError("The state is not initialized");
		}
		if (!this.currentState) {
			this.currentState = state;
			await this.currentState.enter();
			this.currentState.isActive = true;
			return;
		}
		await this.currentState.exit();
		this.currentState.isActive = false;
		this.currentState = state;
		await this.currentState.enter();
		this.currentState.isActive = true;
	}

	async clearState() {
		if (!this.currentState) return;
		this.currentState.isActive = false;
		await this.currentState.exit();
	}
}
