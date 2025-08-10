import { IoIosAdd } from "react-icons/io";
import yape from "../assets/yape.svg";
import efectivo from "../assets/efectivo.png";
import { useState } from "react";
import ModalIngreso from "./modalIngreso";

function Tablaingresosegresos({ ingresosyegresos = [], titulo }) {
  const total = ingresosyegresos.reduce(
    (acc, item) => acc + parseFloat(item.monto || 0),
    0
  );
  const [openModalI, setOpenModalI] = useState(false);
  const handleOpenModal = () => setOpenModalI(true);
  const handleCloseModal = () => setOpenModalI(false);

  return (
    <div className="overflow-auto rounded-t-md">
      <table className="min-w-full border border-sky-700 divide-y divide-sky-700">
        <thead className="bg-sky-700 text-white">
          <tr>
            <th className="px-4 py-2 text-center text-sm font-semibold">
              descripcion
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Monto</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Pago</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {ingresosyegresos ? (
            ingresosyegresos.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="text-center px-4 py-2 text-sm text-gray-800">
                  {item.descripcion}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  S/ {item.monto}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {item.metodo == "efectivo" ? (
                    <img src={efectivo} className="w-6" />
                  ) : (
                    <img src={yape} className="w-6" />
                  )}
                </td>
              </tr>
            ))
          ) : (
            <div>no hay datos</div>
          )}
          <tr>
            <td className="text-center font-bold px-4 py-2 text-sm text-gray-800">
              Total
            </td>
            <td className="px-4 py-2 text-sm font-bold text-gray-800">
              S/ {total.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
      <button
        onClick={handleOpenModal}
        className="border rounded-lg mt-1 p-2 w-full font-bold flex justify-center border-dotted items-center gap-1 cursor-pointer hover:border-sky-700 hover:text-sky-700"
      >
        <IoIosAdd />
        Agregar
      </button>
      {openModalI && (
        <ModalIngreso
          titulo={titulo}
          isOpen={openModalI}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default Tablaingresosegresos;
