import { IoIosAdd } from "react-icons/io";
import yape from "../../assets/yape.svg";
import efectivo from "../../assets/efectivo.png";
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
    <div className="overflow-auto rounded-t-xl transition-colors">
      <table className="min-w-full border border-sky-700 dark:border-slate-800 divide-y divide-sky-700 dark:divide-slate-800">
        <thead className="bg-sky-700 dark:bg-slate-900 text-white">
          <tr>
            <th className="px-4 py-2 text-center text-sm font-semibold">
              descripcion
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Monto</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Pago</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
          {ingresosyegresos ? (
            ingresosyegresos.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors">
                <td className="text-center px-4 py-2 text-sm text-gray-800 dark:text-slate-200">
                  {item.descripcion}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-slate-200 font-mono">
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
            <td className="text-center font-bold px-4 py-3 text-sm text-gray-800 dark:text-slate-100 uppercase tracking-wider">
              Total
            </td>
            <td className="px-4 py-3 text-sm font-black text-gray-800 dark:text-slate-100 font-mono text-lg">
              S/ {total.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
      <button
        onClick={handleOpenModal}
        className="border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl mt-3 p-3 w-full font-bold flex justify-center items-center gap-2 cursor-pointer text-gray-400 dark:text-slate-500 hover:border-sky-600 dark:hover:border-slate-700 hover:text-sky-600 dark:hover:text-slate-400 transition-all"
      >
        <IoIosAdd className="text-xl" />
        Agregar {titulo}
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
