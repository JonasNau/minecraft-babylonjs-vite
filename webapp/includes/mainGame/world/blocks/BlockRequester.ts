import * as BABYLON from "@babylonjs/core";
import Block from "./Block";
import RessourcePackController from "../../../controller/ressourcepack/RessourcePackController";
import NotImplementedError from "../../../errors/NotImplementedError";
import { BlockSizeType } from "./BlockSizeType";
import World from "../World";

export class CacheBlock {
	babylonMesh: BABYLON.Mesh;
	material: BABYLON.Material;
	texture: BABYLON.Texture;

	constructor(options: {
		babylonMesh: BABYLON.Mesh;
		material: BABYLON.Material;
		texture: BABYLON.Texture;
	}) {
		this.babylonMesh = options.babylonMesh;
		this.material = options.material;
		this.texture = options.texture;
	}
}

export default class BlockRequester {
	ressourcePackController: RessourcePackController;
	scene: BABYLON.Scene;
	cachedBlocks: { [identifier: string]: CacheBlock };

	constructor(options: {
		scene: BABYLON.Scene;
		ressourcePackController: RessourcePackController;
	}) {
		this.scene = options.scene;
		this.ressourcePackController = options.ressourcePackController;
		this.cachedBlocks = {};
	}

	async getBlock(block: Block): Promise<BABYLON.InstancedMesh> {
		let cachedBlock = this.cachedBlocks[block.identifier];

		if (cachedBlock) {
			let instancedMesh = cachedBlock.babylonMesh.createInstance(
				`block:${block.babylonName}-${block.position?.x}-${block.position?.y}-${block.position?.z}-${block.position?.zIndex}`
			);
			return instancedMesh;
		}

		if (block.blockSizeType == BlockSizeType.FULL) {
			const RESOLUTION_X = 16;
			const RESOLUTION_Y = 16;

			const ROWS = 3;
			const COLS = 4;

			let faceUVOptions = {
				totalRows: ROWS,
				totalCols: COLS,
				resolutionX: RESOLUTION_X,
				resolutionY: RESOLUTION_Y,
			};

			let faceUV = [
				new BABYLON.Vector4(
					...World.getFaceUVCoordinatesArray({
						col: 1,
						row: 1,
						...faceUVOptions,
					})
				), // front face
				new BABYLON.Vector4(
					...World.getFaceUVCoordinatesArray({
						col: 2,
						row: 1,
						...faceUVOptions,
					})
				), // right face
				new BABYLON.Vector4(
					...World.getFaceUVCoordinatesArray({
						col: 3,
						row: 1,
						...faceUVOptions,
					})
				), // back face
				new BABYLON.Vector4(
					...World.getFaceUVCoordinatesArray({
						col: 0,
						row: 1,
						...faceUVOptions,
					})
				), // left face
				new BABYLON.Vector4(
					...World.getFaceUVCoordinatesArray({
						col: 1,
						row: 2,
						...faceUVOptions,
					})
				), // top face
				new BABYLON.Vector4(
					...World.getFaceUVCoordinatesArray({
						col: 0,
						row: 0,
						...faceUVOptions,
					})
				), // bottom face
			];

			console.log(faceUV);

			let babylonBlock = BABYLON.MeshBuilder.CreateBox(
				block.babylonName,
				{ width: 1, height: 1, depth: 1, faceUV: faceUV, wrap: true },
				this.scene
			);

			babylonBlock.position = new BABYLON.Vector3(0, 0, 0);

			let material = new BABYLON.StandardMaterial(
				`material:${block.babylonName}`,
				this.scene
			);
			material.backFaceCulling = false;

			let ressourceURL =
				await this.ressourcePackController.getFullPathToRessource(
					block,
					block.textureFileName
				);
			let texture = new BABYLON.Texture(
				ressourceURL,
				this.scene,
				false,
				true,
				BABYLON.Constants.TEXTURE_NEAREST_SAMPLINGMODE
			);
			material.diffuseTexture = texture;

			this.cachedBlocks[block.identifier] = new CacheBlock({
				babylonMesh: babylonBlock,
				material: material,
				texture: texture,
			});

			babylonBlock.material = material;
		} else {
			throw new NotImplementedError("This block size is not implemented yet.");
		}

		return await this.getBlock(block);
	}
}
