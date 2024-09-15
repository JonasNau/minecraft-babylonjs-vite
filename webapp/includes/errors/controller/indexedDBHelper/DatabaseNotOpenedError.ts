export default class DatabaseNotOpenedError extends Error {
	static readonly DEFAULT_MESSAGE = "The database was not opened.";
	constructor(message: string = DatabaseNotOpenedError.DEFAULT_MESSAGE) {
		super(message);
		this.name = this.constructor.name;
	}
}
