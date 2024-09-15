import { EKeyboardCode } from "./keyboard/EKeyboardCode";
import { EMouseEvent } from "./mouse/EMouseEvent";

export function keyPressed(
	event: KeyboardEvent,
	eKeyCode: EKeyboardCode
): boolean {
	switch (eKeyCode) {
		case EKeyboardCode.ALT:
		case EKeyboardCode.CTRL:
			return event.getModifierState(eKeyCode);
			break;
		case EKeyboardCode.SHIFT:
			return event.shiftKey;
		default:
			return event.code == eKeyCode;
	}
}

export function checkWheelCondition(
	event: WheelEvent,
	eMouseEvent: EMouseEvent
): boolean {
	switch (eMouseEvent) {
		default:
			return false;
			break;
	}
}
