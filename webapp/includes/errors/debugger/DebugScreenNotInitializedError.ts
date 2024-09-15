export default class DebugScreenNotInitializedError extends Error {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
	}
}
