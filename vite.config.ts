import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // โหลดตัวแปรจาก .env ตาม mode (development / production)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: Number(env.VITE_PORT) || 4000,
      host: true, // เพิ่มถ้าอยากให้เข้าผ่าน IP ในเครือข่ายได้
    },
  };
});
