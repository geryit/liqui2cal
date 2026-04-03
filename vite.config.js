import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    target: "es2022",
    rollupOptions: {
      input: resolve(__dirname, "src/content-script.ts"),
      output: {
        entryFileNames: "content-script.js",
        format: "iife",
      },
    },
    outDir: "dist",
  },
});
