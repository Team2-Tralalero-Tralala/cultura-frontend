import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: '/~66160354/',   // << สำคัญ
  plugins: [react(), tailwindcss()],
});
