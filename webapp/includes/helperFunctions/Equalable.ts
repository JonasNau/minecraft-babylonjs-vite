interface Equalable {
	equals(other: Equalable): boolean;
}

function deepEquals(obj1: any, obj2: any): boolean {
	if (obj1 === obj2) {
		return true;
	}
	if (obj1 instanceof Object && obj2 instanceof Object) {
		const keys1 = Object.keys(obj1);
		const keys2 = Object.keys(obj2);
		if (keys1.length !== keys2.length) {
			return false;
		}
		for (const key of keys1) {
			if (!deepEquals(obj1[key], obj2[key])) {
				return false;
			}
		}
		return true;
	}
	return false;
}
