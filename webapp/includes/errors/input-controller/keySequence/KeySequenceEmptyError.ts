export default class KeySequenceEmptyError extends Error {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
	}
}
