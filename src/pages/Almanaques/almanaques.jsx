import Drawer from "../../components/drawer";
import DatosEmpresa from "../../components/datosEmpresa";
import { CiSearch } from "react-icons/ci";
import TablaProductos from "../../components/tablaProductos";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getReniec } from "../../request/reniec";
import AgregarItemTabla from "../../components/agregarItemTabla";
import AgregarItemsTabla from "../../components/agregarItemsTabla";
import { useMemo } from "react";
import ImporteLetras from "./numeroAletra";
import { createAlmanaque } from "../../request/almanaques";
import toast from "react-hot-toast";

function Almanaques() {
  const [items, setItems] = useState([]);

  const [requestAlmanaque, setRequestAlmanaque] = useState("");
  const [selectDocumento, setSelectDocumento] = useState("");
  const [nombreAlmanaque, setNombreAlmanaque] = useState("");
  const [acuentaAlmanaque, setAcuentaAlmanaque] = useState(0);
  const [direccionAlmanaque, setdireccionAlmanaque] = useState("");
  console.log(nombreAlmanaque);
  console.log(direccionAlmanaque);

  const handleEmitir = async () => {
    try {
      if (!nombreAlmanaque || items.length === 0) {
        toast.error("Debes ingresar un cliente y al menos un ítem.");
        return;
      }

      const payload = {
        cliente: nombreAlmanaque,
        tipoDocumento: selectDocumento || "Sin Documento",
        numeroDocumento: requestAlmanaque || "",
        direccion: "", // si tienes este dato, agrégalo
        fechaEmision: new Date().toLocaleDateString('en-CA'),
        precioTotal: totales.total.toFixed(2),
        aCuenta: acuentaAlmanaque.toFixed(2) || 0,
        detalles: items.map((item) => ({
          cantidad: item.cantidad,
          descripcion: item.almanaque || item.descripcion,
          unidad: item.unidad || "UND",
          precioUnitario: item.precioUnitario,
        })),
      };

      // muestra un "loading" mientras se guarda
      const toastId = toast.loading("Guardando ticket...");

      const data = await createAlmanaque(payload);

      toast.success("Ticket emitido correctamente 🎉", { id: toastId });
      console.log("✅ Respuesta del servidor:", data);

      // limpia los datos del formulario
      setItems([]);
      setNombreAlmanaque("");
      setSelectDocumento("");
      setRequestAlmanaque("");
      setdireccionAlmanaque("");
      setAcuentaAlmanaque("");
    } catch (error) {
      console.error("❌ Error al emitir ticket de Almanaque:", error);
      toast.error("No se pudo guardar el ticket de Almanaque 😞");
    }
  };

  const totales = useMemo(() => {
    console.log("🔄 Recalculando totales...");

    // 1️⃣ Sumar todos los precios (importe total)
    const total = items.reduce(
      (acc, item) => acc + Number(item.precioUnitario * item.cantidad || 0),
      0
    );

    // 2️⃣ Calcular operación gravada
    const opeGravada = total / 1.18;

    // 3️⃣ Calcular IGV
    const igv = opeGravada * 0.18;

    const saldo = total - acuentaAlmanaque;

    return { opeGravada, igv, total, saldo };
  }, [items, acuentaAlmanaque]);

  const {
    data: dataReniec,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["reniec"],
    queryFn: () => getReniec(requestAlmanaque), // usa el estado actual
    enabled: false, // no se ejecuta automáticamente
    onSuccess: (data) => {
      if (!data) return;
      const nombreCompleto =
        `${dataReniec.nombres} ${dataReniec.apellidoPaterno} ${dataReniec.apellidoMaterno}`.trim();
      setNombreAlmanaque(nombreCompleto);
    },
  });
  const handleBuscarAlmanaque = () => {
    if (requestAlmanaque.trim().length > 0) {
      refetch();
    }
  };

  const handleaCuenta = (e) => {
    const value = e.target.value;
    setAcuentaAlmanaque(value === "" ? 0 : Number(value));
  };
  const handleSelectDcument = (e) => {
    setSelectDocumento(e.target.value);
  };

  return (
    <div className="w-screen">
      <div className="px-4 md:px-12 py-4">
        <div className="flex justify-start gap-5 items-center mb-6">
          <Drawer />
          <div className="text-3xl font-black text-sky-800 dark:text-slate-100 transition-colors tracking-tight">Almanaque</div>
        </div>
        <div className="flex justify-center items-center w-full p-2 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-6">
            <DatosEmpresa />
            <div className="p-6 flex justify-center items-center flex-col border-2 border-dashed border-gray-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 transition-colors shadow-sm">
              <div className="text-xl font-black text-gray-800 dark:text-slate-100">RUC: 20608582011</div>
              <div className="font-black text-2xl py-2 text-center text-sky-800 dark:text-slate-100 uppercase tracking-tighter">
                Notas de Pedido Almanaque
              </div>
              <div className="flex px-4 py-2 bg-slate-100 dark:bg-slate-950 rounded-lg items-center mt-3 border dark:border-slate-800">
                <p className="text-sky-800 dark:text-slate-300 font-mono font-bold tracking-widest mr-2">NPA</p>
                <span className="text-gray-400 mr-2">-</span>
                <input type="number" className="bg-transparent w-full text-gray-400 font-mono font-bold" disabled placeholder="Correlativo" />
              </div>
            </div>
          </div>
        </div>
        <div className="py-2 flex gap-4 flex-col mt-4">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-100 rounded-lg p-3 text-sm focus:outline-none focus:border-sky-500 transition-colors shadow-sm font-bold"
              placeholder="Nombre o Razón Social del Cliente"
              value={nombreAlmanaque}
              onChange={(e) => setNombreAlmanaque(e.target.value)}
            />
            <div className="flex flex-row gap-2">
              <select
                onChange={handleSelectDcument}
                defaultValue="DNI"
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-100 p-3 rounded-lg text-xs font-black uppercase tracking-widest shadow-sm focus:outline-none focus:border-sky-500 transition-colors w-1/2"
              >
                <option value="Sin Documento">Sin Documento</option>
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Canet de Extranjeria">Canet de Extranjeria</option>
                <option value="Cedula Diplomatica">Cedula Diplomatica</option>
              </select>
              <div className="relative flex-1">
                <input
                  type="text"
                  disabled={selectDocumento == "Sin Documento" ? true : false}
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-100 rounded-lg p-3 w-full text-sm focus:outline-none focus:border-sky-500 transition-colors shadow-sm font-mono font-bold disabled:opacity-50"
                  placeholder="Número de Documento"
                  value={requestAlmanaque}
                  onChange={(e) => setRequestAlmanaque(e.target.value)}
                />
                <button
                  onClick={handleBuscarAlmanaque}
                  className="absolute right-2 top-2 p-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded-md cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {isFetching ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <CiSearch className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex-col md:flex-row flex gap-4">
            <input
              type="text"
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-100 rounded-lg p-3 w-full md:w-1/2 text-sm focus:outline-none focus:border-sky-500 transition-colors shadow-sm font-bold"
              placeholder="Dirección (Opcional)"
            />
            <div className="flex w-full md:w-1/2 items-center gap-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-1 px-3 shadow-sm transition-colors">
              <label className="whitespace-nowrap text-xs font-black uppercase text-gray-500 dark:text-slate-500 tracking-widest">
                Emisión
              </label>
              <input
                type="date"
                className="p-2 bg-transparent w-full text-gray-700 dark:text-slate-200 text-sm focus:outline-none font-bold"
              />
            </div>
          </div>

          <div className=" overflow-x-auto">
            {items.length == 0 ? (
              <AgregarItemTabla setItems={setItems} />
            ) : (
              <div>
                <TablaProductos data={items} setItems={setItems} />
                <AgregarItemsTabla setItems={setItems} />
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-4 justify-end mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto">
              {[
                ["Sub Total", totales.opeGravada.toFixed(2)],
                ["IGV (18%)", totales.igv.toFixed(2)],
                ["Total", totales.total.toFixed(2), true]
              ].map(([label, val, highlighted]) => (
                <div key={label} className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</span>
                  <div className={`bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-3 w-full md:w-36 text-right text-sm font-mono font-bold shadow-sm ${highlighted ? "text-sky-700 dark:text-sky-400 bg-sky-50/50 dark:bg-slate-800/50 border-sky-200 dark:border-sky-800" : "text-gray-700 dark:text-slate-200"}`}>
                    S/ {val}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-end">
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto mt-2">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-1">A cuenta</span>
                <input
                  type="number"
                  value={acuentaAlmanaque}
                  onChange={handleaCuenta}
                  className="bg-white dark:bg-slate-950 border-2 border-emerald-100 dark:border-emerald-900/50 rounded-lg p-3 w-full md:w-36 text-right text-sm font-mono font-black text-emerald-700 dark:text-emerald-400 focus:outline-none focus:border-emerald-500 transition-all shadow-sm"
                />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-500 mb-1">Saldo</span>
                <div className="bg-white dark:bg-slate-950 border-2 border-rose-100 dark:border-rose-900/50 rounded-lg p-3 w-full md:w-36 text-right text-sm font-mono font-black text-rose-700 dark:text-rose-400 shadow-sm">
                  S/ {totales.saldo.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 dark:border-slate-800 pt-6 mt-4">
            <ImporteLetras letras={totales.total} />
            <div className="flex justify-center md:justify-end mt-8">
              <button
                onClick={handleEmitir}
                className="bg-sky-700 hover:bg-sky-600 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl p-4 w-full md:w-1/4 text-white cursor-pointer font-black uppercase tracking-[0.2em] shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Emitir Pedido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Almanaques;
