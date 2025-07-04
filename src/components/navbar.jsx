import Logo from "../assets/logoh.png";
import { useState, useEffect, useRef } from "react";
import { FaRegUser } from "react-icons/fa";
import { LuLogOut } from "react-icons/lu";
import { TiThMenu } from "react-icons/ti";
import { Link } from "react-router";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { MdOutlineInventory } from "react-icons/md";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState("");
  const [admin, setIsAdmin] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);
  useEffect(() => {
    if (userData && userData.cargo === "Administrador") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [userData]);
  const handleLogout = () => {
    localStorage.removeItem("userData");
  };
  return (
    <div className="h-18 w-full bg-sky-700 flex flex-row justify-between items-center px-14 shadow-[0px_4px_6px_0px_rgba(0,_0,_0,_0.1)] text-white relative">
      <img src={Logo} className="h-11" alt="Logo" />

      <div className="flex items-center gap-2" ref={dropdownRef}>
        Bienvenid@ {userData.usuario} !
        <div
          onClick={() => setOpen(!open)}
          className="rounded-md w-10 h-10 bg-sky-700 text-white hover:text-white flex items-center justify-center cursor-pointer hover:bg-sky-600 transition ease-in duration-300"
        >
          <TiThMenu />
        </div>
        {open && (
          <div className="absolute right-0 mt-55 mr-14 w-40 bg-sky-600 rounded-md shadow-lg py-2 z-10 animate-fade-down animate-duration-100 animate-ease-in">
            {admin ? (
              <div>
                <Link
                  to={"/perfil"}
                  onClick={() => setOpen(!open)}
                  className="px-4 py-2 cursor-pointer hover:bg-sky-500 text-white w-full text-left flex flex-row gap-2 justify-start items-center hover:text-white"
                >
                  <FaRegUser className="text-white" />
                  Crear Perfil
                </Link>
                <Link
                  to={"/inventario"}
                  onClick={() => setOpen(!open)}
                  className="px-4 py-2 cursor-pointer hover:bg-sky-500 text-white w-full text-left flex flex-row gap-2 justify-start items-center hover:text-white"
                >
                  <MdOutlineInventory className="text-white" />
                  Inventario
                </Link>
              </div>
            ) : (
              <Link
                to={"/perfil"}
                onClick={() => setOpen(!open)}
                className="px-4 py-2 cursor-pointer hover:bg-sky-500 text-white w-full text-left flex flex-row gap-2 justify-start items-center hover:text-white"
              >
                <FaRegUser className="text-white" />
                Perfil
              </Link>
            )}
            <Link
              to={"/dashboard"}
              onClick={() => setOpen(!open)}
              className="px-4 py-2 cursor-pointer hover:bg-sky-500 text-white w-full text-left flex flex-row gap-2 justify-start items-center hover:text-white"
            >
              <MdOutlineSpaceDashboard className="text-white" />
              Dashboard
            </Link>
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
