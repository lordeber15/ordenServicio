import { useState, useMemo } from "react";
import { Link } from "react-router";
import { TiThMenu } from "react-icons/ti";
import { IoExitOutline } from "react-icons/io5";

export default function Drawer() {
  const [isOpen, setIsOpen] = useState(false);

  const userData = useMemo(() => JSON.parse(localStorage.getItem("userData") || "null"), []);
  const isAdmin = userData?.cargo === "Administrador";
  const formatos = userData?.formatos || [];
  const canAccess = (key) => isAdmin || formatos.includes(key);

  const linkClass = "block cursor-pointer text-white hover:text-white p-2 rounded-md hover:bg-sky-600 dark:hover:bg-slate-700 transition-colors";

  return (
    <>
      <button
        className="p-2 bg-sky-700 dark:bg-slate-800 text-white rounded hover:bg-sky-600 dark:hover:bg-slate-700 cursor-pointer transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <TiThMenu />
      </button>

      <div
        className={`fixed inset-0 bg-black/30 transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-sky-700 dark:bg-slate-900 shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-white/30 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-white">Menú</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white cursor-pointer"
          >
            <IoExitOutline />
          </button>
        </div>

        <ul className="p-4 space-y-1">
          {isAdmin && (
            <li>
              <Link to="/inventario" onClick={() => setIsOpen(false)} className={linkClass}>
                Inventario
              </Link>
            </li>
          )}
          {canAccess("ticket") && (
            <li>
              <Link to="/ticket" onClick={() => setIsOpen(false)} className={linkClass}>
                Ticket
              </Link>
            </li>
          )}
          {canAccess("boleta") && (
            <li>
              <Link to="/boleta" onClick={() => setIsOpen(false)} className={linkClass}>
                Boleta
              </Link>
            </li>
          )}
          {canAccess("factura") && (
            <li>
              <Link to="/factura" onClick={() => setIsOpen(false)} className={linkClass}>
                Factura
              </Link>
            </li>
          )}
          {canAccess("guiarem") && (
            <li>
              <Link to="/guiarem" onClick={() => setIsOpen(false)} className={linkClass}>
                Guia de Remision
              </Link>
            </li>
          )}
          {canAccess("guiatransp") && (
            <li>
              <Link to="/guiatransp" onClick={() => setIsOpen(false)} className={linkClass}>
                Guia Transportista
              </Link>
            </li>
          )}
          {(canAccess("guiarem") || canAccess("guiatransp")) && (
            <li>
              <Link to="/guias" onClick={() => setIsOpen(false)} className={linkClass}>
                Guías Emitidas
              </Link>
            </li>
          )}
          {canAccess("notacredito") && (
            <li>
              <Link to="/notacredito" onClick={() => setIsOpen(false)} className={linkClass}>
                Nota de Credito
              </Link>
            </li>
          )}
          {canAccess("notacredito") && (
            <li>
              <Link to="/notascredito" onClick={() => setIsOpen(false)} className={linkClass}>
                Notas Emitidas
              </Link>
            </li>
          )}
          {canAccess("ingresos") && (
            <li>
              <Link to="/ingresos" onClick={() => setIsOpen(false)} className={linkClass}>
                Ingresos y Egresos
              </Link>
            </li>
          )}
          {isAdmin && (
            <li>
              <Link to="/ventas" onClick={() => setIsOpen(false)} className={linkClass}>
                Ventas del Dia
              </Link>
            </li>
          )}
          {canAccess("cotizacion") && (
            <li>
              <Link to="/almanaque" onClick={() => setIsOpen(false)} className={linkClass}>
                Cotización
              </Link>
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
