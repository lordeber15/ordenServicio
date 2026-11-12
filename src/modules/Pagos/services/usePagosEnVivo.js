import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { getAccessToken } from "../../../core/auth/session";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/";

/**
 * Conexión en tiempo real a /live (Socket.IO) para el panel de pagos.
 *
 * - El token va en `auth` como función: se lee de memoria en cada
 *   (re)conexión, así siempre viaja el access token vigente.
 * - El servidor corta la conexión cuando vence el token ("io server
 *   disconnect"); Socket.IO no reintenta solo en ese caso, así que se
 *   reconecta aquí con el token ya renovado.
 * - onReconectar: al volver la conexión, la página vuelve a pedir los datos
 *   por REST (pudo perderse algún evento mientras estuvo caída).
 *
 * @param {{onPago?: Function, onNoReconocida?: Function, onDispositivo?: Function, onReconectar?: Function}} handlers
 * @returns {"conectando"|"conectado"|"desconectado"} estado de la conexión
 */
export function usePagosEnVivo(handlers) {
  const [estado, setEstado] = useState("conectando");
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    const socket = io(`${new URL(API).origin}/live`, {
      path: "/socket.io",
      auth: (cb) => cb({ token: getAccessToken() }),
      reconnectionDelayMax: 10_000,
    });
    let primeraVez = true;
    let timer;

    socket.on("connect", () => {
      setEstado("conectado");
      if (!primeraVez) ref.current.onReconectar?.();
      primeraVez = false;
    });
    socket.on("disconnect", (motivo) => {
      setEstado("desconectado");
      if (motivo === "io server disconnect") timer = setTimeout(() => socket.connect(), 2_000);
    });
    socket.on("connect_error", () => {
      setEstado("desconectado");
      // Rechazo de autenticación (token vencido): Socket.IO no reintenta solo.
      if (!socket.active) timer = setTimeout(() => socket.connect(), 5_000);
    });
    socket.on("payment.created", (p) => ref.current.onPago?.(p));
    socket.on("notification.unparsed", (n) => ref.current.onNoReconocida?.(n));
    socket.on("device.status", (d) => ref.current.onDispositivo?.(d));

    return () => {
      clearTimeout(timer);
      socket.close();
    };
  }, []);

  return estado;
}
