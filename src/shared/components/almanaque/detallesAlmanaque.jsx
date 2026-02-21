import { useState, useEffect, useMemo } from "react";
import Drawer from "../drawer";
import { CiSearch } from "react-icons/ci";
import DatosEmpresa from "../datosEmpresa";
import AgregarItemTabla from "../agregarItemTabla";
import AgregarItemsTabla from "../agregarItemsTabla";
import ImporteLetras from "../../../modules/Almanaque/pages/numeroAletra";
import { useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAlmanaqueById, updateAlmanaque, getCotizacionPdf } from "../../../modules/Almanaque/services/almanaques";
import TablaDetalleAlmanaque from "./tabladetallealmanque";
import toast from "react-hot-toast";
import { FaPrint } from "react-icons/fa6";

function DetallesAlmanaque() {
  const [requestAlmanaque, setRequestAlmanaque] = useState("");
  const [selectDocumento, setSelectDocumento] = useState("");
  const [nombreAlmanaque, setNombreAlmanaque] = useState("");
  const [items, setItems] = useState([]);
  const [fechaEmision, setFechaEmision] = useState("");
  const [telefono, setTelefono] = useState("");
  const { id } = useParams();
  const queryClient = useQueryClient();
  const {
    data: dataAlmanaque,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["almanaque", id],
    queryFn: () => getAlmanaqueById(id),
    enabled: !!id, // solo ejecuta la consulta si hay id
  });

  const totales = useMemo(() => {
    const total = items.reduce(
      (acc, item) =>
        acc + Number(item.precioUnitario || 0) * Number(item.cantidad || 0),
      0
    );

    const opeGravada = total / 1.18;
    const igv = opeGravada * 0.18;

    return { opeGravada, igv, total };
  }, [items]);

  const mutation = useMutation({
    mutationFn: ({ id, data }) => updateAlmanaque(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["almanaque", id]);
      toast.success("Cotización actualizada correctamente");
    },
    onError: (error) => {
      console.error("Error al actualizar:", error);
      toast.error("Error al actualizar la cotización");
    },
  });

  const handleSelectDcument = (e) => {
    setSelectDocumento(e.target.value);
  };
  const handleBuscarAlmanaque = () => {};

  useEffect(() => {
    if (dataAlmanaque) {
      setNombreAlmanaque(dataAlmanaque.cliente);
      setSelectDocumento(dataAlmanaque.tipoDocumento);
      setRequestAlmanaque(dataAlmanaque.numeroDocumento);
      setFechaEmision(dataAlmanaque.fechaEmision?.split("T")[0] || "");
      setItems(
        (dataAlmanaque.detalles || []).map((d) => ({
          ...d,
          cantidad: Number(d.cantidad || 0),
          precioUnitario: Number(d.precioUnitario || 0),
        }))
      );
      setTelefono(dataAlmanaque.telefono || "");
    }
  }, [dataAlmanaque]);
  if (isLoading) return <p className="p-4">Cargando cotización...</p>;
  if (error) return <p className="p-4 text-red-500">Error al cargar datos</p>;

  const handlePrintPdf = async (format) => {
    try {
      const res = await getCotizacionPdf(id, format);
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow.print();
        setTimeout(() => { document.body.removeChild(iframe); URL.revokeObjectURL(url); }, 1000);
      };
    } catch (err) {
      toast.error("Error al generar PDF");
    }
  };

  const handleActualizar = () => {
    if (!id) {
      toast.error("No se encontró el ID de la cotización");
      return;
    }
    const payload = {
      cliente: nombreAlmanaque,
      tipoDocumento: selectDocumento || "Sin Documento",
      numeroDocumento: requestAlmanaque || "",
      fechaEmision,
      subtotal: totales.opeGravada.toFixed(2),
      igv: totales.igv.toFixed(2),
      precioTotal: totales.total.toFixed(2),
      aCuenta: 0,
      detalles: items.map((item) => ({
        // 👇 mantenemos TODO lo que traía el backend
        ...item,
        cantidad: Number(item.cantidad || 0),
        precioUnitario: Number(item.precioUnitario || 0),
        subtotal: (
          Number(item.cantidad || 0) * Number(item.precioUnitario || 0)
        ).toFixed(2),
      })),
    };
    console.log("📤 Payload UPDATE:", payload);
    mutation.mutate({ id, data: payload });
  };
  return (
    <div className="w-full">
      <div className="px-4 md:px-12 py-4">
        <div className="flex justify-start gap-5 items-center mb-6">
          <Drawer />
          <div className="text-3xl font-black text-sky-800 dark:text-slate-100 transition-colors tracking-tight">Detalle de Cotización</div>
        </div>
        <div className="flex justify-center items-center w-full p-2 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-6">
            <DatosEmpresa />
            <div className="p-6 flex justify-center items-center flex-col border-2 border-dashed border-gray-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 transition-colors shadow-sm">
              <div className="text-xl font-black text-gray-800 dark:text-slate-100">RUC: 20608582011</div>
              <div className="font-black text-2xl py-2 text-center text-sky-800 dark:text-slate-100 uppercase tracking-tighter">
                Cotización
              </div>
              <div className="flex px-4 py-2 bg-slate-100 dark:bg-slate-950 rounded-lg items-center mt-3 border dark:border-slate-800">
                <p className="text-sky-800 dark:text-slate-300 font-mono font-bold tracking-widest mr-2">COT</p>
                <span className="text-gray-400 mr-2">-</span>
                <input
                  type="text"
                  className="bg-transparent w-full text-slate-700 dark:text-slate-300 font-mono font-black text-lg focus:outline-none"
                  disabled
                  value={id}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="py-2 flex gap-4 flex-col mt-4">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-100 rounded-lg p-3 text-sm focus:outline-none focus:border-sky-500 transition-colors shadow-sm font-bold"
              placeholder="Nombre Cliente"
              value={nombreAlmanaque}
              onChange={(e) => setNombreAlmanaque(e.target.value)}
            />
            <div className="flex flex-row gap-2">
              <select
                onChange={handleSelectDcument}
                value={selectDocumento || "DNI"}
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
                  className="absolute right-2 top-2 p-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md cursor-pointer transition-colors"
                >
                  <CiSearch className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex-col md:flex-row flex gap-4">
            <input
              type="text"
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-100 rounded-lg p-3 w-full md:w-1/3 text-sm focus:outline-none focus:border-sky-500 transition-colors shadow-sm font-bold"
              placeholder="Dirección (Opcional)"
            />
            <input
              type="text"
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-100 rounded-lg p-3 w-full md:w-1/3 text-sm focus:outline-none focus:border-sky-500 transition-colors shadow-sm font-bold font-mono"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
            <div className="flex w-full md:w-1/3 items-center gap-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-1 px-3 shadow-sm transition-colors">
              <label className="whitespace-nowrap text-xs font-black uppercase text-gray-500 dark:text-slate-500 tracking-widest">
                Emisión
              </label>
              <input
                type="date"
                className="p-2 bg-transparent w-full text-gray-700 dark:text-slate-200 text-sm focus:outline-none font-bold"
                value={fechaEmision}
                onChange={(e) => setFechaEmision(e.target.value)}
              />
            </div>
          </div>

          <div className=" overflow-x-auto">
            {items.length == 0 ? (
              <AgregarItemTabla setItems={setItems} />
            ) : (
              <div>
                <TablaDetalleAlmanaque data={items} setItems={setItems} />
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

          <div className="border-t border-gray-100 dark:border-slate-800 pt-6 mt-4">
            <ImporteLetras letras={totales.total} />
            <div className="flex flex-col md:flex-row justify-center md:justify-end mt-8 gap-3">
              <button
                onClick={() => handlePrintPdf("a5")}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl p-4 text-white cursor-pointer font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 text-xs"
              >
                <FaPrint /> Imprimir A5
              </button>
              <button
                onClick={() => handlePrintPdf("a4")}
                className="flex items-center justify-center gap-2 bg-sky-800 hover:bg-sky-700 rounded-xl p-4 text-white cursor-pointer font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 text-xs"
              >
                <FaPrint /> Imprimir A4
              </button>
              <button
                onClick={handleActualizar}
                disabled={mutation.isLoading}
                className="bg-sky-700 hover:bg-sky-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl p-4 text-white cursor-pointer font-black uppercase tracking-[0.2em] shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {mutation.isLoading ? "Actualizando..." : "Actualizar Cotización"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetallesAlmanaque;
