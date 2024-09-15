import OverrideError, { OverwrittenErrors } from "../../OverrideError";

export default class DatabaseCoudNotBeDeletedError extends OverrideError {
	static readonly DEFAULT_MESSAGE =
		"An error occured during the deletion of the database.";
	constructor(
		message: string = DatabaseCoudNotBeDeletedError.DEFAULT_MESSAGE,
		overwrittenErrors?: OverwrittenErrors
	) {
		super({
			errorName: DatabaseCoudNotBeDeletedError.name,
			message: message ?? DatabaseCoudNotBeDeletedError.DEFAULT_MESSAGE,
			overwrittenErrors,
		});
	}
}
