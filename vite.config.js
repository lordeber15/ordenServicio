import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0", // Permite acceso desde red externa
    port: 5173, // Puerto donde corre Vite
    https: false,
    allowedHosts: ["localhost", "impalexander.store", "www.impalexander.store"],
    fs: {
      allow: ["src"],
    },
    hmr: false,
  },
  plugins: [react(), tailwindcss()],
});

//   protocol: "wss", // o 'wss' si usas HTTPS
//   host: "impalexander.store",
//   port: 5173, // 👈 importante si Nginx está en el puerto 80
