import OverrideError, { OverwrittenErrors } from "../../OverrideError";

export default class IndexedDBOpenError extends OverrideError {
	static readonly DEFAULT_MESSAGE = "Opening the indexedDB database failed.";
	constructor(
		message: string = IndexedDBOpenError.DEFAULT_MESSAGE,
		overwrittenErrors: OverwrittenErrors
	) {
		super({
			errorName: IndexedDBOpenError.name,
			message: message ?? IndexedDBOpenError.DEFAULT_MESSAGE,
			overwrittenErrors,
		});
	}
}
