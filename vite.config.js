/**
 * CONFIGURACIÓN DE VITE
 * 
 * Este archivo configura Vite como build tool y dev server para el proyecto React.
 * Vite proporciona:
 * - Hot Module Replacement (HMR) ultra-rápido
 * - Build optimizado para producción
 * - Soporte nativo para ES modules
 * 
 * Documentación: https://vite.dev/config/
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Configuración de Vite
export default defineConfig({
  /**
   * CONFIGURACIÓN DE SERVIDOR (Comentada - Usar solo para producción)
   * 
   * Estas opciones permiten configurar el servidor de desarrollo para
   * acceso desde red externa o configuración con proxy reverso (Nginx).
   */
  // server: {
  //   host: "0.0.0.0", // Permite acceso desde cualquier IP de la red (no solo localhost)
  //   port: 5173, // Puerto donde corre el servidor de desarrollo
  //   https: false, // Cambiar a true si se usa certificado SSL
  //   allowedHosts: ["localhost", "impalexander.store", "www.impalexander.store"], // Hosts permitidos
  //   fs: {
  //     allow: ["src"], // Directorios permitidos para servir archivos
  //   },
  //   hmr: false, // Hot Module Replacement - false si hay problemas con proxy
  // },

  /**
   * PLUGINS
   * 
   * - react(): Plugin oficial de Vite para React con Fast Refresh
   * - tailwindcss(): Plugin de Tailwind CSS v4 para procesamiento de estilos
   */
  plugins: [react(), tailwindcss()],
});

/**
 * CONFIGURACIÓN HMR PARA PRODUCCIÓN CON PROXY REVERSO
 * 
 * Si se usa Nginx como proxy reverso en producción, descomentar y configurar:
 */
//   hmr: {
//     protocol: "wss", // WebSocket Secure si se usa HTTPS
//     host: "impalexander.store", // Dominio de producción
//     port: 5173, // Puerto del servidor Vite (importante si Nginx está en puerto 80/443)
//   }

