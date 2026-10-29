/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages のプロジェクトサイト（https://<user>.github.io/sql-reflex/）配下で配信する
  base: process.env.GITHUB_ACTIONS ? "/sql-reflex/" : "/",
  plugins: [react()],
  optimizeDeps: {
    // sqlite-wasm 公式推奨: WASM / Worker を Vite の事前バンドルから外す
    exclude: ["@sqlite.org/sqlite-wasm"],
  },
  test: {
    environment: "node",
    include: ["src/**/*.spec.ts"],
  },
});
