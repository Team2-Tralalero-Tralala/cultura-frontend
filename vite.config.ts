
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // โหลดตัวแปรจาก .env ตาม mode (development / production)

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port:4000,
  },
  };
});

