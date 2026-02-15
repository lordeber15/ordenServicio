import { useState, useEffect } from "react";

// Función para convertir número a letras en soles
const numeroALetras = (num) => {
  const unidades = [
    "",
    "UNO",
    "DOS",
    "TRES",
    "CUATRO",
    "CINCO",
    "SEIS",
    "SIETE",
    "OCHO",
    "NUEVE",
  ];
  const decenas = [
    "",
    "DIEZ",
    "VEINTE",
    "TREINTA",
    "CUARENTA",
    "CINCUENTA",
    "SESENTA",
    "SETENTA",
    "OCHENTA",
    "NOVENTA",
  ];
  const centenas = [
    "",
    "CIENTO",
    "DOSCIENTOS",
    "TRESCIENTOS",
    "CUATROCIENTOS",
    "QUINIENTOS",
    "SEISCIENTOS",
    "SETECIENTOS",
    "OCHOCIENTOS",
    "NOVECIENTOS",
  ];

  if (!num || num === 0) return "CERO SOLES CON 00/100";

  const entero = Math.floor(num);
  const centavos = Math.round((num - entero) * 100);

  const convertirCentenas = (n) => {
    if (n === 100) return "CIEN";
    let texto = "";
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (c > 0) texto += centenas[c] + " ";
    if (d === 1 && u > 0)
      return texto + ["ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE"][u - 1];
    if (d === 1 && u === 0) return texto + "DIEZ";
    if (d > 1) texto += decenas[d] + (u > 0 ? " Y " + unidades[u] : "");
    else if (u > 0) texto += unidades[u];
    return texto.trim();
  };

  const miles = Math.floor(entero / 1000);
  const resto = entero % 1000;
  let texto = "";

  if (miles > 0) {
    texto += (miles === 1 ? "MIL" : convertirCentenas(miles) + " MIL") + " ";
  }
  if (resto > 0) texto += convertirCentenas(resto);

  texto =
    texto.trim() +
    " SOLES CON " +
    centavos.toString().padStart(2, "0") +
    "/100";
  return texto;
};

export default function ImporteLetras({ letras = 0 }) {
  const [importeEnLetras, setImporteEnLetras] = useState("");

  useEffect(() => {
    setImporteEnLetras(numeroALetras(letras));
  }, [letras]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col md:flex-row py-2 gap-2 items-center justify-center">
        <div className="w-full md:w-1/5">Importe en Letras</div>
        <input
          className="p-2 uppercase w-full text-gray-400"
          disabled
          value={importeEnLetras}
        />
      </div>
    </div>
  );
}
