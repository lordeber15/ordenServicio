import Drawer from "../../components/drawer";
import DatosEmpresa from "../../components/datosEmpresa";
import { CiSearch } from "react-icons/ci";
import TablaProductos from "../../components/tablaProductos";

function Boleta() {
  return (
    <div className="px-12 py-4 w-screen">
      <div className="flex justify-start gap-5 items-center ">
        <Drawer />
        <div className="text-2xl font-bold">Emitir Boleta</div>
      </div>
      <div className="flex justify-center items-center w-full p-2">
        <div className="flex flex-col md:flex-row  w-full">
          <DatosEmpresa />
          <div className="p-3 flex  justify-center items-center flex-col border-2 border-gray-300 border-dashed">
            <div className="text-2xl font-bold">RUC: 20608582011</div>
            <div className="font-bold text-2xl text-center">
              Boleta de Venta Electronica
            </div>
            <div className="flex px-2 gap-2 items-center">
              <p>B001</p>
              -
              <input type="number" className="p-2" />
            </div>
          </div>
        </div>
      </div>
      <div className="py-2 flex gap-2 flex-col">
        <div className="w-full flex gap-2">
          <input
            type="text"
            className="w-1/2 bg-gray-200 rounded-md p-2"
            placeholder="Cliente"
          />
          <div className="w-1/2 flex flex-row">
            <select name="Documentos" id="Documentos" className="p-2  mr-2">
              <option>Sin Documento</option>
              <option>DNI</option>
              <option>RUC</option>
            </select>
            <input
              type="text"
              className="bg-gray-200 rounded-l-md p-2 w-full"
              placeholder="Numero de Documento"
            />
            <button className="w-fit cursor-pointer bg-gray-200 rounded-r-md p-2">
              <CiSearch />
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="bg-gray-200 p-2 rounded-md w-1/2"
            placeholder="Dirección (Opcional)"
          />
          <div className="flex w-1/2">
            <label className="flex items-center w-full mr-2">
              Fecha de Emision
            </label>
            <input
              type="date"
              className="p-2 bg-gray-200 rounded-md w-full text-gray-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            name="ventas"
            id="ventas"
            className="p-2 w-1/2 bg-gray-200 rounded-md text-gray-500"
          >
            <option value="venta">
              Venta Interna {"(productos/servicios)"}
            </option>
          </select>
          <div className="w-1/2 text-right">PEN - {"(S/) Sol"}</div>
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
        <div className="flex py-2 gap-2 items-center justify-center">
          <div className="w-1/5">Importe en Letras</div>
          <input
            className=" p-2 uppercase w-full text-gray-400"
            disabled
            defaultValue={"Ciento Treinta con 00/100 soles"}
          />
        </div>
        <div className="flex justify-end">
          <button className="bg-sky-700 rounded-md p-2 w-1/5 text-white cursor-pointer">
            Emitir Boleta
          </button>
        </div>
      </div>
    </div>
  );
}

export default Boleta;
