export default class DatabaseAlreadyExistsWithDifferentVersionError extends Error {
	static readonly DEFAULT_MESSAGE =
		"The database does already exist in a different version.";
	constructor(
		message: string = DatabaseAlreadyExistsWithDifferentVersionError.DEFAULT_MESSAGE
	) {
		super(message);
		this.name = this.constructor.name;
	}
}
