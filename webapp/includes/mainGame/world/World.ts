import * as BABYLON from "@babylonjs/core";
import { Minecraft } from "../../Minecraft";
import { WorldEntry } from "../../controller/WorldContoller";
import GlobalOptions from "../../settings/GlobalOptions";
import Chunk, { ChunkPosition } from "./chunk/Chunk";

import {
	IDBBlock,
	IDBBlockIndex,
	IDBBlock_io_ts_type,
	IDBTransactionWriteType,
} from "./blocks/IDBBlock";
import { validate } from "../../helperFunctions/io-ts-functions";
import { BlockTypes } from "./blocks/BlockTypes";
import { Grass_Block } from "./blocks/Grass_Block";
import Block from "./blocks/Block";
import MainGame from "../MainGame";
import BlockRequester from "./blocks/BlockRequester";
import { FunctionWaiter } from "../../ConditionWaiter";
import { IndexedDBAccessMode } from "../../controller/indexedDBController/IndexedDBHelper";
import BlockPosition from "./blocks/BlockPosition";
import { CobbleStone_Block } from "./blocks/CobbleStone_Block";

export type SetBlocksInDB = Array<SetBlockInDB>;

export type SetBlockInDB = {
	blockPosition: BlockPosition;
	transaction: IDBTransactionWriteType;
	value?: IDBBlock;
};

export default class World {
	readonly DEBGUG = true;
	chunkMemory: Array<Array<Chunk | null>>;
	mainProgram: Minecraft;
	mainGame: MainGame;
	readonly minY: number;
	readonly maxY: number;
	readonly maxZIndex: number;
	readonly chunkSize: number;
	readonly worldEntry: WorldEntry;
	readonly worldDatabaseName: string;
	indexedDBDatabases: {
		world?: IDBDatabase;
	};

	blockRequester: BlockRequester;
	constructor(options: {
		mainProgram: Minecraft;
		mainGame: MainGame;
		minY: number;
		maxY: number;
		maxZIndex: number;
		chunkSize: number;
		worldEntry: WorldEntry;
	}) {
		this.worldEntry = options.worldEntry;
		this.mainGame = options.mainGame;
		this.mainProgram = options.mainProgram;
		this.blockRequester = new BlockRequester({
			ressourcePackController: this.mainProgram.ressourcePackController,
			scene: this.mainGame.scene,
		});

		this.minY = options.minY;
		this.maxY = options.maxY;
		this.maxZIndex = options.maxZIndex;
		this.chunkSize = options.chunkSize;

		this.indexedDBDatabases = {};
		this.worldDatabaseName =
			this.mainProgram.worldController.getWorldDBNameByInternalName(
				this.worldEntry.internalName
			);
		//Fill Chunk Memory
		//Create x-axis
		this.chunkMemory = new Array(this.getLengthOfOneChunkAxis());
		//Create z-axis
		for (let x = 0; x < this.chunkMemory.length; x++) {
			this.chunkMemory[x] = new Array(this.getLengthOfOneChunkAxis());
			for (let z = 0; z < this.chunkMemory[x].length; z++) {
				this.chunkMemory[x][z] = null;
			}
		}
	}

	async init() {
		await this.openDatabase(DBs.WORLD_DB);
	}

	async quit() {
		await this.closeDatabase(DBs.WORLD_DB);
	}

	getLengthOfOneChunkAxis() {
		return this.mainProgram.settings.videoSettings.renderDistance * 2 - 1;
	}

	getChunkXZFromGlobalCoordinates(
		globalX: number,
		globalZ: number
	): ChunkPosition {
		let chunkX = Math.floor(globalX / this.chunkSize);
		let chunkZ = Math.floor(globalZ / this.chunkSize);

		return { x: chunkX, z: chunkZ } satisfies ChunkPosition;
	}

	getArrayNegativeOffset() {
		return (this.getLengthOfOneChunkAxis() - 1) / 2;
	}

