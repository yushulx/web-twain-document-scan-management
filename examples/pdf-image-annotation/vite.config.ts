import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  // VITE_DDVR_LICENSE is available via import.meta.env.VITE_DDVR_LICENSE
  // automatically — no define replacement needed.
});
