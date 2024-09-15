import OverrideError, { OverwrittenErrors } from "../../OverrideError";

export default class IndexedDBOpenBlockedError extends OverrideError {
	static readonly DEFAULT_MESSAGE =
		"Opening the indexedDB database was blocked.";
	constructor(
		message: string = IndexedDBOpenBlockedError.DEFAULT_MESSAGE,
		overwrittenErrors: OverwrittenErrors
	) {
		super({
			errorName: IndexedDBOpenBlockedError.name,
			message: message ?? IndexedDBOpenBlockedError.DEFAULT_MESSAGE,
			overwrittenErrors,
		});
	}
}
