import InputController from "../input-control/InputController";
import InputControlerDebugger from "./InputControllerDebugger";

import NoPageFoundError from "../errors/debugger/NoPageFoundError";
import DebugScreenNotInitializedError from "../errors/debugger/DebugScreenNotInitializedError";

import DEBUG_SCREENS, {
	DebugScreenEntry,
	EDEBUG_SCREENS,
} from "./DebugScreens";
import { EKeyboardCodeSideIndependent } from "../input-control/EKeyboardCodeSideIndependent";
import { EKeyboardCode } from "../input-control/keyboard/EKeyboardCode";
import Keystroke from "../input-control/keystroke/KeyStroke";
import { Minecraft } from "../Minecraft";
import { KeyboardEvents } from "../input-control/keyboard/KeyboardEvents";
import DEGUB_SCREENS from "./DebugScreens";

export default class DebugLayer {
	htmlElementToAttachTo: HTMLElement;
	debugScreenHTMLElement?: HTMLElement;
	currentDebugScreenName: EDEBUG_SCREENS;
	debugScreens: {
		inputController?: InputControlerDebugger;
	};
	mainProgram: Minecraft;
	isVisible: boolean;
	lastPage: number;

	constructor(htmlElementToAttachTo: HTMLElement, mainProgram: Minecraft) {
		this.htmlElementToAttachTo = htmlElementToAttachTo;
		this.mainProgram = mainProgram;
		this.debugScreens = {};
		if (!this.createHTMLOverlay()) {
			throw new Error("HTML Overlay couldn't be created.");
		}

		this.debugScreens.inputController = new InputControlerDebugger(
			this.mainProgram.inputController,
			this.mainProgram.canvas
		);
		this.isVisible = false;
		this.lastPage = 0;
		this.currentDebugScreenName = EDEBUG_SCREENS.INGAME_DEBUG;
	}

	debugScreenIsActive(debugScreenName: EDEBUG_SCREENS) {
		return this.currentDebugScreenName === debugScreenName && this.isVisible;
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
		this.cleanHTMLOverlay();

		return true;
	}

	cleanHTMLOverlay() {
		if (!this.debugScreenHTMLElement) {
			throw new Error(
				"There is not debugscreen html element on the page. You need to call createHTMLOverlay() first."
			);
		}

		this.debugScreenHTMLElement.innerHTML = `<h1>Debug Screen <span class='page-index'></span></h1><div class="description"></div>`;
		for (const [debugScreenNumber, debugScreen] of Object.entries(
			DEBUG_SCREENS
		)) {
			let debugScreenHTMLElement = document.createElement("div");
			debugScreenHTMLElement.setAttribute(
				"data-debug-screen-name",
				debugScreen.name
			);
			debugScreenHTMLElement.innerHTML = debugScreen.data_debug_element_html;
			this.debugScreenHTMLElement.appendChild(debugScreenHTMLElement);
		}
		this.hideAllPages();
		return true;
	}

	getNumberOfPages(): number {
		return DEBUG_SCREENS.length;
	}

	showNextPage() {
		let currentScreenIndex = DEBUG_SCREENS.indexOf(
			this.findDebugEntryByName(this.currentDebugScreenName)!
		);
		let nextPage = currentScreenIndex + 1;
		if (nextPage > this.getNumberOfPages() - 1) {
			nextPage = 0;
		}
		this.setPage(DEBUG_SCREENS[nextPage].name);
	}

	showPreviousPage() {
		let currentScreenIndex = DEBUG_SCREENS.indexOf(
			this.findDebugEntryByName(this.currentDebugScreenName)!
		);
		let previousPage = currentScreenIndex - 1;
		if (previousPage < 0) {
			previousPage = DEBUG_SCREENS.length - 1;
		}
		this.setPage(DEBUG_SCREENS[previousPage].name);
	}

	showPageWithIndex(number: number) {
		this.currentDebugScreenName = DEBUG_SCREENS[number].name;
		this.debugScreenHTMLElement
			?.querySelector(`[data-debug-screen-name='${number}']`)
			?.classList.remove("hidden");

		this.updateDebugScreenInfo();
	}

	findDebugEntryByName(debug_screen_entry_name: EDEBUG_SCREENS) {
		let debugScreenEntryFound = DEBUG_SCREENS.find(
			(preciate) => preciate.name === debug_screen_entry_name
		);
		return debugScreenEntryFound;
	}

	showPage(pageName: EDEBUG_SCREENS) {
		let debugScreenEntryFound = this.findDebugEntryByName(pageName);
		if (!debugScreenEntryFound) return;
		this.currentDebugScreenName = debugScreenEntryFound.name;

		this.debugScreenHTMLElement
			?.querySelector(
				`[data-debug-screen-name='${this.currentDebugScreenName}']`
			)
			?.classList.remove("hidden");

		this.updateDebugScreenInfo();
	}

	getPageHTMLOverlayByName(
		debugScreenName: EDEBUG_SCREENS
	): HTMLElement | null {
		let page = this.debugScreenHTMLElement?.querySelector(
			`[data-debug-screen-name='${debugScreenName}']`
		) as HTMLElement;
		if (!page) return null;
		return page;
	}

	setPageHidden(number: number) {
		let page = this.debugScreenHTMLElement?.querySelector(
			`[data-debug-screen-name='${number}']`
		);
		if (!page) {
			throw new NoPageFoundError(`No page with number ${number} found`);
		}
		page.classList.add("hidden");
		page.classList.remove("active");
	}