	/**
	* 
	* Makes it possible to select a chunk with the coordinates x=-2, z=-2 which is representet as 0, 0 with the
	render distance of 3 
	*/
	async loadChunksPlayerIsInRange(globalX: number, globalZ: number) {
		let arrayNegativeOffset = this.getArrayNegativeOffset();

		//Real Chunk in the world
		let realWorldChunksToBeRendered = new Array<Array<Chunk>>(
			this.getLengthOfOneChunkAxis()
		);
		for (let x = 0; x < this.getLengthOfOneChunkAxis(); x++) {
			realWorldChunksToBeRendered[x] = new Array<Chunk>(
				this.getLengthOfOneChunkAxis()
			);
			for (let z = 0; z < this.getLengthOfOneChunkAxis(); z++) {}
		}

		//Get center chunk of the player
		let centerChunkCooridnates = this.getChunkXZFromGlobalCoordinates(
			globalX,
			globalZ
		);
		if (this.DEBGUG)
			console.debug("ChunkRenderer: center chunk", centerChunkCooridnates);

		let newChunksNumber = 0;
		//Calculate which chunks are in the range
		for (let x = -arrayNegativeOffset; x <= arrayNegativeOffset; x++) {
			for (let z = -arrayNegativeOffset; z <= arrayNegativeOffset; z++) {
				realWorldChunksToBeRendered[x + arrayNegativeOffset][
					z + arrayNegativeOffset
				];

				let chunk: Chunk | null = null;

				let existingChunkIndexes = this.getChunkCachePositionFromRealChunkXZ({
					x: centerChunkCooridnates.x + x,
					z: centerChunkCooridnates.z + z,
				});
				if (existingChunkIndexes != null) {
					chunk =
						this.chunkMemory[existingChunkIndexes.x][existingChunkIndexes.z];
				}

				if (!chunk) {
					chunk = new Chunk({
						chunkSize: this.chunkSize,
						maxY: this.maxY,
						minY: this.minY,
						maxZIndex: this.maxZIndex,
						position: {
							x: centerChunkCooridnates.x + x,
							z: centerChunkCooridnates.z + z,
						},
					});
					newChunksNumber++;
				}

				realWorldChunksToBeRendered[x + arrayNegativeOffset][
					z + arrayNegativeOffset
				] = chunk;
			}
		}

		if (this.DEBGUG)
			console.debug(
				`ChunkRenderer: New Chunks: ${newChunksNumber} | Cached Chunks: ${
					this.getMaxNumberOfChunksInMemory() - newChunksNumber
				}`
			);

		let chunksToUnload = new Array<Chunk>();

		for (let x = 0; x < this.chunkMemory.length; x++) {
			for (let z = 0; z < this.chunkMemory[x].length; z++) {
				let chunkToCheck = this.chunkMemory[x][z];
				if (!chunkToCheck) continue;
				let chunkIsNeeded = realWorldChunksToBeRendered.some((xRow) => {
					if (!chunkToCheck) return;
					let found = xRow.some((currentChunk) => {
						if (!chunkToCheck) return false;
						if (
							chunkToCheck.position.x === currentChunk.position.x &&
							chunkToCheck.position.z === currentChunk.position.z
						) {
							return true;
						}
						return false;
					});
					return found;
				});
				if (chunkIsNeeded === false) {
					chunksToUnload.push(chunkToCheck);
				}
			}
		}

		console.log("Number of chunks to unload:" + chunksToUnload.length);
		this.rewriteChunkMemory(realWorldChunksToBeRendered);
		for (const chunkToUnload of chunksToUnload) {
			await this.unloadChunk(chunkToUnload);
		}
		await this.renderChunksSpiralWithBatching(2);
	}

	unloadChunk(chunk: Chunk): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			if (!this.indexedDBDatabases.world) {
				await this.openDatabase(DBs.WORLD_DB);
			}
			if (!this.indexedDBDatabases.world) {
				throw new Error("Could not open all neccessary dbs");
			}

