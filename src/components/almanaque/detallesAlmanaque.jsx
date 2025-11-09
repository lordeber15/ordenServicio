import { useState, useEffect, useMemo } from "react";
import Drawer from "../drawer";
import { CiSearch } from "react-icons/ci";
import DatosEmpresa from "../datosEmpresa";
import AgregarItemTabla from "../agregarItemTabla";
import AgregarItemsTabla from "../agregarItemsTabla";
import ImporteLetras from "../../pages/Almanaques/numeroAletra";
import { useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAlmanaqueById, updateAlmanaque } from "../../request/almanaques";
import TablaDetalleAlmanaque from "./tabladetallealmanque";
import toast from "react-hot-toast";

function DetallesAlmanaque() {
  const [requestAlmanaque, setRequestAlmanaque] = useState("");
  const [selectDocumento, setSelectDocumento] = useState("");
  const [nombreAlmanaque, setNombreAlmanaque] = useState("");
  const [items, setItems] = useState([]);
  const [fechaEmision, setFechaEmision] = useState("");
  const [aCuenta, setACuenta] = useState(0);
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
    const saldo = total - aCuenta;

    return { opeGravada, igv, total, saldo };
  }, [items, aCuenta]);

  const mutation = useMutation({
    mutationFn: ({ id, data }) => updateAlmanaque(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["almanaque", id]);
      toast.success("✅ Almanaque actualizado correctamente");
    },
    onError: (error) => {
      console.error("❌ Error al actualizar:", error);
      console.error("📦 Response:", error?.response?.data);
      toast.error("❌ Error al actualizar el almanaque");
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
      setACuenta(Number(dataAlmanaque.aCuenta || 0));
    }
  }, [dataAlmanaque]);
  if (isLoading) return <p className="p-4">Cargando almanaque...</p>;
  if (error) return <p className="p-4 text-red-500">Error al cargar datos</p>;

  const handleActualizar = () => {
    if (!id) {
      toast.error("No se encontró el ID del almanaque");
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
      aCuenta: aCuenta.toFixed(2),
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
    <div className="w-screen">
      <div className="px-12 py-4 ">
        <div className="flex justify-start gap-5 items-center ">
          <Drawer />
          <div className="text-2xl font-bold">Almanaque</div>
        </div>
        <div className="flex justify-center items-center w-full p-2">
          <div className="flex flex-col md:flex-row  w-full">
            <DatosEmpresa />
            <div className="p-2 flex  justify-center items-center flex-col border-2 border-gray-300 border-dashed">
              <div className="text-lg font-bold">RUC: 20608582011</div>
              <div className="font-bold text-lg py-2 text-center">
                Notas de Pedido Almanaque
              </div>
              <div className="flex  px-2 gap-2 items-center">
                <p>NPA</p>
                -
                <input
                  type="number"
                  className="p-2 w-full"
                  disabled
                  value={id}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="py-2 flex gap-2 flex-col">
          <div className="w-full flex-col md:flex-row flex gap-2">
            <input
              type="text"
              className="w-full md:w-1/2 bg-gray-200 rounded-md p-2"
              placeholder="Nombre Cliente"
              value={nombreAlmanaque}
              onChange={(e) => setNombreAlmanaque(e.target.value)}
            />
            <div className="w-full md:w-1/2 flex flex-row">
              <select
                onChange={handleSelectDcument}
                value={selectDocumento || "DNI"}
                className="p-2 mr-2 w-1/2"
              >
                <option value="Sin Documento">Sin Documento</option>
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="CPP - Carné Temporal de Permanencia">
                  CPP - Carné Temporal de Permanencia
                </option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Canet de Extranjeria">
                  Canet de Extranjeria
                </option>
                <option value="TAM - Tarjeta Andina de  Migración">
                  TAM - Tarjeta Andina de Migración{" "}
                </option>
                <option value="Cedula Diplomatica">Cedula Diplomatica</option>
              </select>
              <input
                type="text"
                disabled={selectDocumento == "Sin Documento" ? true : false}
                className="bg-gray-200 rounded-l-md p-2 w-full"
                placeholder="Numero de Documento"
                value={requestAlmanaque}
                onChange={(e) => {
                  e.preventDefault, setRequestAlmanaque(e.target.value);
                }}
              />
              <button
                onClick={handleBuscarAlmanaque}
                className="w-fit cursor-pointer bg-gray-200 rounded-r-md p-2"
              >
                <CiSearch />
              </button>
            </div>
          </div>
          <div className="flex-col md:flex-row flex gap-2">
            <input
              type="text"
              className="bg-gray-200 p-2 rounded-md w-full md:w-1/2"
              placeholder="Dirección (Opcional)"
            />
            <div className="flex w-full md:w-1/2">
              <label className="flex items-center w-full mr-2">
                Fecha de Emision
              </label>
              <input
                type="date"
                className="p-2 bg-gray-200 rounded-md w-full text-gray-500"
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
          <div className="flex flex-wrap gap-2 justify-end">
            <div className="flex justify-end">
              <div className="flex items-center pr-2">Sub Total</div>
              <input
                type="text"
                disabled
                value={totales.opeGravada.toFixed(2)}
                className="bg-gray-200 rounded-md p-2"
              />
            </div>
            <div className="flex justify-end">
              <div className="flex items-center pr-2">IGV</div>
              <input
                type="text"
                disabled
                value={totales.igv.toFixed(2)}
                className="bg-gray-200 rounded-md p-2"
              />
            </div>
            <div className="flex justify-end">
              <div className="flex items-center pr-2">Importe Total</div>
              <input
                type="text"
                disabled
                value={totales.total.toFixed(2)}
                className="bg-gray-200 rounded-md p-2"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <div className="flex justify-end">
              <div className="flex items-center pr-2">A cuenta</div>
              <input
                type="number"
                value={aCuenta}
                onChange={(e) =>
                  setACuenta(e.target.value === "" ? 0 : Number(e.target.value))
                }
                className="bg-gray-200 rounded-md p-2"
              />
            </div>
            <div className="flex justify-end">
              <div className="flex items-center pr-2">Saldo</div>
              <input
                type="text"
                disabled
                value={totales.saldo.toFixed(2)}
                className="bg-gray-200 rounded-md p-2"
              />
            </div>
          </div>
          <hr className="bg-gray-200" />
          <ImporteLetras letras={totales.total} />
          <div className="flex justify-end">
            <button
              onClick={handleActualizar}
              className="bg-sky-700 rounded-md p-2 w-1/3 md:w-1/5 text-white cursor-pointer"
            >
              {mutation.isLoading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetallesAlmanaque;
