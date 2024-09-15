import Block from "../blocks/Block";

export default class Chunk {
	cancelRender = false;
	position: ChunkPosition;
	wasRendered = false;
	isRendering = false;
	blocks: Array<Array<Array<Array<Block | null>>>>; //x, z, y, zindex
	minY: number;
	maxY: number;
	maxZIndex: number;
	chunkSize: number;
	constructor(options: {
		minY: number;
		maxY: number;
		maxZIndex: number;
		chunkSize: number;
		position: ChunkPosition;
	}) {
		this.position = options.position;
		this.minY = options.minY;
		this.maxY = options.maxY;
		this.maxZIndex = options.maxZIndex;
		this.chunkSize = options.chunkSize;

		this.blocks = new Array(options.chunkSize);

		for (let x = 0; x < options.chunkSize; x++) {
			this.blocks[x] = new Array(options.chunkSize);
			for (let z = 0; z < options.chunkSize; z++) {
				this.blocks[x][z] = new Array(this.getHeight());
				for (
					let y = this.getLowestYInternal();
					y <= this.getHightestYInternal();
					y++
				) {
					this.blocks[x][z][y] = new Array(this.maxZIndex + 1);
					for (let zIndex = 0; zIndex < options.maxZIndex; zIndex++) {
						this.blocks[x][z][y][zIndex] = null;
					}
				}
			}
		}
	}

	getHeight(): number {
		return this.maxY - this.minY;
	}

	getLowestYInternal() {
		return 0;
	}

	getHightestYInternal() {
		return this.getLowestYInternal() + this.getHeight() - 1;
	}

	addBlockToChunk(
		xInternal: number,
		zInternal: number,
		yInternal: number,
		zIndex: number,
		block: Block
	) {
		this.blocks[xInternal][zInternal][yInternal][zIndex] = block;
	}

	removeBlockFromChunk(
		xInternal: number,
		zInternal: number,
		yInternal: number,
		zIndex: number
	) {
		this.blocks[xInternal][zInternal][yInternal][zIndex] = null;
	}

	addBlockToChunkFromRealWorldCoordinates(
		x: number,
		z: number,
		y: number,
		zIndex: number,
		block: Block
	) {
		let { xInternal, zInternal, yInternal } =
			this.getInternalCoordinatesFromRealWorldCoordinates(x, z, y);
		this.addBlockToChunk(xInternal, zInternal, yInternal, zIndex, block);
	}

	removeBlockFromChunkFromRealWorldCoordinates(
		x: number,
		z: number,
		y: number,
		zIndex: number
	) {
		let { xInternal, zInternal, yInternal } =
			this.getInternalCoordinatesFromRealWorldCoordinates(x, z, y);
		this.removeBlockFromChunk(xInternal, zInternal, yInternal, zIndex);
	}

	getInternalCoordinatesFromRealWorldCoordinates(
		x: number,
		z: number,
		y: number
	) {
		let xInternal = x - this.position.x * this.chunkSize;
		let zInternal = z - this.position.z * this.chunkSize;
		let yInternal = y - this.minY;
		return {
			xInternal,
			zInternal,
			yInternal,
		};
	}

	getBlockFromInternalCoordinates(
		xInternal: number,
		zInternal: number,
		yInternal: number,
		zIndex: number
	): Block | null {
		let block = this.blocks[xInternal]?.[zInternal]?.[yInternal]?.[zIndex];
		if (!block) return null;
		return block;
	}

	getAllBlocksFromInternalCoordinates(
		xInternal: number,
		zInternal: number,
		yInternal: number
	): Array<Block | null> {
		let blocks = this.blocks[xInternal][zInternal][yInternal];
		return blocks;
	}

	getBlockFromRealWorldCoordinates(
		x: number,
		z: number,
		y: number,
		zIndex: number
	) {
		let { xInternal, zInternal, yInternal } =
			this.getInternalCoordinatesFromRealWorldCoordinates(x, z, y);

		return this.getBlockFromInternalCoordinates(
			xInternal,
			zInternal,
			yInternal,
			zIndex
		);
	}

	getAllBlocksFromRealWorldCoordinates(
		x: number,
		z: number,
		y: number
	): Array<Block | null> {
		let { xInternal, zInternal, yInternal } =
			this.getInternalCoordinatesFromRealWorldCoordinates(x, z, y);

		return this.getAllBlocksFromInternalCoordinates(
			xInternal,
			zInternal,
			yInternal
		);
	}

	hide() {
		for (let x = 0; x < this.chunkSize; x++) {
			this.blocks[x] = new Array(this.chunkSize);
			for (let z = 0; z < this.chunkSize; z++) {
				this.blocks[x][z] = new Array(this.getHeight());
				for (
					let y = this.getLowestYInternal();
					y <= this.getHightestYInternal();
					y++
				) {
					for (let zIndex = 0; zIndex < this.maxZIndex + 1; z++) {
						let block = this.blocks[x][z][y][zIndex];
						if (!block) continue;
						if (!block.babylonMesh) continue;
						block.babylonMesh.isVisible = false;
					}
				}
			}
		}
	}

	show() {
		for (let x = 0; x < this.chunkSize; x++) {
			this.blocks[x] = new Array(this.chunkSize);
			for (let z = 0; z < this.chunkSize; z++) {
				this.blocks[x][z] = new Array(this.getHeight());
				for (
					let y = this.getLowestYInternal();
					y <= this.getHightestYInternal();
					y++
				) {
					for (let zIndex = 0; zIndex < this.maxZIndex + 1; z++) {
						let block = this.blocks[x][z][y][zIndex];
						if (!block) continue;
						if (!block.babylonMesh) continue;
						block.babylonMesh.isVisible = true;
					}
				}
			}
		}
	}
}

export type ChunkPosition = {
	x: number;
	z: number;
};
