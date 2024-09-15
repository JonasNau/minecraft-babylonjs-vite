export enum GAMEMODE {
	SURVIVAL = 0,
	CREATIVE = 1,
	SEPECTATOR = 2,
}

export function convertGamemodeToWord(gamemode: GAMEMODE) {
	switch (gamemode) {
		case GAMEMODE.SURVIVAL:
			return "Überlebensmodus";
			break;
		case GAMEMODE.CREATIVE:
			return "Kreativmodus";
			break;
		case GAMEMODE.SEPECTATOR:
			return "Zuschauermodus";
			break;
		default:
			throw new Error("The gamemode doesnt exist.");
	}
}
