import * as io_ts from "io-ts";
import { isLeft } from "fp-ts/Either";

export function validate<T>(value: unknown, type: io_ts.Type<T>): value is T {
	const result = type.decode(value);
	return isLeft(result) ? false : true;
}
