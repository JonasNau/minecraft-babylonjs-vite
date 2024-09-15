export type OverwrittenErrors = Array<any>;
export default class OverrideError extends Error {
	overwrittenErrors?: OverwrittenErrors;
	constructor(parameters: {
		errorName: string;
		message: string;
		overwrittenErrors?: OverwrittenErrors;
	}) {
		super(parameters.message);
		this.name = parameters.errorName;
		this.overwrittenErrors = parameters.overwrittenErrors;
	}
}
