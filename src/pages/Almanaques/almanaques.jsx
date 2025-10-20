import Drawer from "../../components/drawer";
import DatosEmpresa from "../../components/datosEmpresa";
import { CiSearch } from "react-icons/ci";
import TablaProductos from "../../components/tablaProductos";
import { useState, useEffect } from "react";
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
        fechaEmision: new Date().toISOString().split("T")[0],
        precioTotal: totales.total.toFixed(2),
        detalles: items.map((item) => ({
          cantidad: item.cantidad,
          descripcion: item.almanaque || item.descripcion,
          precioUnitario: item.precio,
          subtotal: item.precio,
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
    } catch (error) {
      console.error("❌ Error al emitir ticket de Almanaque:", error);
      toast.error("No se pudo guardar el ticket de Almanaque 😞");
    }
  };

  const totales = useMemo(() => {
    console.log("🔄 Recalculando totales...");

    // 1️⃣ Sumar todos los precios (importe total)
    const total = items.reduce(
      (acc, item) => acc + Number(item.precio || 0),
      0
    );

    // 2️⃣ Calcular operación gravada
    const opeGravada = total / 1.18;

    // 3️⃣ Calcular IGV
    const igv = opeGravada * 0.18;

    return { opeGravada, igv, total };
  }, [items]);

  const { data: dataReniec, refetch } = useQuery({
    queryKey: ["reniec", requestAlmanaque],
    queryFn: () => getReniec(requestAlmanaque),
    enabled: false, // 👈 solo se ejecuta manualmente
    onSuccess: (data) => {
      setNombreAlmanaque(data?.nombres || "");
    },
  });
  const handleBuscarAlmanaque = () => {
    if (requestAlmanaque.trim().length > 0) {
      refetch();
    }
  };
  const handleSelectDcument = (e) => {
    setSelectDocumento(e.target.value);
  };
  useEffect(() => {
    if (dataReniec) {
      const nombreCompleto = `${dataReniec.nombres} ${dataReniec.apellidoPaterno} ${dataReniec.apellidoMaterno}`;
      setNombreAlmanaque(nombreCompleto);
    }
  }, [dataReniec]);

  return (
    <div className="px-12 py-4 w-screen">
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
              <input type="number" className="p-2 w-full" />
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
              defaultValue="DNI"
              className="p-2 mr-2 w-1/2"
            >
              <option value="Sin Documento">Sin Documento</option>
              <option value="DNI">DNI</option>
              <option value="RUC">RUC</option>
              <option value="CPP - Carné Temporal de Permanencia">
                CPP - Carné Temporal de Permanencia
              </option>
              <option value="Pasaporte">Pasaporte</option>
              <option value="Canet de Extranjeria">Canet de Extranjeria</option>
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
        <div className="flex flex-col gap-2 justify-end">
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
        <hr className="bg-gray-200" />
        <ImporteLetras letras={totales.total} />
        <div className="flex justify-end">
          <button
            onClick={handleEmitir}
            className="bg-sky-700 rounded-md p-2 w-1/3 md:w-1/5 text-white cursor-pointer"
          >
            Emitir
          </button>
        </div>
      </div>
    </div>
  );
}

export default Almanaques;
