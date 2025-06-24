import { useState } from "react";
import { IoExitOutline } from "react-icons/io5";
import { Link } from "react-router";
import { TiThMenu } from "react-icons/ti";

export default function Drawer() {
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

      {/* Fondo oscuro al abrir Drawer */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-20 transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-0 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer lateral */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-sky-700 shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-white">
          <h2 className="text-lg font-semibold text-white">Menú</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white cursor-pointer"
          >
            <IoExitOutline />
          </button>
        </div>

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
        </ul>
      </div>
    </>
  );
}
