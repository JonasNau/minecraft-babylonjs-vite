export default class DatabaseAlreadyExistsError extends Error {
	static readonly DEFAULT_MESSAGE = "The database does already exist.";
	constructor(message: string = DatabaseAlreadyExistsError.DEFAULT_MESSAGE) {
		super(message);
		this.name = this.constructor.name;
	}
}
