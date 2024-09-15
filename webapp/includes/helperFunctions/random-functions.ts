export function getRandomNumber(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

export function getRandomInt(max: number) {
	return Math.floor(Math.random() * max);
}

export function getRandomIntBetween(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	max = max + 1;
	return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

export function getRandomNumberBetweenExcept(
	min: number,
	max: number,
	except: number
) {
	let maxTries = 100;
	let currentTry = 0;
	let currentNumber: number = min;
	while (currentTry <= maxTries) {
		currentTry++;
		currentNumber = getRandomIntBetween(min, max);
		if (currentNumber != except) {
			break;
		}
	}
	return currentNumber;
}
