import Settings from "../../settings/Settings";

import { getPathToAssetsFolder } from "../../helperFunctions/asset-functions";

import SoundInstance from "../sound-controller/sound/SoundInstance";
import RessourceNotFoundError from "../../errors/ressourcePackController/input-controller/keySequence/RessourceNotFoundError";
import NotImplementedError from "../../errors/NotImplementedError";
import Block from "../../mainGame/world/blocks/Block";

export type Ressource = SoundInstance | Block;

export default class RessourcePackController {
	settings: Settings;
	pathToRessourcePacks: string;

	constructor(pathToRessourcePacks: string, settings: Settings) {
		this.pathToRessourcePacks = pathToRessourcePacks;
		this.settings = settings;
	}

	getPathToRessourcePacksRootFolder(): string {
		return `${getPathToAssetsFolder()}/${this.pathToRessourcePacks}`;
	}

	getRootPathToRessourceType(ressource: Ressource): string {
		if (ressource instanceof SoundInstance) {
			return `sounds`;
		} else if (ressource instanceof Block) {
			return `texture/blocks`;
		}
		return "ressource/type/not/found";
	}

	async getFirstRessourcePackThatHasRessource(
		ressource: Ressource,
		filename: string
	): Promise<string | null> {
		let foundRessourcePack: false | string = false;
		for (const currentRessourcePack of this.settings.ressourcePackSettings
			.active) {
			let result = await this.ressourcePackHasRessource(
				currentRessourcePack,
				ressource,
				filename
			);
			if (result === true) {
				foundRessourcePack = currentRessourcePack;
				break;
			}
		}

		if (foundRessourcePack === false) {
			throw new RessourceNotFoundError(
				`The ressource from type '${ressource}' does not exist. The file '${filename}' could not be found in any active ressource packs`
			);
		}
		return foundRessourcePack;
	}

	async getFirstRessourcePackThatHasFile(
		filePath: string
	): Promise<string | null> {
		let foundRessourcePack: false | string = false;
		for (const currentRessourcePack of this.settings.ressourcePackSettings
			.active) {
			let result = await this.ressourcePackHasFile(
				currentRessourcePack,
				filePath
			);
			if (result === true) {
				foundRessourcePack = currentRessourcePack;
				break;
			}
		}

		if (foundRessourcePack === false) {
			throw new RessourceNotFoundError(
				`The file '${filePath}' could not be found in any active ressource packs`
			);
		}
		return foundRessourcePack;
	}

	async getFullPathToFolderWhereRessourceIsLocated(
		ressource: Ressource,
		filename: string
	) {
		let firstRessourcePackThatHasRessource =
			await this.getFirstRessourcePackThatHasRessource(ressource, filename);

		let pathToRessourcePackRootFolder =
			this.getPathToRessourcePacksRootFolder();

		let rootPathToRessourceType = this.getRootPathToRessourceType(ressource);

		return `${pathToRessourcePackRootFolder}/${firstRessourcePackThatHasRessource}/${rootPathToRessourceType}`;
	}

	async getFullPathToFileInFirstFoundRessourcePack(
		filePath: string
	): Promise<string | null> {
		let ressourcepack = await this.getFirstRessourcePackThatHasFile(filePath);
		if (!ressourcepack) return null;
		return `${this.getPathToRessourcePacksRootFolder()}/${ressourcepack}/${filePath}`;
	}

	async getFullPathToRessource(ressource: Ressource, filename: string) {
		return `${await this.getFullPathToFolderWhereRessourceIsLocated(
			ressource,
			filename
		)}/${filename}`;
	}

	getFullRelativePathToRessourceOfType(ressource: Ressource, filename: string) {
		if (ressource instanceof SoundInstance) {
			let rootPathToRessourceType = this.getRootPathToRessourceType(ressource);
			return `${rootPathToRessourceType}/${filename}`;
		} else if (ressource instanceof Block) {
			let rootPathToRessourceType = this.getRootPathToRessourceType(ressource);
			return `/${rootPathToRessourceType}/${filename}`;
		} else {
			return filename;
		}
	}

	getFullRealtivePathToRessourceOfTypeInRessourcePack(
		ressourcePackName: string,
		ressource: Ressource,
		filename: string
	) {
		let pathToRessourcePackRootFolder =
			this.getPathToRessourcePacksRootFolder();
		return `${pathToRessourcePackRootFolder}/${ressourcePackName}/${this.getFullRelativePathToRessourceOfType(
			ressource,
			filename
		)}`;
	}

	async ressourcePackHasRessource(
		ressourcePackName: string,
		ressource: Ressource,
		filename: string
	): Promise<boolean> {
		return new Promise(async (resolveGlobal, reject) => {
			let requestURL = this.getFullRealtivePathToRessourceOfTypeInRessourcePack(
				ressourcePackName,
				ressource,
				filename
			);

			fetch(requestURL)
				.then((response) => {
					if (response.ok) {
						resolveGlobal(true);
						return;
					}
					throw new Error();
				})
				.catch((error) => {
					if (error instanceof TypeError) {
						throw error;
					}
					resolveGlobal(false);
				});
		});
	}

	async ressourcePackHasFile(ressourcePackName: string, path: string) {
		return new Promise(async (resolveGlobal, reject) => {
			let pathToRessourcePackRootFolder =
				this.getPathToRessourcePacksRootFolder();

			let requestURL = `${pathToRessourcePackRootFolder}/${ressourcePackName}/${path}`;

			fetch(requestURL)
				.then((response) => {
					if (response.ok) {
						resolveGlobal(true);
						return;
					}
					throw new Error();
				})
				.catch((error) => {
					if (error instanceof TypeError) {
						throw error;
					}
					resolveGlobal(false);
				});
		});
	}
}
