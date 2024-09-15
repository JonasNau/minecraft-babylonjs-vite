import Block from "./Block";
import { BlockSizeType } from "./BlockSizeType";
import { BlockTypes } from "./BlockTypes";

export class Grass_Block extends Block {
	constructor() {
		super({
			identifier: "grass_block",
			babylonName: "grass_block",
			pathToTexture: "./",
			textureFileName: "block_full.png",
			walkOnSound: "grass_block_walk.mp3",
			setSound: "grass_block_set.mp3",
			destroyingSound: "grass_block_destroy.mp3",
			destroyedSound: "grass_block_destroyed.mp3",
			blockType: BlockTypes.GRASS_BLOCK,
			blockSizeType: BlockSizeType.FULL,
		});
	}
}
