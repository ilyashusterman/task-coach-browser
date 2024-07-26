import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { comlink } from "vite-plugin-comlink";
// Resolve path
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/task-coach-browser/",
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/onnxruntime-web/dist/*.jsep.*",
          dest: "dist",
        },
      ],
    }),
    comlink(),
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
      output: {
        entryFileNames: "[name].js",
        format: "es",
      },
    },
  },
  server: {
    port: 8081,
    open: true,
  },
});
