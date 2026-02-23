import qz from 'qz-tray';
import axiosURL from '../../core/api/axiosURL';

// ─── Configuración Global de Seguridad QZ Tray (Modo "Trusted") ────────────
qz.security.setCertificatePromise((resolve, reject) => {
  fetch(`${axiosURL.defaults.baseURL}/qz/certificate`)
    .then(res => res.text())
    .then(resolve)
    .catch(reject);
});

qz.security.setSignaturePromise((toSign) => {
  return (resolve, reject) => {
    fetch(`${axiosURL.defaults.baseURL}/qz/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toSign })
    })
      .then(res => res.text())
      .then(resolve)
      .catch(reject);
  };
});

/**
 * Utilidad para control de Impresora Térmica conectada vía QZ Tray.
 * Envía el pulso hexadecimal (ESC/POS) al RJ11 para expulsar la gaveta de dinero.
 * 
 * Requisito: Debe estar instalado y ejecutándose QZ Tray (https://qz.io) 
 * en la computadora física que tiene la impresora.
 */
export const openCashDrawer = async () => {
  try {
    // 1. Conectar con el programa QZ Tray local (localhost) silenciosamente
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect({ retries: 2, delay: 1 });
    }

    // 2. Localizar la impresora térmica predeterminada en Windows/Mac
    // Alternativamente se puede buscar una específica ej: qz.printers.find("POS-80")
    const printerName = await qz.printers.getDefault();
    console.log("QZ Tray localizó la impresora predeterminada:", printerName);

    const config = qz.configs.create(printerName);

    // 3. Comando ESC/POS para la gaveta: ESC p m t1 t2
    // m=0 (pin 2), t1=25, t2=250
    // En formato HEX de bytes
    const pulseData = [
      '\x1B' + '\x70' + '\x00' + '\x19' + '\xFA'
    ];

    // 4. Enviar los datos directamente a la impresora
    await qz.print(config, pulseData);
    console.log("Señal de gaveta enviada excitósamente mediante QZ Tray");

  } catch (error) {
    console.error("Error abriendo la gaveta con QZ Tray:", error);
    // Recomendación: No desconectar el websocket si hay error o si se va a seguir usando con frecuencia, 
    // QZ lo maneja solo.
  }
};
