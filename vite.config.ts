import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// OPTIONAL: enable compression
import { brotliCompressSync } from "zlib";
import fs from "fs";

const enableCompression = true;

// --- Custom Brotli Plugin (Modified) ---
function brotliPlugin() {
	return {
		name: "brotli-compress",
		closeBundle() {
			if (!enableCompression) return;

			const dist = path.resolve(__dirname, "dist");

            // FIX: Check if the 'dist' directory exists. 
            // The build fails if the plugin tries to read a non-existent directory.
            if (!fs.existsSync(dist)) {
                console.error(`[brotli-compress] Error: 'dist' directory not found at ${dist}. Skipping compression.`);
                return;
            }
            
			const walk = (dir: string) => {
				for (const file of fs.readdirSync(dir)) {
					const full = path.join(dir, file);
					const stat = fs.statSync(full);

					if (stat.isDirectory()) walk(full);
					else if (/\.(js|css|json)$/.test(full)) {
						const content = fs.readFileSync(full);
						const compressed = brotliCompressSync(content);
						fs.writeFileSync(full + ".br", compressed);
					}
				}
			};
			walk(dist);
		},
	};
}

export default defineConfig({
	plugins: [react(), brotliPlugin()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
		dedupe: ["react", "react-dom"],
	},

	build: {
		sourcemap: false,
		minify: "esbuild",
		cssMinify: "esbuild",

		rollupOptions: {
			output: {
				manualChunks: {
					"react-vendor": ["react", "react-dom"],
					"router-vendor": ["react-router-dom"],
					"idb-vendor": ["idb"],
				},
			},
		},

		chunkSizeWarningLimit: 600,
	},
});
