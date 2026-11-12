/** Estilos y utilidades compartidas del panel de pagos Yape/Plin. */
export const claseInput =
  "border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-sky-500";
export const claseBoton =
  "px-3 py-2 rounded-lg text-sm font-medium bg-sky-700 text-white hover:bg-sky-600 disabled:opacity-50 cursor-pointer transition-colors";

/** Aviso sonoro corto (WebAudio, sin archivos). El navegador puede bloquearlo hasta el primer clic. */
export function sonarAviso() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    osc.onended = () => ctx.close();
  } catch {
    // Sin audio disponible: el aviso visual basta.
  }
}
