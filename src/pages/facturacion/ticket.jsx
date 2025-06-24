import Drawer from "../../components/drawer";
import DatosEmpresa from "../../components/datosEmpresa";
import { CiSearch } from "react-icons/ci";
import TablaProductos from "../../components/tablaProductos";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getReniec } from "../../request/reniec";

function Ticket() {
  const [requestCliente, setRequestCliente] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const { data: dataReniec, refetch } = useQuery({
    queryKey: ["reniec", requestCliente],
    queryFn: () => getReniec(requestCliente),
    enabled: false, // 👈 solo se ejecuta manualmente
    onSuccess: (data) => {
      setNombreCliente(data?.nombres || "");
    },
  });
  const handleBuscarCliente = () => {
    if (requestCliente.trim().length > 0) {
      refetch();
    }
  };
  return (
    <div className="px-12 py-4 w-screen">
      <div className="flex justify-start gap-5 items-center ">
        <Drawer />
        <div className="text-2xl font-bold">Ticket</div>
      </div>
      <div className="flex justify-center items-center w-full p-2">
        <div className="flex flex-col md:flex-row  w-full">
          <DatosEmpresa />
          <div className="p-2 flex  justify-center items-center flex-col border-2 border-gray-300 border-dashed">
            <div className="text-2xl font-bold">RUC: 20608582011</div>
            <div className="font-bold text-2xl py-2 text-center">
              Ticket Electronico
            </div>
            <div className="flex px-2 gap-2 items-center">
              <p>TK001</p>
              -
              <input type="number" className="p-2" />
            </div>
          </div>
        </div>
      </div>
      <div className="py-2 flex gap-2 flex-col">
        <div className="w-full flex-col md:flex-row flex gap-2">
          <input
            type="text"
            className="w-full md:w-1/2 bg-gray-200 rounded-md p-2"
            placeholder="Cliente"
            value={
              dataReniec
                ? `${dataReniec.nombres} ${dataReniec.apellidoPaterno} ${dataReniec.apellidoMaterno}`
                : ""
            }
            onChange={(e) => setNombreCliente(e.target.value)}
          />
          <div className="w-full md:w-1/2 flex flex-row">
            <select name="Documentos" id="Documentos" className="p-2  mr-2">
              <option>Sin Documento</option>
              <option>DNI</option>
              <option>RUC</option>
            </select>
            <input
              type="text"
              className="bg-gray-200 rounded-l-md p-2 w-full"
              placeholder="Numero de Documento"
              value={requestCliente}
              onChange={(e) => setRequestCliente(e.target.value)}
            />
            <button
              onClick={handleBuscarCliente}
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
          <TablaProductos />
        </div>
        <div className="flex flex-col gap-2 justify-end">
          <div className="flex justify-end">
            <div className="flex items-center pr-2">Ope. Gravada</div>
            <input
              type="text"
              disabled
              className="bg-gray-200 rounded-md p-2"
            />
          </div>
          <div className="flex justify-end">
            <div className="flex items-center pr-2">IGV</div>
            <input
              type="text"
              disabled
              className="bg-gray-200 rounded-md p-2"
            />
          </div>
          <div className="flex justify-end">
            <div className="flex items-center pr-2">Importe Total</div>
            <input
              type="text"
              disabled
              className="bg-gray-200 rounded-md p-2"
            />
          </div>
        </div>
        <hr className="bg-gray-200" />
        <div className="flex flex-col md:flex-row py-2 gap-2 items-center justify-center">
          <div className="w-full md:w-1/5">Importe en Letras</div>
          <input
            className=" p-2 uppercase w-full text-gray-400"
            disabled
            defaultValue={"Ciento Treinta con 00/100 soles"}
          />
        </div>
        <div className="flex justify-end">
          <button className="bg-sky-700 rounded-md p-2 w-1/3 md:w-1/5 text-white cursor-pointer">
            Emitir Ticket
          </button>
        </div>
      </div>
    </div>
  );
}

export default Ticket;
