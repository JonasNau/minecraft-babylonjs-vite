import { AbstractMesh } from "@babylonjs/core";
import BlockPosition from "./BlockPosition";
import { BlockSizeType } from "./BlockSizeType";
import { BlockTypes } from "./BlockTypes";
import Orientation from "../Orientation";

export type BlockConstructor = {
	identifier: string;
	blockSizeType: BlockSizeType;
	babylonName: string;
	textureFileName: string;
	pathToTexture: string;
	walkOnSound: string;
	setSound: string;
	destroyingSound: string;
	destroyedSound: string;
	blockType: BlockTypes;
	position?: BlockPosition;
	orientation?: Orientation;
};

export default class Block {
	public identifier: string;
	public blockSizeType: BlockSizeType;
	public babylonName: string;
	public textureFileName: string;
	public pathToTexture: string;
	public walkOnSound: string;
	public setSound: string;
	public destroyingSound: string;
	public destroyedSound: string;
	public blockType: BlockTypes;
	public position: BlockPosition;
	public orientation: Orientation;
	public babylonMesh?: AbstractMesh;

	constructor(options: BlockConstructor) {
		this.identifier = options.identifier;
		this.blockSizeType = options.blockSizeType;
		this.babylonName = options.babylonName;
		this.textureFileName = options.textureFileName;
		this.pathToTexture = options.pathToTexture;
		this.walkOnSound = options.walkOnSound;
		this.setSound = options.setSound;
		this.destroyingSound = options.destroyingSound;
		this.destroyedSound = options.destroyedSound;
		this.blockType = options.blockType;
		this.position = options.position ?? new BlockPosition(0, 0, 0, 0);
		this.orientation = options.orientation ?? new Orientation(0);
	}

	setPosition(position: BlockPosition) {
		this.position = position;
	}

	walkOnIt(block: Block): void {
		throw new Error(
			`${this.walkOnIt.name} is not implementet yet. Should play sound: ${block.walkOnSound}`
		);
	}

	destroyingIt(block: Block): void {
		throw new Error(
			`${this.walkOnIt.name} is not implementet yet. Should play sound: ${block.destroyedSound}`
		);
	}

	static blockPositionToIndexedDBIndex(blockPosition: BlockPosition) {
		return [
			blockPosition.x,
			blockPosition.y,
			blockPosition.z,
			blockPosition.zIndex,
		];
	}

	setOrientation(orientation: Orientation) {
		this.orientation = orientation;
	}
}
