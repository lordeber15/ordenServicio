import Drawer from "../../components/drawer";
import DatosEmpresa from "../../components/datosEmpresa";
import { CiSearch } from "react-icons/ci";
import TablaProductos from "../../components/tablaProductos";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getReniec } from "../../request/reniec";
import AgregarItemTabla from "../../components/agregarItemTabla";

function Ticket() {
  const dataTable = [
    /*{
      codigo: "P001",
      descripcion: "Producto A",
      unidad: "unidad",
      precio: 10.5,
    },
    {
      codigo: "P002",
      descripcion: "Producto B",
      unidad: "paquete",
      precio: 23.0,
    },
    {
      codigo: "P003",
      descripcion: "Producto C",
      unidad: "caja",
      precio: 18.75,
    },*/
  ];

  const [requestCliente, setRequestCliente] = useState("");
  const [selectDocumento, setSelectDocumento] = useState("");
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
  const handleSelectDcument = (e) => {
    setSelectDocumento(e.target.value);
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
            <div className="text-lg font-bold">RUC: 20608582011</div>
            <div className="font-bold text-lg py-2 text-center">
              Ticket Electronico
            </div>
            <div className="flex  px-2 gap-2 items-center">
              <p>TK001</p>
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
            placeholder="Cliente"
            value={
              dataReniec
                ? `${dataReniec.nombres} ${dataReniec.apellidoPaterno} ${dataReniec.apellidoMaterno}`
                : ""
            }
            onChange={(e) => setNombreCliente(e.target.value)}
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
          {dataTable.length == 0 ? (
            <AgregarItemTabla />
          ) : (
            <TablaProductos data={dataTable} />
          )}
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