			if (chunk.isRendering) {
				//Abort rendering
				let functionWaiter = new FunctionWaiter<boolean>(() => {
					return chunk.isRendering;
				});
				chunk.cancelRender = true;
				await functionWaiter.waitForFunctionToReturnValue(false, {
					lookupInterval: 10,
				});
			}

			let blocksToSaveInDB: SetBlocksInDB = [];

			for (let x = 0; x < chunk.chunkSize; x++) {
				for (let z = 0; z < chunk.chunkSize; z++) {
					loop3: for (
						let y = chunk.getLowestYInternal();
						y <= chunk.getHightestYInternal();
						y++
					) {
						for (let zIndex = 0; zIndex < chunk.maxZIndex + 1; zIndex++) {
							let block = chunk.getBlockFromInternalCoordinates(
								x,
								z,
								y,
								zIndex
							);
							if (!block) {
								//Remove block in db
								blocksToSaveInDB.push({
									blockPosition: {
										x: x,
										y: y,
										z: z,
										zIndex: 0,
									},
									transaction: IDBTransactionWriteType.DELETE,
								});
								continue loop3;
							}
							if (block.babylonMesh) {
								block.babylonMesh.dispose();
								this.mainGame.scene.removeMesh(block.babylonMesh);
							}

							blocksToSaveInDB.push({
								blockPosition: {
									x: x,
									y: y,
									z: z,
									zIndex: 0,
								},
								transaction: IDBTransactionWriteType.UPDATE,
								value: {
									orientation: block.orientation.getOrientationInt(),
									type: block.blockType,
									x: block.position.x,
									y: block.position.y,
									z: block.position.z,
									zindex: block.position.zIndex,
								},
							});

							chunk.removeBlockFromChunk(x, z, y, zIndex);
						}
					}
				}
			}

