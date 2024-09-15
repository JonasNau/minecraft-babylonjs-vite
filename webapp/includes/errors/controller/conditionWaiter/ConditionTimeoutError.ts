export default class ConditionTimeoutError extends Error {
	static readonly DEFAULT_MESSAGE = "The condition timed out.";
	constructor(message: string = ConditionTimeoutError.DEFAULT_MESSAGE) {
		super(message);
		this.name = this.constructor.name;
	}
}
