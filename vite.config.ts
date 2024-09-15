import { defineConfig } from "vite";
import path from "path";
import { PreserveEntrySignaturesOption } from "rollup";
import * as glob from "glob";
import { fileURLToPath } from "node:url";
import mkcert from 'vite-plugin-mkcert'

const ROOT_PATH = "./webapp";
export default defineConfig({
	// plugins: [ mkcert() ],
	root: ROOT_PATH,
	css: {
		preprocessorOptions: {
			scss: {},
		},
		devSourcemap: true,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, ROOT_PATH),
			"@node_modules": path.resolve(__dirname, "node_modules"),
		},
	},
	build: {
		chunkSizeWarningLimit: 50_000,
		target: ["esnext"],
		outDir: "../production",
		//assetsDir: "./webapp/assets",
		assetsInlineLimit: 0,
		cssMinify: false,
		cssCodeSplit: false,
		sourcemap: false,
		emptyOutDir: true,

		rollupOptions: {
			input: {
				index: "webapp/pages/index.html",
			},
			external: [],
			output: {
				preserveModules: false,
				manualChunks: undefined,
				// chunkFileNames: "[name].[ext]",
				// assetFileNames: "[name].[ext]",
			},
			preserveEntrySignatures: {} as PreserveEntrySignaturesOption,
		},
	},
	server: {
		open: "./pages/index.html",
	},
});

/**
 * Returns an object with dynamically generated entry points for all files matching the glob pattern.
 * @param {string} pattern - A glob pattern to search for files.
 * @returns {Record<string, string>} An object with dynamically generated entry points.
 */
function globEntries(pattern: string): Record<string, string> {
	const entries: Record<string, string> = {};

	glob.sync(pattern).forEach((file: string) => {
		const name = file.match(/([\w-]+)\.html$/)?.[1];
		if (name) {
			entries[name] = file;
		}
	});

	return entries;
}
