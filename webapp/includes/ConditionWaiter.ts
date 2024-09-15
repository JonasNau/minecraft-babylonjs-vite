import { boolean } from "io-ts";
import ConditionTimeoutError from "./errors/controller/conditionWaiter/ConditionTimeoutError";
import { removeFromArray } from "j-object-functions";

export class ConditionList {
	conditionList: Array<Condition>;
	constructor() {
		this.conditionList = new Array<Condition>();
	}

	/**
	 *
	 * @throws Error if the condition is already in the list
	 * @param condition
	 */
	addCondition(condition: Condition) {
		if (this.conditionList.includes(condition)) {
			throw new Error("Condition is already added");
		}
	}

	getConditionByName(name: string): Condition | null {
		let found = this.conditionList.find((current) => {
			return current.getName() === name;
		});

		if (!found) return null;
		return found;
	}

	setStateOfConditionByName(name: string, isTrue: boolean): void {
		let condition = this.getConditionByName(name);
		if (!condition) {
			throw new Error(
				`The condition with the name '${name}' could not be found.`
			);
		}

		condition.setIsTrue(isTrue);
	}

	removeCondition(condition: Condition) {
		if (!this.conditionList.includes(condition)) {
			throw new Error("The condition is not in the list.");
		}
	}
}

export type ConditionWaiterOptions = {
	maxWaitTimeInMilliseconds?: number;
	lookupInterval?: number;
};

export class ConditionWaiter {
	readonly DEFAULT_LOOKUP_INTERVAL = 100;
	condition: Condition;
	endOfWait: Date | null;
	startOfWait: Date | null;
	lookupIntervalID: number | null;
	failTimeoutID: number | null;
	resolveFunction?: ((value: boolean | PromiseLike<boolean>) => void) | null;
	rejectFunction?: ((reason?: any) => void) | null;
	isWaiting: boolean;

	constructor(condition: Condition) {
		this.condition = condition;
		this.endOfWait = null;
		this.startOfWait = null;
		this.lookupIntervalID = null;
		this.failTimeoutID = null;
		this.isWaiting = false;
	}

	waitForConditionToBecomeTrueOrFalse(
		shouldBe: boolean,
		options?: ConditionWaiterOptions
	): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.resolveFunction = resolve;
			this.rejectFunction = reject;

			this.startOfWait = null;
			this.endOfWait = null;

			if (options?.maxWaitTimeInMilliseconds) {
				this.failTimeoutID = window.setTimeout(() => {
					this.fail(new ConditionTimeoutError());
				}, options.maxWaitTimeInMilliseconds);
			}

			this.isWaiting = true;
			this.startOfWait = new Date();

			const checkFunction = () => {
				if (this.condition.getIsTrue() === shouldBe) {
					if (!this.resolveFunction) {
						throw new Error("The resolve function is not available anymore.");
					}
					this.resolveFunction(shouldBe);
					this.stopWaitForCondition();
					return;
				}
			};
			this.lookupIntervalID = window.setInterval(() => {
				checkFunction();
			}, options?.lookupInterval ?? this.DEFAULT_LOOKUP_INTERVAL);
			checkFunction();
		});
	}

	stopWaitForCondition() {
		this.isWaiting = false;
		this.endOfWait = new Date();
		if (this.lookupIntervalID) window.clearInterval(this.lookupIntervalID);
		if (this.failTimeoutID) window.clearTimeout(this.failTimeoutID);
		this.resolveFunction = null;
		this.rejectFunction = null;
	}

	fail(reason: any) {
		if (!this.rejectFunction) {
			throw new Error("The reject function is not set.");
		}
		this.rejectFunction(reason);
		this.stopWaitForCondition();
	}
}

export type FunctionWaiterOptions = {
	maxWaitTimeInMilliseconds?: number;
	lookupInterval?: number;
};

export class FunctionWaiter<T> {
	readonly DEFAULT_LOOKUP_INTERVAL = 100;
	// eslint-disable-next-line @typescript-eslint/ban-types
	function: Function;
	endOfWait: Date | null;
	startOfWait: Date | null;
	lookupIntervalID: number | null;
	failTimeoutID: number | null;
	resolveFunction?: ((value: T | PromiseLike<T>) => void) | null;
	rejectFunction?: ((reason?: any) => void) | null;
	isWaiting: boolean;

	// eslint-disable-next-line @typescript-eslint/ban-types
	constructor(waitForFunction: Function) {
		this.function = waitForFunction;
		this.endOfWait = null;
		this.startOfWait = null;
		this.lookupIntervalID = null;
		this.failTimeoutID = null;
		this.isWaiting = false;
	}

	waitForFunctionToReturnValue(
		shouldBe: T,
		options?: FunctionWaiterOptions
	): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			this.resolveFunction = resolve;
			this.rejectFunction = reject;

			this.startOfWait = null;
			this.endOfWait = null;

			if (options?.maxWaitTimeInMilliseconds) {
				this.failTimeoutID = window.setTimeout(() => {
					this.fail(
						new Error("Waiting for the function to return a value timed out.")
					);
				}, options.maxWaitTimeInMilliseconds);
			}

			this.isWaiting = true;
			this.startOfWait = new Date();

			const checkFunction = async () => {
				if (typeof this.function !== "function") {
					this.fail("Cannot check the function because it is not a function.");
				}
				try {
					let returnValue = await this.function();
					if (returnValue === shouldBe) {
						if (!this.resolveFunction) {
							throw new Error("The resolve function is not available anymore.");
						}
						this.resolveFunction(returnValue);
						this.stopWaitForFunction();
						return;
					}
				} catch (error) {}
			};
			this.lookupIntervalID = window.setInterval(() => {
				checkFunction();
			}, options?.lookupInterval ?? this.DEFAULT_LOOKUP_INTERVAL);
			checkFunction();
		});
	}

	stopWaitForFunction() {
		this.isWaiting = false;
		this.endOfWait = new Date();
		if (this.lookupIntervalID) window.clearInterval(this.lookupIntervalID);
		if (this.failTimeoutID) window.clearTimeout(this.failTimeoutID);
		this.resolveFunction = null;
		this.rejectFunction = null;
	}

	fail(reason: any) {
		if (!this.rejectFunction) {
			throw new Error("The reject function is not set.");
		}
		this.rejectFunction(reason);
		this.stopWaitForFunction();
	}
}

export class Condition {
	private name: string;

	private isTrue: boolean;
	constructor(options: { name: string }) {
		this.name = "";
		this.isTrue = false;

		this.setName(options.name);
	}

	setName(name: string) {
		this.name = name;
	}

	getName(): string {
		return this.name;
	}

	setIsTrue(isTrue: boolean) {
		this.isTrue = isTrue;
	}

	getIsTrue(): boolean {
		return this.isTrue;
	}
}
