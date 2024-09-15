export default class WebGPUNotSupportedError extends Error {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
	}
}
