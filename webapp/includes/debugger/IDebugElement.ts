export default interface IDebugElement {
	htmlElementOfCurrentDebuggerContainer?: HTMLElement;
	htmlElementToAttach?: HTMLElement;
	isActive: boolean;
	isPaused: boolean;
	start(): void;
	hide(): void;
	pause(): void;
	resume(): void;
	setContainer(
		htmlElementOfCurrentDebuggerContainer: HTMLElement,
		htmlElementToAttach: HTMLElement
	): void;
}
