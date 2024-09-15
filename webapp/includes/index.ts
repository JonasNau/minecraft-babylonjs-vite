import { Minecraft } from "./Minecraft";
import * as BABYLON from "@babylonjs/core";
import Settings from "./settings/Settings";
import { IndexedDBHelper } from "./controller/indexedDBController/IndexedDBHelper";

console.log(`main.ts starting ${Minecraft.name}`);

async function startMinecraft(): Promise<boolean> {
	document.body.innerHTML = "";
	document.body.setAttribute("data-menu", "loading");
	let loading_menu_container = document.createElement("div");
	loading_menu_container.classList.add("loading-container");
	loading_menu_container.innerHTML = `
	<h1>Lade Minecraft...</h1>
	<div class='message-container'></div>
	<progress min='0' max='100'>
	`;

	document.body.appendChild(loading_menu_container);
	let messageContainer = loading_menu_container.querySelector(
		"div.loading-container .message-container"
	);
	if (!messageContainer) {
		throw new Error("No message container found");
	}
	function setMessage(message: string) {
		if (!messageContainer) return;
		messageContainer.textContent = message;
	}

	let progress = loading_menu_container.querySelector("progress");
	if (!progress) throw new Error("No progress bar found");

	setMessage("Überpfüfe, ob BabylonJS unterstützt wird...");

	messageContainer.textContent =
		"Überpfüfe, ob BabylonJS unterstützt wird (Erfolg)";

	const canvas = document.createElement("canvas");
	canvas.classList.add("hidden");
	document.body.appendChild(canvas);
	canvas.setAttribute("id", "renderCanvas");

	setMessage("Überpfüfe, ob WebGPU unterstützt wird...");

	progress.value = 10;
	let engine: BABYLON.Engine;
	//Try to use WEBGPU
	let enableWebGPU = false;

	try {
		const settings = Settings.getSettingsFromLocalStorage();
		enableWebGPU = settings.videoSettings.webGPUEnabled ?? enableWebGPU;
	} catch (error) {
		console.warn(error);
	}

	if (enableWebGPU && !(await BABYLON.WebGPUEngine.IsSupportedAsync)) {
		alert(
			"WebGPU wird von deinem System nicht unterstützt. Überprüfe die Version deines Browsers oder des Betriebssystems."
		);
	}

	console.log({ enableWebGPU });
	if (enableWebGPU && (await BABYLON.WebGPUEngine.IsSupportedAsync)) {
		setMessage("Erstelle eine BabylonJS WebGPU Engine...");

		let webGPUEngine = await createWebGPUEngine(canvas, {});
		if (webGPUEngine === false) {
			setMessage(
				"Fehler beim Erstellen der WebGPU Engine. Versuche die WebGL Engine"
			);

			let webglEngine = createEngine(canvas);
			if (!webglEngine) {
				setMessage(
					"Fehler beim Erstellen der WebGL Engine. Sowohl Webgl und WebGPU werden nicht unterstützt. Das Spiel konnte nich geladen werden."
				);
				console.error("WebGPU und fallback WebGL Engine couldn't be created");
				return false;
			}
			engine = webglEngine;
		} else {
			engine = webGPUEngine;
		}
	} else if (BABYLON.Engine.isSupported()) {
		setMessage("Erstelle WebGL BabylonJS Engine...");
		engine = new BABYLON.Engine(canvas);
	} else {
		setMessage(
			"Dein Browser unterstützt kein WebGL. Das Spiel konnte nicht gestartet werden."
		);
		console.error(
			"The browser doesnt support WebGL and so BabylonJS couldn't be loaded"
		);
		return false;
	}
	progress.value = 30;

	setMessage("Starte das Spiel...");
	const app = new Minecraft(canvas, engine);
	progress.value = 70;
	await app.load((message) => {
		setMessage(message);
	});
	progress.value = 100;
	await app.run();
	canvas.classList.remove("hidden");
	app.engine.resize();
	loading_menu_container.remove();

	return true;
}

