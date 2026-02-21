import { useState, useEffect, useRef, memo, useMemo } from "react";
import { FaCaretUp } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";

const Pagination = memo(({ data, totalPages, currentPage, onPageChange, onEdit, onDelete }) => {
  const [open, setOpen] = useState(null);
  const dropdownRef = useRef(null);

  const userData = useMemo(() => JSON.parse(localStorage.getItem("userData") || "null"), []);
  const admin = userData?.cargo === "Administrador";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePrev = () => onPageChange(Math.max(currentPage - 1, 1));
  const handleNext = () => onPageChange(Math.min(currentPage + 1, totalPages));

  return (
    <div className="w-full ">
      <div className="overflow-x-auto pb-16 border-0 rounded-lg">
        <table className=" min-w-full text-left text-sm font-light rounded-md shadow-lg border border-sky-700 dark:border-slate-800">
          <thead className="border-b dark:border-slate-800 font-medium bg-sky-700 dark:bg-slate-900 text-white rounded-t-lg">
            <tr>
              <th className="px-3 py-4">N°</th>
              <th className="px-3 py-4 ">Nombre Cliente</th>
              <th className="px-3 py-4">Fecha de Recepción</th>
              <th className="px-3 py-4">Cantidad</th>
              <th className="px-3 py-4">Descripción</th>
              <th className="px-3 py-4">Estado</th>
              {admin && (
                <>
                  <th className="px-3 py-4">Total</th>
                  <th className="px-3 py-4">A cuenta</th>
                  <th className="px-3 py-4">Saldo</th>
                </>
              )}
              <th className="px-3 py-4">Editar</th>
            </tr>
          </thead>
          <tbody className="rounded-b-lg text-sky-900 dark:text-slate-100 bg-white dark:bg-slate-950">
            {data.map((cont) => (
              <tr key={cont.id} className="border-b border-sky-700 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors">
                <td className="whitespace-nowrap px-3 py-4 font-medium">
                  {cont.id}
                </td>
                <td className="whitespace-nowrap px-3 py-4 ">{cont.nombre}</td>
                <td className="whitespace-nowrap px-3 py-4 ">
                  {new Date(cont.createdAt).toLocaleDateString("es-PE")}
                </td>
                <td className="whitespace-nowrap px-3 py-4 ">
                  {cont.cantidad}
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  {cont.descripcion}
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <span
                    className={`px-3 py-2 rounded-full font-bold text-white ${
                      cont.estado === "Pendiente"
                        ? "bg-rose-500"
                        : cont.estado === "Diseño"
                        ? "bg-orange-500"
                        : cont.estado === "Impresión"
                        ? "bg-blue-500"
                        : cont.estado === "Terminado"
                        ? "bg-green-500"
                        : cont.estado === "Entregado"
                        ? "bg-gray-500"
                        : "bg-black"
                    }`}
                  >
                    {cont.estado}
                  </span>
                </td>
                {admin && (
                  <>
                    <td className="whitespace-nowrap px-6 py-4">
                      S./ {parseFloat(cont.total).toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      S./ {cont.acuenta}.00
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      S./ {(cont.total - cont.acuenta).toFixed(2)}
                    </td>
                  </>
                )}

                <td className="relative whitespace-nowrap px-6 py-4">
                  <button
                    onClick={() => setOpen(open === cont.id ? null : cont.id)}
                    className="rounded-md w-10 h-10 bg-sky-700 dark:bg-slate-800 text-white hover:bg-sky-500 dark:hover:bg-slate-700 transition-colors flex items-center justify-center cursor-pointer border dark:border-slate-700"
                  >
                    <FaCaretUp />
                  </button>

                  {open === cont.id && (
                    <div
                      ref={dropdownRef}
                      className=" absolute flex flex-col z-50 top-14 right-6 lg:right-10 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md shadow-lg w-36 text-sm animate-fade-down animate-duration-100 animate-ease-in overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          onEdit(cont.id);
                          setOpen(null);
                        }}
                        className="w-full text-left text-md px-4 py-2 hover:bg-sky-100 dark:hover:bg-slate-800 text-sky-700 dark:text-slate-200 flex gap-2 items-center cursor-pointer transition-colors"
                      >
                        <CiEdit className="w-5 h-5" />
                        Editar
                      </button>

                      {admin && (
                        <button
                          onClick={() => {
                            onDelete(cont.id);
                            setOpen(null);
                          }}
                          className="w-full text-left text-md  px-4 py-2 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-red-600 dark:text-red-400 flex gap-2 items-center cursor-pointer transition-colors"
                        >
                          <MdDelete className="w-5 h-5" />
                          Eliminar
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-4 gap-4">
            <button
              className="px-4 py-1 bg-sky-700 dark:bg-slate-800 text-white rounded disabled:opacity-50 cursor-pointer hover:bg-sky-600 dark:hover:bg-slate-700 transition-all font-bold border dark:border-slate-700"
              onClick={handlePrev}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span className="text-sky-700 dark:text-slate-100 font-bold">
              Página {currentPage} de {totalPages}
            </span>
            <button
              className="px-4 py-1 bg-sky-700 dark:bg-slate-800 text-white rounded disabled:opacity-50 cursor-pointer hover:bg-sky-600 dark:hover:bg-slate-700 transition-all font-bold border dark:border-slate-700"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default Pagination;
