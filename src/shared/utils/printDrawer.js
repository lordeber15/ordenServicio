/**
 * Utilidad WebUSB para control de Impresora Térmica ESC/POS desde el Navegador.
 * Permite enviar bytes crudos a la impresora para abrir la gaveta RJ11.
 * 
 * Nota: Solo funciona en navegadores Chromium (Chrome, Edge, Opera) y 
 * requiere que la página se sirva bajo HTTPS o localhost.
 */

export const openCashDrawerWebUSB = async () => {
  try {
    // 1. Pedir al usuario que seleccione la impresora (muestra popup si es la 1ra vez)
    // Filtramos por una clase común de impresoras pero se puede dejar vacío: { filters: [] }
    const device = await navigator.usb.requestDevice({ filters: [] });

    console.log("Impresora seleccionada:", device.productName);

    // 2. Abrir conexión y reclamar la interfaz
    await device.open();
    
    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }
    
    // Asumimos la interfaz 0 (suele ser la de impresión)
    await device.claimInterface(0);

    // 3. Encontrar el Endpoint de salida (Output)
    let endpointOut = null;
    const interfaces = device.configuration.interfaces;
    
    // Buscamos el endpoint bulk hacia afuera (out)
    for (const iface of interfaces) {
      const alternates = iface.alternates;
      for (const alt of alternates) {
        for (const ep of alt.endpoints) {
          if (ep.direction === "out" && ep.type === "bulk") {
            endpointOut = ep.endpointNumber;
            break;
          }
        }
        if (endpointOut !== null) break;
      }
      if (endpointOut !== null) break;
    }

    if (endpointOut === null) {
      throw new Error("No se encontró un endpoint de salida USB (Bulk Out) en la impresora.");
    }

    // 4. Secuencia ESC/POS para abrir gaveta
    // Pin 2 o 5, variaciones comunes:
    // ESC p m t1 t2 
    // m=0 (pin 2), t1=25 (pulso de 50ms), t2=250 (descanso 500ms)
    // 0x1B, 0x70, 0x00, 0x19, 0xFA
    const pulseCommand = new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0xFA]);

    // 5. Enviar bytes
    const result = await device.transferOut(endpointOut, pulseCommand);
    
    if (result.status === "ok") {
      console.log("Señal de apertura enviada con éxito.");
    }
    
    // 6. Cerrar limpio
    await device.releaseInterface(0);
    await device.close();
    
    return true;
  } catch (error) {
    console.error("Error abriendo gaveta por WebUSB:", error);
    // Errores típicos: El usuario cancela el popup, falta de permisos SO, dispositivo en uso por Windows
    return false;
  }
};
