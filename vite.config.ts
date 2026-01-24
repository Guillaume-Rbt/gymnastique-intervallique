import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import UnoCss from "unocss/vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
    base: "./",
    plugins: [svgr(), react(), UnoCss()],
});
