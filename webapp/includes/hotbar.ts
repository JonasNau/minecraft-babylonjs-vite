import * as BABYLON_GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";

export default class Hotbar {
	guiElement: BABYLON_GUI.StackPanel;
	gui: BABYLON_GUI.AdvancedDynamicTexture;
	numberOfSlots: number;
	currentSelectedIndex: number;
	widthAndHeightOfHotbarItemInPx: number;

	constructor(gui: BABYLON_GUI.AdvancedDynamicTexture, numberOfSlots: number) {
		this.gui = gui;
		this.numberOfSlots = numberOfSlots;
		this.currentSelectedIndex = 0;
		this.widthAndHeightOfHotbarItemInPx = 50;
		this.guiElement = this.createHotbar(this.numberOfSlots);

		this.setSelected(this.currentSelectedIndex);
	}

	createHotbar(numberOfHotbarSlots: number): BABYLON_GUI.StackPanel {
		const hotbar = new BABYLON_GUI.StackPanel("hotbar");
		hotbar.paddingBottom = "1%";

		// console.log("padding bottom:", hotbar.paddingBottom, hotbar.paddingBottomInPixels)

		hotbar.adaptHeightToChildren = true;

		//make horizontal
		hotbar.isVertical = false;
		//center it horizontally
		hotbar.horizontalAlignment =
			BABYLON_GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		//set it to the bottom of the gui
		hotbar.verticalAlignment = BABYLON_GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
		this.gui.addControl(hotbar);
		// Create a button for each item in the hotbar
		for (
			let currentButtonIndex = 0;
			currentButtonIndex < numberOfHotbarSlots;
			currentButtonIndex++
		) {
			const button = new BABYLON_GUI.Button(
				`hotbar-slot-${currentButtonIndex}`
			);

			if (
				typeof this.widthAndHeightOfHotbarItemInPx != "number" ||
				this.widthAndHeightOfHotbarItemInPx <= 0
			) {
				throw new Error(
					"The width and height of the hotbar slots have to be a number and greater than 0"
				);
			}

			button.widthInPixels = this.widthAndHeightOfHotbarItemInPx;
			button.heightInPixels = this.widthAndHeightOfHotbarItemInPx;
			button.color = "gray";
			button.cornerRadius = 1;
			button.thickness = 3.5;
			button.background = "RGBA(0,0,0,0.5)";
			hotbar.addControl(button);
		}

		hotbar.isVisible = false;
		return hotbar;
	}

	setNext() {
		let nextSlot = this.currentSelectedIndex + 1;
		let lastSlotIndex = this.numberOfSlots - 1;
		if (nextSlot > lastSlotIndex) {
			nextSlot = 0;
		}
		this.setSelected(nextSlot);
	}

	setPrevious() {
		let previousSlot = this.currentSelectedIndex - 1;
		let firstSlotIndex = 0;
		if (previousSlot < firstSlotIndex) {
			let lastSlotIndex = this.numberOfSlots - 1;
			previousSlot = lastSlotIndex;
		}
		this.setSelected(previousSlot);
	}

	setSelected(number: number) {
		this.resetSelection();
		this.guiElement.children[number].color = "lightgray";
		this.currentSelectedIndex = number;
	}

	resetSelection() {
		for (let hotbarSlot of this.guiElement.children) {
			hotbarSlot.color = "gray";
		}
	}

	getSlotByIndex(slotIndex: number): BABYLON_GUI.Button {
		let button = this.guiElement.children[slotIndex];
		if (!(button instanceof BABYLON_GUI.Button)) {
			throw new Error(
				`The button is not an instance of ${typeof BABYLON_GUI.Button}`
			);
		}
		return button;
	}

	displayItemInSlot(slotIndex: number, sourceURL: string) {
		let slot = this.getSlotByIndex(slotIndex);

		let itemImage = new BABYLON_GUI.Image("item-image");
		itemImage.width = "100%";
		itemImage.height = "100%";
		itemImage.source = sourceURL;
		slot.addControl(itemImage);
		this.setNumberOfItemsInSlot(0, 100);
	}

	removeDisplayedItemInSlot(slotIndex: number) {
		let slot = this.getSlotByIndex(slotIndex);
		let image = slot.getChildByName("item-image")!;
		slot.removeControl(image);
	}

	setNumberOfItemsInSlot(slotIndex: number, number: number) {
		let slot = this.getSlotByIndex(slotIndex);
		let numberOfItemsText = new BABYLON_GUI.TextBlock(
			"number-of-items",
			`${number}`
		);
		numberOfItemsText.fontSize = 15;
		numberOfItemsText.fontWeight = "bold";
		numberOfItemsText.resizeToFit = true;
		numberOfItemsText.verticalAlignment =
			BABYLON_GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
		numberOfItemsText.horizontalAlignment =
			BABYLON_GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
		slot.addControl(numberOfItemsText);
	}

	removeNumberOfItemsInSlot(slotIndex: number) {
		let slot = this.getSlotByIndex(slotIndex);
		let image = slot.getChildByName("number-of-items")!;
		slot.removeControl(image);
	}
}
