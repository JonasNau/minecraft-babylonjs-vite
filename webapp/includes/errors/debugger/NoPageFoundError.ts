export default class NoPageFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
	}
}
