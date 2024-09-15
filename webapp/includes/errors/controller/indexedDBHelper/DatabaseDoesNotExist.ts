export default class DatabaseDoesNotExistError extends Error {
	static readonly DEFAULT_MESSAGE = "The database does not exist.";
	constructor(message: string = DatabaseDoesNotExistError.DEFAULT_MESSAGE) {
		super(message);
		this.name = this.constructor.name;
	}
}
