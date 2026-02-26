import { useState, useEffect, useRef, memo, useMemo } from "react";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { IoEllipsisVertical } from "react-icons/io5";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

const STATUS_STYLES = {
  Pendiente: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800",
    dot: "bg-rose-500",
  },
  "Diseño": {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
    dot: "bg-orange-500",
  },
  "Impresión": {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500",
  },
  Terminado: {
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-600 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
    dot: "bg-green-500",
  },
  Entregado: {
    bg: "bg-gray-50 dark:bg-gray-900/30",
    text: "text-gray-600 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-700",
    dot: "bg-gray-500",
  },
};

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrev = () => onPageChange(Math.max(currentPage - 1, 1));
  const handleNext = () => onPageChange(Math.min(currentPage + 1, totalPages));

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/50">
                <th className="px-3 md:px-5 py-3 md:py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                  N
                </th>
                <th className="px-3 md:px-5 py-3 md:py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                  Cliente
                </th>
                <th className="hidden md:table-cell px-3 md:px-5 py-3 md:py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                  Fecha
                </th>
                <th className="hidden md:table-cell px-3 md:px-5 py-3 md:py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                  Cantidad
                </th>
                <th className="px-3 md:px-5 py-3 md:py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                  Descripcion
                </th>
                <th className="px-3 md:px-5 py-3 md:py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                  Estado
                </th>
                {admin && (
                  <>
                    <th className="hidden lg:table-cell px-3 md:px-5 py-3 md:py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest text-right">
                      Total
                    </th>
                    <th className="hidden lg:table-cell px-3 md:px-5 py-3 md:py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest text-right">
                      A Cuenta
                    </th>
                    <th className="px-3 md:px-5 py-3 md:py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest text-right">
                      Saldo
                    </th>
                  </>
                )}
                <th className="px-3 md:px-5 py-3 md:py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
              {data.map((cont) => {
                const statusStyle = STATUS_STYLES[cont.estado] || STATUS_STYLES.Pendiente;
                const saldo = cont.total - cont.acuenta;

                return (
                  <tr
                    key={cont.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="whitespace-nowrap px-3 md:px-5 py-3 md:py-4">
                      <span className="text-xs font-black text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg">
                        #{cont.id}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 md:px-5 py-3 md:py-4 font-bold text-gray-800 dark:text-slate-100 text-xs md:text-sm">
                      {cont.nombre}
                    </td>
                    <td className="hidden md:table-cell whitespace-nowrap px-3 md:px-5 py-3 md:py-4 text-gray-500 dark:text-slate-400 text-xs font-medium">
                      {new Date(cont.createdAt).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="hidden md:table-cell whitespace-nowrap px-3 md:px-5 py-3 md:py-4 text-gray-700 dark:text-slate-300 font-medium">
                      {cont.cantidad}
                    </td>
                    <td
                      className="px-3 md:px-5 py-3 md:py-4 text-gray-600 dark:text-slate-400 max-w-[120px] md:max-w-[200px] truncate text-xs md:text-sm"
                      title={cont.descripcion}
                    >
                      {cont.descripcion}
                    </td>
                    <td className="whitespace-nowrap px-3 md:px-5 py-3 md:py-4">
                      <span
                        className={`inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                        {cont.estado}
                      </span>
                    </td>
                    {admin && (
                      <>
                        <td className="hidden lg:table-cell whitespace-nowrap px-3 md:px-5 py-3 md:py-4 text-right font-bold text-gray-800 dark:text-slate-100">
                          S/. {parseFloat(cont.total).toFixed(2)}
                        </td>
                        <td className="hidden lg:table-cell whitespace-nowrap px-3 md:px-5 py-3 md:py-4 text-right text-gray-500 dark:text-slate-400 font-medium">
                          S/. {parseFloat(cont.acuenta).toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-3 md:px-5 py-3 md:py-4 text-right">
                          <span
                            className={`font-black text-xs md:text-sm ${
                              saldo > 0
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          >
                            S/. {saldo.toFixed(2)}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="relative whitespace-nowrap px-3 md:px-5 py-3 md:py-4 text-center">
                      <button
                        onClick={() => setOpen(open === cont.id ? null : cont.id)}
                        className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400 transition-all flex items-center justify-center cursor-pointer mx-auto"
                      >
                        <IoEllipsisVertical />
                      </button>

                      {open === cont.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute flex flex-col z-50 top-12 md:top-14 right-2 md:right-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-xl w-36 md:w-40 text-sm animate-fade-down animate-duration-100 animate-ease-in overflow-hidden"
                        >
                          <button
                            onClick={() => {
                              onEdit(cont.id);
                              setOpen(null);
                            }}
                            className="w-full text-left px-3 md:px-4 py-2.5 md:py-3 hover:bg-sky-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 flex gap-2 items-center cursor-pointer transition-colors font-medium"
                          >
                            <CiEdit className="w-5 h-5 text-sky-600" />
                            Editar
                          </button>
                          {admin && (
                            <button
                              onClick={() => {
                                onDelete(cont.id);
                                setOpen(null);
                              }}
                              className="w-full text-left px-3 md:px-4 py-2.5 md:py-3 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-red-600 dark:text-red-400 flex gap-2 items-center cursor-pointer transition-colors font-medium"
                            >
                              <MdDelete className="w-5 h-5" />
                              Eliminar
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 md:px-5 py-3 md:py-4 border-t border-gray-100 dark:border-slate-800">
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500">
              Pagina {currentPage} de {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
              >
                <FaChevronLeft className="text-xs" />
              </button>

              {getPageNumbers().map((pageNum, idx) =>
                pageNum === "..." ? (
                  <span
                    key={`dots-${idx}`}
                    className="px-1.5 md:px-2 text-gray-400 dark:text-slate-500 text-xs font-bold"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-8 h-8 md:w-9 md:h-9 rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-sky-700 text-white shadow-md shadow-sky-900/20"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
              >
                <FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default Pagination;
