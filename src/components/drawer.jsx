import { useState } from "react";
import { Link } from "react-router";
import { TiThMenu } from "react-icons/ti";
import { IoExitOutline } from "react-icons/io5";

/**
 * COMPONENTE DRAWER
 * 
 * Este componente implementa un menú lateral desplegable (Sidebar).
 * Proporciona acceso rápido a las secciones principales de facturación,
 * inventario y gestión de la imprenta.
 * 
 * Funcionalidades:
 * - Botón de activación (Hamburguesa)
 * - Fondo oscuro (Overlay) para cerrar al hacer clic fuera
 * - Animaciones de transición suave
 * - Navegación a módulos de facturación (Boleta, Factura, etc.)
 */
export default function Drawer() {
  // isOpen: Controla la visibilidad del menú lateral y el overlay
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botón para abrir el Drawer */}
      <button
        className="p-2 bg-sky-700 text-white rounded hover:bg-sky-600"
        onClick={() => setIsOpen(true)}
      >
        <TiThMenu />
      </button>

      {/* 
        FONDO OSCURO (OVERLAY) 
        Se muestra cuando el drawer está abierto para enfocar el menú 
        y permitir el cierre al hacer clic fuera.
      */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-20 transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-0 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* 
        CONTENEDOR DEL DRAWER 
        Usa transformaciones CSS para deslizarse desde la izquierda.
      */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-sky-700 shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-white">
          <h2 className="text-lg font-semibold text-white">Menú</h2>
          {/* Botón para cerrar directamente desde el header del drawer */}
          <button
            onClick={() => setIsOpen(false)}
            className="text-white cursor-pointer"
          >
            <IoExitOutline />
          </button>
        </div>

        {/* LISTA DE NAVEGACIÓN */}
        <ul className="p-4 ">
          <li>
            <Link
              to="/inventario"
              className="block cursor-pointer text-white hover:text-white p-2 rounded-md hover:bg-sky-600"
            >
              Inventario
            </Link>
          </li>
          <li>
            <Link
              to="/ticket"
              className="block cursor-pointer text-white  hover:text-white p-2 rounded-md hover:bg-sky-600"
            >
              Ticket
            </Link>
          </li>
          <li>
            <Link
              to="/boleta"
              className="block cursor-pointer text-white  hover:text-white p-2 rounded-md hover:bg-sky-600"
            >
              Boleta
            </Link>
          </li>
          <li>
            <Link
              to="/factura"
              className="block cursor-pointer text-white  hover:text-white p-2 rounded-md hover:bg-sky-600"
            >
              Factura
            </Link>
          </li>
          <li>
            <Link
              to="/guiarem"
              className="block cursor-pointer text-white  hover:text-white p-2 rounded-md hover:bg-sky-600"
            >
              Guia de Remision
            </Link>
          </li>
          <li>
            <Link
              to="/notacredito"
              className="block cursor-pointer text-white  hover:text-white p-2 rounded-md hover:bg-sky-600"
            >
              Nota de Credito
            </Link>
          </li>
          <li>
            <Link
              to="/ingresos"
              className="block cursor-pointer text-white  hover:text-white p-2 rounded-md hover:bg-sky-600"
            >
              Ingresos y Egresos
            </Link>
          </li>
          <li>
            <Link
              to="/almanaque"
              className="block cursor-pointer text-white  hover:text-white p-2 rounded-md hover:bg-sky-600"
            >
              Almanaque
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
