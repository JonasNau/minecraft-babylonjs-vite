import Block from "./Block";
import { BlockSizeType } from "./BlockSizeType";
import { BlockTypes } from "./BlockTypes";

export class CobbleStone_Block extends Block {
	constructor() {
		super({
			identifier: "cobblestone_block",
			babylonName: "cobblestone_block",
			pathToTexture: "./",
			textureFileName: "cobblestone_block.jpg",
			walkOnSound: "cobblestone_block_walk.mp3",
			setSound: "cobblestone_block_set.mp3",
			destroyingSound: "cobblestone_block_destroy.mp3",
			destroyedSound: "cobblestone_block_destroyed.mp3",
			blockType: BlockTypes.COBBLESTONE_BLOCK,
			blockSizeType: BlockSizeType.FULL,
		});
	}
}
