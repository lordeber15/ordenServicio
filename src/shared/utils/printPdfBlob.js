/**
 * Imprime un PDF blob usando un iframe oculto.
 *
 * Usa el evento `afterprint` para limpiar el iframe solo después de que
 * el diálogo de impresión se cierre (compatible con Windows y macOS).
 * Incluye un fallback de 60 segundos por si `afterprint` no se dispara.
 *
 * @param {Blob|ArrayBuffer} blob - El PDF a imprimir.
 */
export const printPdfBlob = (blob) => {
  const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;
  document.body.appendChild(iframe);

  const cleanup = () => {
    try { document.body.removeChild(iframe); } catch { /* ya removido */ }
    URL.revokeObjectURL(url);
  };

  iframe.onload = () => {
    const win = iframe.contentWindow;

    // Limpiar cuando el diálogo de impresión se cierre
    win.addEventListener("afterprint", cleanup, { once: true });

    // Fallback: si afterprint nunca se dispara (algunos navegadores/OS)
    setTimeout(cleanup, 60_000);

    win.print();
  };
};
