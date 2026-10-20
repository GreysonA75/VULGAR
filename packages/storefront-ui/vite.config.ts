import { defineConfig } from "vite";
export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
      cssFileName: "storefront-ui",
    },
    rollupOptions: {
      output: { banner: '"use client";' },
      onwarn(warning, warn) {
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" &&
          warning.message.includes("use client")
        )
          return;
        warn(warning);
      },
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
  },
  server: { fs: { allow: ["."] } },
});
