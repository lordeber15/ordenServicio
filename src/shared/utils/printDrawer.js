import qz from "./qzClient";

/**
 * Utilidad para control de Impresora Térmica conectada vía QZ Tray.
 * Envía el pulso hexadecimal (ESC/POS) al RJ11 para expulsar la gaveta de dinero.
 */
export const openCashDrawer = async () => {
  try {
    // 1. Conectar con el programa QZ Tray local (localhost) silenciosamente
    if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
    }

    // 2. Localizar la impresora térmica predeterminada en Windows/Mac
    const printer = await qz.printers.getDefault();
    console.log("QZ Tray localizó la impresora predeterminada:", printer);

    const cfg = qz.configs.create(printer);

    // 3. Comando ESC/POS para la gaveta: ESC p m t1 t2
    // m=0 (pin 2), t1=25, t2=250
    const pulseData = ["\x1B\x70\x00\x19\xFA"];

    // 4. Enviar los datos directamente a la impresora
    await qz.print(cfg, pulseData);
    console.log("Señal de gaveta enviada excitósamente mediante QZ Tray");

  } catch (error) {
    console.error("Error abriendo la gaveta con QZ Tray:", error);
  }
};
