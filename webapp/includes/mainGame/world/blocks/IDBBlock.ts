import * as io_ts from "io-ts";

export const IDBBlock_io_ts_type = io_ts.type({
	x: io_ts.number,
	y: io_ts.number,
	z: io_ts.number,
	zindex: io_ts.number,
	type: io_ts.number,
	orientation: io_ts.union([io_ts.number, io_ts.undefined]),
});

export type IDBBlock = {
	x: number;
	y: number;
	z: number;
	zindex: number;
	type: number;
	orientation: number;
};

export type IDBBlockToDelete = {
	x: number;
	y: number;
	z: number;
	zindex: number;
};

/**
 * x
 * y
 * z
 * zindex
 */
export type IDBBlockIndex = Array<number>;

export enum IDBTransactionWriteType {
	INSERT,
	UPDATE,
	DELETE,
}
