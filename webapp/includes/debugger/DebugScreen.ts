import InputController from "../input-control/InputController";
import IDebugElement from "./IDebugElement";
import InputControlerDebugger from "./InputControllerDebugger";
import * as BABYLON from "@babylonjs/core";

import NoPageFoundError from "../errors/debugger/NoPageFoundError";
import DebugScreenNotInitialized from "../errors/debugger/DebugScreenNotInitializedError";
import DebugScreenNotInitializedError from "../errors/debugger/DebugScreenNotInitializedError";

import DEBUG_SCREENS from "./DebugScreens";
import { EKeyboardCodeSideIndependent } from "../input-control/EKeyboardCodeSideIndependent";
import { EKeyboardCode } from "../input-control/keyboard/EKeyboardCode";
import Keystroke from "../input-control/keystroke/KeyStroke";
import { sceneUboDeclaration } from "@babylonjs/core/Shaders/ShadersInclude/sceneUboDeclaration";

export default class DebugLayer {
	htmlElementToAttachTo: HTMLElement;
	debugScreenHTMLElement?: HTMLElement;
	currentPage = 0;
	debugScreens: {
		inputController?: InputControlerDebugger;
	};
	inputController: InputController;
	engine: BABYLON.Engine;

	constructor(
		htmlElementToAttachTo: HTMLElement,
		inputController: InputController,
		engine: BABYLON.Engine
	) {
		this.htmlElementToAttachTo = htmlElementToAttachTo;
		this.inputController = inputController;
		this.engine = engine;
		this.debugScreens = {};
		if (!this.createHTMLOverlay()) {
			throw new Error("HTML Overlay couldn't be created.");
		}
	}

	createHTMLOverlay(): boolean {
		if (this.debugScreenHTMLElement) {
			console.warn(
				"You tried to create a new overlay but for this debug instance ther already exists an htmlElement. You will need to remove it first.",
				this.debugScreenHTMLElement
			);
			return false;
		}

		this.debugScreenHTMLElement = document.createElement("div");
		this.htmlElementToAttachTo.prepend(this.debugScreenHTMLElement);
		this.debugScreenHTMLElement.classList.add("debug-screen", "hidden");
		this.debugScreenHTMLElement.innerHTML = "";

		for (const [debugScreenNumber, debugScreen] of Object.entries(
			DEBUG_SCREENS
		)) {
			let debugScreenHTMLElement = document.createElement("div");
			debugScreenHTMLElement.setAttribute(
				"data-debug-screen-number",
				debugScreenNumber
			);
			debugScreenHTMLElement.innerHTML = debugScreen.data_debug_element_html;
			this.debugScreenHTMLElement.appendChild(debugScreenHTMLElement);
		}

		return true;
	}

	getNumberOfPages(): number {
		return Object.keys(DEBUG_SCREENS).length;
	}

	showNextPage() {
		let nextPage = this.currentPage++;
		if (nextPage > this.getNumberOfPages() - 1) {
			nextPage = 0;
		}
		this.setPage(nextPage);
	}

	showPreviousPage() {
		let previousPage = this.currentPage--;
		if (previousPage < 0) {
			previousPage = this.getNumberOfPages() - 1;
		}
		this.setPage(previousPage);
	}

	showPage(number: number) {
		this.debugScreenHTMLElement
			?.querySelector(`[data-debug-screen-number='${number}']`)
			?.classList.remove("hidden");
		this.currentPage = number;
	}

	getPage(number: number): HTMLElement | null {
		let page = this.debugScreenHTMLElement?.querySelector(
			`[data-debug-screen-number='${number}']`
		) as HTMLElement;
		if (!page) return null;
		return page;
	}

	hidePage(number: number) {
		let page = this.debugScreenHTMLElement?.querySelector(
			`[data-debug-screen-number='${number}']`
		);
		if (!page) {
			throw new NoPageFoundError(`No page with number ${number} found`);
		}
		page.classList.add("hidden");
		page.classList.remove("active");
	}

	hideAllPages() {
		this.debugScreenHTMLElement
			?.querySelectorAll(`[data-debug-screen-number]`)
			?.forEach((screen) => {
				screen.classList.add("hidden");
				screen.classList.add("active");
			});
		this.currentPage = -1;
	}

	disableAllDebugScreens() {
		//Hide all Debug Screens and Disable it
		for (let debugScreen of Object.values(this.debugScreens)) {
			if (!debugScreen.isActive) continue;
			debugScreen.hide();
		}
	}

	setPage(number: number) {
		this.hideAllPages();
		this.disableAllDebugScreens();

		let page = this.getPage(number);
		if (!page) {
			throw new NoPageFoundError(`No page with the number ${number} found`);
		}
		page.classList.add("active");

		switch (number) {
			case 0:
				//Has all components initialized
				if (!this.debugScreens.inputController) {
					throw new DebugScreenNotInitializedError(
						"The input controller is not initialized"
					);
				}

				this.showPage(number);

				let dataDebugElement_InputController = page.querySelector(
					"[data-debug-element='input-controller'"
				)! as HTMLElement;
				this.debugScreens.inputController.setContainer(
					dataDebugElement_InputController,
					dataDebugElement_InputController.querySelector(".content")!
				);
				this.debugScreens.inputController.start();
				break;
			default:
				throw new Error(`The debug page ${number} doesnt exist`);
		}
	}

	addInputControllerDebugger(
		inputController: InputController,
		canvas: HTMLCanvasElement
	) {
		this.debugScreens.inputController = new InputControlerDebugger(
			inputController,
			canvas
		);
	}

	show(number?: number) {
		if (!this.debugScreenHTMLElement) {
			throw new Error("The overlay doesnt exist.");
		}
		this.debugScreenHTMLElement.classList.remove("hidden");
		if (number) {
			this.setPage(number);
		} else {
			this.setPage(0);
		}
	}

	hide() {
		if (!this.debugScreenHTMLElement) {
			throw new Error("The overlay doesnt exist.");
		}
		this.debugScreenHTMLElement.classList.add("hidden");

		this.disableAllDebugScreens();
	}

	loadKeyboardShortcuts() {
		//CTRL + ALT + SHIFT + s -> Open the debug layer from babylonjs from the curren active scene

		let currentScene = 0;
		this.inputController.registerKeyStroke(
			Keystroke.fromMixedContent(
				EKeyboardCodeSideIndependent.CTRL,
				EKeyboardCodeSideIndependent.ALT,
				EKeyboardCode.KeyS
			),
			() => {
				if (currentScene + 1 == this.engine.scenes.length) {
					currentScene = 0;
				} else {
					currentScene++;
				}

				let scene = this.engine.scenes[currentScene];

				for (const scene of this.engine.scenes) {
					scene.debugLayer.hide();
				}

				scene.debugLayer.show({ overlay: true });
				return;
			}
		);
	}
}