function createEngine(canvas: HTMLCanvasElement): BABYLON.Engine | false {
	try {
		let engine = new BABYLON.Engine(canvas);
		return engine;
	} catch (error) {
		return false;
	}
}

async function createWebGPUEngine(
	canvas: HTMLCanvasElement,
	options: BABYLON.WebGPUEngineOptions
): Promise<BABYLON.WebGPUEngine | false> {
	if (!(await BABYLON.WebGPUEngine.IsSupportedAsync)) {
		console.error(
			"The browser does not support WebGPU or the Babylon WebGPU engine."
		);
		return false;
	}
	try {
		// await navigator.gpu.requestAdapter(); //Workaround to check if WebGPU is supported, because
		let webGPUEngine = new BABYLON.WebGPUEngine(canvas, options);
		await webGPUEngine.initAsync();
		return webGPUEngine;
	} catch (err) {
		console.error("Error while creating the Babylon WebGPU engine");
		return false;
	}
}

function load() {
	document.body.setAttribute("data-menu", "start");
	document.body.innerHTML = `
		<div class='button-wrapper'>
			<button id="start">
				Starte Minecraft<img src="../media/images/favicon.ico" />
			</button>
			<button id="delete-data">
				Daten löschen <img src="../media/images/delete-icon.png" />
			</button>
		</div>	
	`;
	const startMinecraftBtn = document.querySelector("#start");
	if (!startMinecraftBtn) {
		throw new Error("No Minecraft start button found");
	}

	const deleteDataBtn = document.querySelector("#delete-data");
	if (!deleteDataBtn) throw new Error("No delete data btn found");

	deleteDataBtn.addEventListener("click", async () => {
		if (!confirm("Möchtest du wirklich alle Speicherdaten löschen?")) return;
		window.localStorage.clear();

		let indexedDBController = new IndexedDBHelper();
		await indexedDBController.init();
		let databases = await indexedDBController.getListOfAllAvailableDBs();
		console.log("Deleting DBs:", databases);
		for (const database of databases) {
			if (!database.name) continue;
			indexedDBController.deleteDatabase(database.name);
		}
		alert("Daten wurden gelöscht.");
	});

	startMinecraftBtn.addEventListener(
		"click",
		() => {
			startMinecraftBtn.remove();
			startMinecraft();
		},
		{ once: true }
	);
}

load();

// document.addEventListener("mousedown", function(event) {
//   console.log("Wheel is pressed", (event.buttons & 4) != 0)
// });

// // Check for browser support
// if ("GamepadEvent" in window) {
// 	// Listen for gamepad events
// 	window.addEventListener("gamepadconnected", (event) => {
// 		console.log("Controller connected:", event.gamepad);
// 	});

// 	window.addEventListener("gamepaddisconnected", (event) => {
// 		console.log("Controller disconnected:", event.gamepad);
// 	});

// 	// Main function to handle controller state
// 	function handleGamepad() {
// 		let gamepads = navigator.getGamepads();
// 		for (let i = 0; i < gamepads.length; i++) {
// 			let gamepad = gamepads[i];
// 			if (gamepad) {
// 				// Handle button presses
// 				for (let j = 0; j < gamepad.buttons.length; j++) {
// 					let button = gamepad.buttons[j];
// 					if (button.pressed) {
// 						console.log("Button pressed:", j);
// 					}
// 				}

// 				// Handle joystick movements
// 				let axes = gamepad.axes;
// 				// Use axes[0] for X-axis and axes[1] for Y-axis, or adjust as needed
// 				console.log("Joystick X-axis:", axes[0]);
// 				console.log("Joystick Y-axis:", axes[1]);
// 			}
// 		}

// 		// Request animation frame to continuously update controller state
// 		requestAnimationFrame(handleGamepad);
// 	}

// 	// Start handling controller state
// 	requestAnimationFrame(handleGamepad);
// } else {
// 	console.log("Gamepad API not supported");
// }
