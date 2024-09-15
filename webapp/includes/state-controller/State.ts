export default interface State {
	enter(): Promise<void> | void;
	exit(): Promise<void> | void;
	isActive: boolean;
}
