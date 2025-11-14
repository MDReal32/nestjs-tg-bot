import { defineConfig } from "vite";
import dtsPlugin from "vite-plugin-dts";

export default defineConfig({
  plugins: [dtsPlugin({ rollupTypes: true })],
  build: {
    outDir: "build",
    ssr: true,
    lib: {
      entry: { "nestjs-tg-bot": "src/main.ts" },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}.${format === "cjs" ? "cjs" : "js"}`,
    }
  }
});
