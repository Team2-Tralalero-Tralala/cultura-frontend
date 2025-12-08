import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "~": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: Number(env.VITE_PORT) || 4000, // พอร์ตของ frontend
      proxy: {
        "/api": {
          target: env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000", //  backend (Express)
          changeOrigin: true,
        },
      },
    },
  };
});
