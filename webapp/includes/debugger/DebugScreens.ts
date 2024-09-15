export enum EDEBUG_SCREENS {
	INGAME_DEBUG = "Ingame debug",
	GENERAL_INFORMATION = "General Information",
}

export type DebugScreenEntry = {
	name: EDEBUG_SCREENS;
	data_debug_element_html: string;
};

const DEGUB_SCREENS: Array<DebugScreenEntry> = [
	{
		name: EDEBUG_SCREENS.INGAME_DEBUG,
		data_debug_element_html: `
        <div data-debug-element="ingame-infos">
           <ul>
            <li data-debug-element-entry="fps"><span class="content"></span> FPS</li>
            <li data-debug-element-entry="position">Position: <span class="content"></span></li>
            <li data-debug-element-entry="chunk-position">Chunk-Position: <span class="content"></span></li>
           </ul>
        </div>
        `,
	},
	{
		name: EDEBUG_SCREENS.GENERAL_INFORMATION,
		data_debug_element_html: `
        <div data-debug-element="input-controller">
            <h1 class="description"></h1>
            <h2>Input Controller</h2>
            <div class="content"></div>
        </div>
        `,
	},
];

export default DEGUB_SCREENS;
