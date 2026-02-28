/**
 * ENTRY POINT DE LA APLICACIÓN REACT
 * 
 * Este archivo es el punto de entrada principal de la aplicación.
 * Inicializa React y configura los providers globales necesarios:
 * 
 * 1. QueryClientProvider - Manejo de estado del servidor con TanStack Query
 * 2. BrowserRouter - Enrutamiento del lado del cliente
 * 3. StrictMode - Modo estricto de React para detectar problemas
 * 
 * Orden de providers (de afuera hacia adentro):
 * QueryClientProvider > StrictMode > BrowserRouter > App
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css"; // Estilos globales (Tailwind CSS)
import App from "./App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./core/context/ThemeContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * RENDERIZADO DE LA APLICACIÓN
 * 
 * createRoot: API moderna de React 18+ para renderizar la app
 * getElementById("root"): Busca el div#root en index.html
 * 
 * Estructura de providers:
 * - QueryClientProvider: Proporciona el cliente de TanStack Query a toda la app
 * - StrictMode: Activa verificaciones adicionales en desarrollo
 * - BrowserRouter: Habilita navegación del lado del cliente (SPA)
 */
createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <StrictMode>
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </StrictMode>
  </QueryClientProvider>
);
