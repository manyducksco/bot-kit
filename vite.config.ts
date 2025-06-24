import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    sourcemap: true,
    minify: false,

    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        hono: resolve(__dirname, "src/hono.ts"),
        schema: resolve(__dirname, "src/schema.ts"),
      },
      name: "@manyducks.co/chatbot",
      formats: ["es"],
    },
  },
});