			resolve();
		});
	}

	async renderChunks(): Promise<void> {
		let arrayNegativeOffset = this.getArrayNegativeOffset();
		loop1: for (let x = -arrayNegativeOffset; x <= arrayNegativeOffset; x++) {
			loop2: for (let z = -arrayNegativeOffset; z <= arrayNegativeOffset; z++) {
				let currentChunk =
					this.chunkMemory[x + arrayNegativeOffset][z + arrayNegativeOffset];
				if (!currentChunk) {
					console.warn(
						`There is no chunk with the index [${x + arrayNegativeOffset}][${
							z + arrayNegativeOffset
						}]`
					);
					continue loop2;
				}
				if (!currentChunk.wasRendered && !currentChunk.isRendering)
					await this.renderChunk(currentChunk);
				currentChunk.show();
			}
		}
	}

	// async renderChunksSpiral(): Promise<void> {
	// 	const arrayNegativeOffset = this.getArrayNegativeOffset();
	// 	const maxChunkDistance = arrayNegativeOffset * 2;

	// 	// Helper function to check if the given chunk coordinates are within bounds
	// 	const isChunkWithinBounds = (x: number, z: number): boolean => {
	// 		return (
	// 			x >= 0 &&
	// 			x < arrayNegativeOffset * 2 &&
	// 			z >= 0 &&
	// 			z < arrayNegativeOffset * 2
	// 		);
	// 	};

	// 	let renderingChunks: Array<Promise<void>> = [];

	// 	for (let dist = 0; dist <= maxChunkDistance; dist++) {
	// 		const xStart = arrayNegativeOffset - dist;
	// 		const xEnd = arrayNegativeOffset + dist;

	// 		for (let x = xStart; x <= xEnd; x++) {
	// 			const z1 =
	// 				arrayNegativeOffset + dist - Math.abs(x - arrayNegativeOffset);
	// 			const z2 =
	// 				arrayNegativeOffset - dist + Math.abs(x - arrayNegativeOffset);

	// 			if (isChunkWithinBounds(x, z1)) {
	// 				const currentChunk = this.chunkMemory[x][z1];
	// 				if (!currentChunk) {
	// 					console.warn(`There is no chunk with the index [${x}][${z1}]`);
	// 				} else if (!currentChunk.wasRendered && !currentChunk.isRendering) {
	// 					renderingChunks.push(this.renderChunk(currentChunk));
	// 				}
	// 			}

	// 			if (isChunkWithinBounds(x, z2) && z2 !== z1) {
	// 				const currentChunk = this.chunkMemory[x][z2];
	// 				if (!currentChunk) {
	// 					console.warn(`There is no chunk with the index [${x}][${z2}]`);
	// 				} else if (!currentChunk.wasRendered && !currentChunk.isRendering) {
	// 					renderingChunks.push(this.renderChunk(currentChunk));
	// 				}
	// 			}
	// 		}
	// 	}

	// 	await Promise.all(renderingChunks);
	// 	return;
	// }

	async renderChunksSpiralWithBatching(
		maxNumberOfChunksRenderingSimultaneously: number
	): Promise<void> {
		const arrayNegativeOffset = this.getArrayNegativeOffset();
		const maxChunkDistance = arrayNegativeOffset * 2;

		const isChunkWithinBounds = (x: number, z: number): boolean => {
			return (
				x >= 0 &&
				x < arrayNegativeOffset * 2 &&
				z >= 0 &&
				z < arrayNegativeOffset * 2
			);
		};

		let renderingChunks: Array<Promise<void>> = [];
		let batch: Promise<void>[] = [];

		for (let dist = 0; dist <= maxChunkDistance; dist++) {
			const xStart = arrayNegativeOffset - dist;
			const xEnd = arrayNegativeOffset + dist;

			for (let x = xStart; x <= xEnd; x++) {
				const z1 =
					arrayNegativeOffset + dist - Math.abs(x - arrayNegativeOffset);
				const z2 =
					arrayNegativeOffset - dist + Math.abs(x - arrayNegativeOffset);

				if (isChunkWithinBounds(x, z1)) {
					const currentChunk = this.chunkMemory[x][z1];
					if (!currentChunk) {
						console.warn(`There is no chunk with the index [${x}][${z1}]`);
					} else if (!currentChunk.wasRendered && !currentChunk.isRendering) {
						batch.push(this.renderChunk(currentChunk));

						if (batch.length >= maxNumberOfChunksRenderingSimultaneously) {
							let renderedChunks = await Promise.all(batch);
							renderedChunks.push(...renderedChunks);
							batch = [];
						}
					}
				}

				if (isChunkWithinBounds(x, z2) && z2 !== z1) {
					const currentChunk = this.chunkMemory[x][z2];
					if (!currentChunk) {
						console.warn(`There is no chunk with the index [${x}][${z2}]`);
					} else if (!currentChunk.wasRendered && !currentChunk.isRendering) {
						batch.push(this.renderChunk(currentChunk));

						if (batch.length >= maxNumberOfChunksRenderingSimultaneously) {
							if (batch.length >= maxNumberOfChunksRenderingSimultaneously) {
								let renderedChunks = await Promise.all(batch);
								renderedChunks.push(...renderedChunks);
								batch = [];
							}
						}
					}
				}
			}
		}

		// Render any remaining chunks in the last batch
		if (batch.length > 0) {
			renderingChunks.push(...batch);
		}

		// Wait for all batched rendering to finish
		await Promise.all(renderingChunks);

		return;
	}

	async renderChunksWithBatching(): Promise<void> {
		const arrayNegativeOffset = this.getArrayNegativeOffset();
		const batchSize = 3; // Adjust the batch size as needed

		const chunksToRender: Chunk[] = [];
		for (let x = -arrayNegativeOffset; x <= arrayNegativeOffset; x++) {
			for (let z = -arrayNegativeOffset; z <= arrayNegativeOffset; z++) {
				const currentChunk =
					this.chunkMemory[x + arrayNegativeOffset][z + arrayNegativeOffset];
				if (!currentChunk) {
					console.warn(
						`There is no chunk with the index [${x + arrayNegativeOffset}][${
							z + arrayNegativeOffset
						}]`
					);
				} else if (!currentChunk.wasRendered && !currentChunk.isRendering) {
					chunksToRender.push(currentChunk);
				}
			}
		}

		const totalBatches = Math.ceil(chunksToRender.length / batchSize);
		for (let i = 0; i < totalBatches; i++) {
			const startIdx = i * batchSize;
			const endIdx = Math.min(startIdx + batchSize, chunksToRender.length);
			const batch = chunksToRender.slice(startIdx, endIdx);

			// Process the current batch
			await Promise.all(batch.map((chunk) => this.renderChunk(chunk)));

			// Add a delay (e.g., 100ms) between batches to prevent overloading
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	}

	async setBlocksInDB(blocks: SetBlocksInDB) {
		if (!this.indexedDBDatabases.world) {
			this.openDatabase(DBs.WORLD_DB);
		}
		if (!this.indexedDBDatabases.world) {
			throw new Error("Could not open all necessary dbs.");
		}

		const db = this.indexedDBDatabases.world;
		const BLOCK_DATA_OBJECT_STORE_NAME =
			GlobalOptions.options.indexedDBDatabases.worldDB.objectStores.block_data
				.name;

		const transaction = db.transaction(
			BLOCK_DATA_OBJECT_STORE_NAME,
			IndexedDBAccessMode.READ_WRITE
		);

		const objectStore = transaction.objectStore(BLOCK_DATA_OBJECT_STORE_NAME);

		let promises = blocks.map((block) => {
			return new Promise<void>((resolve, reject) => {
				if (
					block.transaction === IDBTransactionWriteType.UPDATE ||
					block.transaction === IDBTransactionWriteType.INSERT
				) {
					let idbBlock = block.value;
					if (!idbBlock) {
						throw new Error("No block given to update");
					}
					let key = [idbBlock.x, idbBlock.y, idbBlock.z, idbBlock.zindex];
					let getRequest = objectStore.get(key);
					getRequest.onsuccess = (event) => {
						let existingValue = (event.target as IDBRequest).result;

						if (existingValue !== undefined) {
							// Update the existing value with the new value
							let updateRequest = objectStore.put(idbBlock, key);

							updateRequest.onsuccess = (event) => {
								resolve();
							};

							updateRequest.onerror = (event) => {
								reject(event);
							};
						} else {
							let insertRequest = objectStore.add(idbBlock, key);
							insertRequest.onsuccess = (event) => {
								resolve();
							};

							insertRequest.onerror = (event) => {
								reject(event);
							};
						}
					};
				} else if (block.transaction === IDBTransactionWriteType.DELETE) {
					let deleteRequest = objectStore.delete(
						Block.blockPositionToIndexedDBIndex(block.blockPosition)
					);
					deleteRequest.onsuccess = (event) => {
						resolve();
					};

					deleteRequest.onerror = (event) => {
						reject(event);
					};
				}
			});
		});

		await Promise.all(promises);
	}

	async removeBlockInDB() {}

	isBlockEntry(block: unknown): block is IDBBlock {
		return validate(block, IDBBlock_io_ts_type);
	}

	renderChunk(chunk: Chunk): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			if (!this.indexedDBDatabases.world) {
				this.openDatabase(DBs.WORLD_DB);
			}
			if (!this.indexedDBDatabases.world) {
				throw new Error("Could not open all necessary dbs.");
			}

			chunk.isRendering = true;
			//Load from saves file
			let minx = chunk.position.x * this.chunkSize;
			let maxx = minx + (this.chunkSize - 1);

			let minz = chunk.position.z * this.chunkSize;
			let maxz = minz + (this.chunkSize - 1);

			let miny = this.minY;
			let maxy = this.maxY;

			let idbBlocks = await this.getBlocksFromDB({
				start: {
					x: minx,
					y: miny,
					z: minz,
					zIndex: 0,
				},
				end: {
					x: maxx,
					y: maxy,
					z: maxz,
					zIndex: 0,
				},
			});

			for (const idbBlock of idbBlocks) {
				if (idbBlock == null) continue;
				let block = await this.setBlockAtCoordinate(
					idbBlock.x,
					idbBlock.y,
					idbBlock.z,
					idbBlock.zindex,
					idbBlock.type,
					chunk
				);
				if (!block) {
					throw new Error("Block could not be set");
				}
			}

			chunk.wasRendered = true;
			chunk.isRendering = false;
			resolve();
		});
	}

	async getBlocksFromDB(range: { start: BlockPosition; end: BlockPosition }) {
		if (!this.indexedDBDatabases.world) {
			this.openDatabase(DBs.WORLD_DB);
		}
		if (!this.indexedDBDatabases.world) {
			throw new Error("Could not open all necessary dbs.");
		}

		const db = this.indexedDBDatabases.world;
		const BLOCK_DATA_OBJECT_STORE_NAME =
			GlobalOptions.options.indexedDBDatabases.worldDB.objectStores.block_data
				.name;

		const transaction = db.transaction(
			BLOCK_DATA_OBJECT_STORE_NAME,
			IndexedDBAccessMode.READ
		);

		const objectStore = transaction.objectStore(BLOCK_DATA_OBJECT_STORE_NAME);

		const blockKeyRange = [];

		for (let currentX = range.start.x; currentX <= range.end.x; currentX++) {
			for (let currentY = range.start.y; currentY <= range.end.y; currentY++) {
				for (
					let currentZ = range.start.z;
					currentZ <= range.end.z;
					currentZ++
				) {
					for (
						let currentZIndex = range.start.zIndex;
						currentZIndex <= range.end.zIndex;
						currentZIndex++
					) {
						blockKeyRange.push([currentX, currentY, currentZ, currentZIndex]);
					}
				}
			}
		}

		const dbBlocks = await Promise.all(
			blockKeyRange.map((currentBlockLocation) => {
				return new Promise<IDBBlock | null>((resolve, reject) => {
					const dbRequest = objectStore.get(currentBlockLocation);
					dbRequest.onsuccess = (event) => {
						const result = (event.target as IDBRequest).result;
						if (this.isBlockEntry(result)) {
							resolve(result);
						} else {
							resolve(null);
						}
					};
					dbRequest.onerror = () => {
						reject(new Error("Database request error."));
					};
				});
			})
		);

		return dbBlocks;
	}

	static getFaceUVCoordinates(options: {
		row: number;
		col: number;
		resolutionX: number;
		resolutionY: number;
		totalRows: number;
		totalCols: number;
	}) {
		let width = options.totalCols * options.resolutionX;
		let height = options.totalRows * options.resolutionY;
		return {
			xStart: (options.resolutionX * options.col) / width,
			yStart: (options.resolutionY * options.row) / height,
			xEnd: (options.resolutionX * (options.col + 1)) / width,
			yEnd: (options.resolutionY * (options.row + 1)) / height,
		};
	}

	static getFaceUVCoordinatesArray(options: {
		row: number;
		col: number;
		resolutionX: number;
		resolutionY: number;
		totalRows: number;
		totalCols: number;
	}) {
		let faceUV = World.getFaceUVCoordinates(options);

		return [faceUV.xStart, faceUV.yStart, faceUV.xEnd, faceUV.yEnd];
	}

	async setBlockAtCoordinate(
		x: number,
		y: number,
		z: number,
		zIndex: number,
		blockType: BlockTypes,
		chunk: Chunk
	): Promise<Block | null> {
		let block: Block | null;

		switch (blockType) {
			case BlockTypes.GRASS_BLOCK:
				block = new Grass_Block();
				break;
			case BlockTypes.COBBLESTONE_BLOCK:
				block = new CobbleStone_Block();
				break;
			default:
				block = null;
				break;
		}

		if (block === null) {
			console.error(
				`The type of the block could not be determined. Type: '${blockType}'`
			);
			return null;
		}

		let instancedBlock = await this.blockRequester.getBlock(block);
		block.babylonMesh = instancedBlock;

		if (chunk) {
			chunk.addBlockToChunkFromRealWorldCoordinates(x, z, y, zIndex, block);
		} else {
			let getChunk = this.getChunkWithChunkXY(x, z);
			if (getChunk) {
				chunk = getChunk;
				chunk.addBlockToChunkFromRealWorldCoordinates(x, z, y, zIndex, block);
			}
		}

		instancedBlock.isVisible = true;
		instancedBlock.position.x = x;
		instancedBlock.position.y = y;
		instancedBlock.position.z = z;

		return block;
	}

	getChunkWithChunkXY(x: number, y: number): Chunk | null {
		let chunkPosition = this.getChunkXZFromGlobalCoordinates(x, y);
		let found = null;

		outer: for (let x = 0; x < this.chunkMemory.length; x++) {
			this.chunkMemory[x] = new Array(this.getLengthOfOneChunkAxis());
			for (let z = 0; z < this.chunkMemory[x].length; z++) {
				let chunk = this.chunkMemory[x][z];
				if (
					chunk?.position.x == chunkPosition.x &&
					chunk?.position.z == chunkPosition.z
				) {
					found = chunk;
					break outer;
				}
			}
		}
		return found;
	}

	getMaxNumberOfChunksInMemory() {
		return Math.pow(this.getLengthOfOneChunkAxis(), 2);
	}

	rewriteChunkMemory(newMemory: Array<Array<Chunk | null>>) {
		for (let x = 0; x < this.chunkMemory.length; x++) {
			this.chunkMemory[x] = new Array(this.getLengthOfOneChunkAxis());
			for (let z = 0; z < this.chunkMemory[x].length; z++) {
				this.chunkMemory[x][z] = newMemory[x][z];
			}
		}
	}

	getChunkCachePositionFromRealChunkXZ(position: {
		x: number;
		z: number;
	}): { x: number; z: number } | null {
		for (let x = 0; x < this.chunkMemory.length; x++) {
			for (let z = 0; z < this.chunkMemory[x].length; z++) {
				let currentChunk = this.chunkMemory[x][z];
				if (currentChunk) {
					if (
						currentChunk.position.x === position.x &&
						currentChunk.position.z === position.z
					) {
						return {
							x: x,
							z: z,
						};
					}
				}
			}
		}
		return null;
	}

	async openDatabase(DB: DBs) {
		switch (DB) {
			case DBs.WORLD_DB:
				try {
					this.indexedDBDatabases.world =
						await this.mainProgram.indexedDBHelper.openDatabase(
							this.mainProgram.worldController.getWorldDBNameByInternalName(
								this.worldEntry.internalName
							),
							GlobalOptions.options.indexedDBDatabases.worldDB.DB_VERSION
						);

					console.log("world db:", this.indexedDBDatabases.world);
				} catch (error) {
					alert("Ein Fehler beim öffnen der Welt-Datenbank ist aufgetreten.");
				}
				break;
			default:
				throw new Error("DB not found.");
		}
	}

	async closeDatabase(DB: DBs) {
		switch (DB) {
			case DBs.WORLD_DB:
				this.indexedDBDatabases.world?.close();
				break;
			default:
				throw new Error("DB not found.");
		}
	}
}

export enum DBs {
	WORLD_DB,
}
