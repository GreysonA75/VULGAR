import { defineConfig } from "vite";
import { cpSync } from "node:fs";

export default defineConfig({
  base: "./",
  build: { outDir: "demo-dist" },
  plugins: [{
    name: "copy-demo-assets",
    closeBundle() { cpSync("assets", "demo-dist/assets", { recursive: true }); },
  }],
});