	hideAllPages() {
		this.debugScreenHTMLElement
			?.querySelectorAll(`[data-debug-screen-name]`)
			?.forEach((screen) => {
				screen.classList.add("hidden");
				screen.classList.remove("active");
			});
	}

	disableAllDebugScreens() {
		//Hide all Debug Screens and Disable it
		for (let debugScreen of Object.values(this.debugScreens)) {
			if (!debugScreen.isActive) continue;
			debugScreen.hide();
		}
	}

	updateDebugScreenInfo() {
		let pageIndexContainer =
			this.debugScreenHTMLElement?.querySelector(".page-index");
		if (!pageIndexContainer) {
			throw new Error("There is no page index to display");
		}

		let currentIndex = DEBUG_SCREENS.indexOf(
			this.findDebugEntryByName(this.currentDebugScreenName)!
		);
		pageIndexContainer.innerHTML = `<span class='current'>${
			currentIndex + 1
		}</span>/<span class='lastPage'>${
			Object.keys(DEBUG_SCREENS).length
		}</span>`;

		let currentDebugScreenEntry = this.findDebugEntryByName(
			this.currentDebugScreenName
		);
		if (!currentDebugScreenEntry) return;

		let descriptionContainer =
			this.debugScreenHTMLElement?.querySelector(".description");
		if (!descriptionContainer) return;
		descriptionContainer.innerHTML = `${currentDebugScreenEntry.name}`;
	}

	setPage(debugScreenName: EDEBUG_SCREENS) {
		this.disableAllDebugScreens();
		this.cleanHTMLOverlay();

		let page = this.getPageHTMLOverlayByName(debugScreenName);
		if (!page) {
			throw new NoPageFoundError(
				`No page with the name ${debugScreenName} found`
			);
		}
		page.classList.add("active");
		switch (debugScreenName) {
			case EDEBUG_SCREENS.INGAME_DEBUG:
				this.showPage(EDEBUG_SCREENS.INGAME_DEBUG);
				break;
			case EDEBUG_SCREENS.GENERAL_INFORMATION:
				//Has all components initialized
				if (!this.debugScreens.inputController) {
					throw new DebugScreenNotInitializedError(
						"The input controller is not initialized"
					);
				}

				let dataDebugElement_InputController = page.querySelector(
					"[data-debug-element='input-controller']"
				) as HTMLElement;
				if (!dataDebugElement_InputController) {
					throw new Error("There is not data-debug-element");
				}
				this.debugScreens.inputController.setContainer(
					dataDebugElement_InputController,
					dataDebugElement_InputController.querySelector(".content")!
				);
				this.debugScreens.inputController.start();
				this.showPage(EDEBUG_SCREENS.GENERAL_INFORMATION);
				break;
			default:
				throw new NoPageFoundError(
					`No page with the name ${debugScreenName} found`
				);
		}
		this.isVisible = true;
	}

	show(debugScreenName?: EDEBUG_SCREENS) {
		if (!this.debugScreenHTMLElement) {
			throw new Error(
				"Cannot show the debuglayer because there is no html overlay created"
			);
		}
		this.debugScreenHTMLElement.classList.remove("hidden");
		if (debugScreenName) {
			this.setPage(debugScreenName);
		} else {
			this.setPage(this.currentDebugScreenName ?? EDEBUG_SCREENS.INGAME_DEBUG);
		}
	}

	hide() {
		if (!this.debugScreenHTMLElement) {
			throw new Error("The overlay doesnt exist.");
		}
		this.debugScreenHTMLElement.classList.add("hidden");

		this.disableAllDebugScreens();
		this.isVisible = false;
	}

	loadKeyboardShortcuts() {
		//CTRL + ALT + SHIFT + s -> Open the debug layer from babylonjs from the curren active scene

		let currentScene = 0;
		this.mainProgram.inputController.registerKeyStroke(
			Keystroke.fromMixedContent(
				EKeyboardCodeSideIndependent.CTRL,
				EKeyboardCodeSideIndependent.ALT,
				EKeyboardCode.KeyS
			),
			() => {
				if (currentScene + 1 == this.mainProgram.engine.scenes.length) {
					currentScene = 0;
				} else {
					currentScene++;
				}

				let scene = this.mainProgram.engine.scenes[currentScene];

				for (const scene of this.mainProgram.engine.scenes) {
					scene.debugLayer.hide();
				}

				scene.debugLayer.show({ overlay: true });
				return;
			}
		);

		//Prevent default on F3 Key
		this.mainProgram.inputController.registerKeyStroke(
			Keystroke.fromMixedContent(EKeyboardCode.F3),
			(event) => {
				event.preventDefault();
				if (!this.isVisible) {
					this.show();
					return;
				}
				this.hide();
			}
		);

		this.mainProgram.inputController.registerKeyStroke(
			Keystroke.fromMixedContent(EKeyboardCode.F3, EKeyboardCode.ArrowRight),
			() => {
				this.mainProgram.debugLayer?.showNextPage();
			}
		);
		this.mainProgram.inputController.registerKeyStroke(
			Keystroke.fromMixedContent(EKeyboardCode.F3, EKeyboardCode.ArrowLeft),
			() => {
				this.mainProgram.debugLayer?.showPreviousPage();
			}
		);
	}
}
