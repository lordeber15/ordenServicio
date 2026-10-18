import { useSyncExternalStore } from "react";
import { getSnapshot, subscribe } from "./session";

/** Estado de sesión reactivo: { estado: "cargando"|"autenticado"|"anonimo", usuario }. */
export const useSesion = () => useSyncExternalStore(subscribe, getSnapshot);
