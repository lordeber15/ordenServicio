/**
 * COMPONENTE NAVBAR
 * 
 * Barra de navegación superior de la aplicación.
 * 
 * Funcionalidades:
 * - Muestra el logo de la empresa
 * - Saludo personalizado con nombre del usuario
 * - Menú dropdown con navegación
 * - Navegación basada en roles (Administrador vs Usuario)
 * - Cierre automático del dropdown al hacer click fuera
 * - Logout que limpia localStorage
 * 
 * Roles y permisos:
 * - Administrador: Acceso a Inventario, Crear Perfil, Dashboard, Reportes, Logout
 * - Usuario: Acceso a Perfil, Dashboard, Reportes, Logout (sin Inventario)
 */

import Logo from "../assets/logoh.png";
import { useState, useEffect, useRef } from "react";
import { FaRegUser } from "react-icons/fa";
import { LuLogOut } from "react-icons/lu";
import { TiThMenu } from "react-icons/ti";
import { Link } from "react-router";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { MdOutlineInventory } from "react-icons/md";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { FaReceipt } from "react-icons/fa6";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  /**
   * ESTADO DEL COMPONENTE
   * 
   * - open: Controla si el dropdown está abierto o cerrado
   * - userData: Datos del usuario desde localStorage (token, usuario, cargo)
   * - dropdownRef: Referencia al elemento dropdown para detectar clicks fuera
   */
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const dropdownRef = useRef(null);

  /**
   * EFECTO: Cargar datos del usuario y configurar listener de clicks
   * 
   * Se ejecuta una sola vez al montar el componente.
   * 
   * Tareas:
   * 1. Cargar userData desde localStorage
   * 2. Configurar listener para cerrar dropdown al hacer click fuera
   * 3. Limpiar listener al desmontar el componente
   */
  useEffect(() => {
    // Cargar datos del usuario desde localStorage
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    
    /**
     * HANDLER: Cerrar dropdown al hacer click fuera
     * 
     * Si el click fue fuera del dropdown (dropdownRef),
     * cerrar el menú.
     */
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    
    // Agregar listener de clicks al documento
    document.addEventListener("mousedown", handleClickOutside);
    
    // Cleanup: Remover listener al desmontar
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * VERIFICACIÓN DE ROL
   * 
   * Determina si el usuario es Administrador.
   * Esto controla qué opciones del menú se muestran.
   */
  const isAdmin = userData?.cargo === "Administrador";

  /**
   * HANDLER: Cerrar sesión
   * 
   * Elimina los datos del usuario de localStorage.
   * El componente App.jsx detectará esto y redirigirá al login.
   */
  const handleLogout = () => {
    localStorage.removeItem("userData");
  };

  return (
    // Contenedor principal del navbar
    <div className="h-18 w-full bg-sky-700 dark:bg-slate-950 flex flex-row justify-between items-center px-14 shadow-[0px_4px_6px_0px_rgba(0,_0,_0,_0.1)] text-white relative transition-colors duration-300 border-b dark:border-slate-800/50">
      {/* Logo de la empresa */}
      <img src={Logo} className="h-11" alt="Logo" />

      {/* Sección de usuario y menú dropdown */}
      <div className="flex items-center gap-2" ref={dropdownRef}>
        {/* Saludo personalizado */}
        Bienvenid@ {userData?.usuario} !
        
        <ThemeToggle />
        
        {/* Botón para abrir/cerrar dropdown */}
        <div
          onClick={() => setOpen(!open)}
          className="rounded-md w-10 h-10 bg-sky-700 dark:bg-slate-800 text-white hover:text-white flex items-center justify-center cursor-pointer hover:bg-sky-600 dark:hover:bg-slate-700 transition ease-in duration-300 ml-2 border dark:border-slate-700"
        >
          <TiThMenu />
        </div>
        
        {/* DROPDOWN MENU - Solo visible si open === true */}
        {open && (
          <div className="absolute right-0 mt-55 mr-14 w-40 bg-sky-600 dark:bg-slate-900 rounded-md shadow-lg py-2 z-10 animate-fade-down animate-duration-100 animate-ease-in border dark:border-slate-800">
            {/* OPCIÓN: Inventario - Solo visible para Administradores */}
            {isAdmin && (
              <Link
                to={"/inventario"}
                onClick={() => setOpen(false)}
                className="px-4 py-2 cursor-pointer hover:bg-sky-500 dark:hover:bg-slate-800 text-white w-full text-left flex flex-row gap-2 justify-start items-center hover:text-white transition-colors"
              >
                <MdOutlineInventory className="text-white" />
                Inventario
              </Link>
            )}
            
            {/* OPCIÓN: Perfil / Crear Perfil */}
            <Link
              to={"/perfil"}
              onClick={() => setOpen(false)}
              className="px-4 py-2 cursor-pointer hover:bg-sky-500 dark:hover:bg-slate-800 text-white w-full text-left flex flex-row gap-2 justify-start items-center hover:text-white transition-colors"
            >
              <FaRegUser className="text-white" />
              {/* Texto condicional según rol */}
              {isAdmin ? "Crear Perfil" : "Perfil"}
            </Link>
            
            {/* OPCIÓN: Dashboard */}
            <Link
              to={"/dashboard"}
              onClick={() => setOpen(false)}
              className="px-4 py-2 cursor-pointer hover:bg-sky-500 dark:hover:bg-slate-800 text-white w-full text-left flex flex-row gap-2 justify-start items-center hover:text-white transition-colors"
            >
              <MdOutlineSpaceDashboard className="text-white" />
              Dashboard
            </Link>
            
            {/* OPCIÓN: Reportes */}
            <Link
              to={"/reportes"}
              onClick={() => setOpen(false)}
              className="px-4 py-2 cursor-pointer hover:bg-sky-500 dark:hover:bg-slate-800 text-white w-full text-left flex flex-row gap-2 justify-start items-center hover:text-white transition-colors"
            >
              <HiOutlineDocumentReport className="text-white" />
              Reportes
            </Link>
            
            {/* OPCIÓN: Cerrar sesión */}
            <Link
              to={"/"}
              onClick={handleLogout}
              className="px-4 py-2 cursor-pointer hover:bg-sky-500 text-white w-full text-left flex flex-row gap-2 justify-start items-center"
            >
              <LuLogOut />
              Cerrar sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
