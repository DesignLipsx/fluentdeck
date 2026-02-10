import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
		// Ensures only one version of React is loaded, preventing hook errors
		dedupe: ["react", "react-dom"],
	},
	build: {
		// 1. Faster Transpilation: Target modern browsers
		target: "esnext",
		minify: "esbuild",
		cssMinify: true,

		// 2. Performance: Disable heavy calculation tasks
		reportCompressedSize: false,
		sourcemap: false,

		rollupOptions: {
			output: {
				// 3. Smart Chunking: Automatically splits node_modules into a separate file
				// This improves build speed by reducing the work Rollup does on re-builds.
				manualChunks(id) {
					if (id.includes('node_modules')) {
						return 'vendor';
					}
				},
			},
		},
		// 4. Cleanup: Prevents build failure on large (but acceptable) bundles
		chunkSizeWarningLimit: 1000,
	},
});