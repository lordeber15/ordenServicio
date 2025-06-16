import Logo from "../assets/ALEXANDER.png";
import { useState, useEffect } from "react";
import { FaRegUser } from "react-icons/fa";
import { LuLogOut } from "react-icons/lu";
import { TiThMenu } from "react-icons/ti";
import { Link } from "react-router";
import { MdOutlineSpaceDashboard } from "react-icons/md";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState("");
  const [admin, setIsAdmin] = useState(false);
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
    <div className="h-16 bg-sky-700 flex flex-row justify-between items-center px-6 shadow-[0px_4px_6px_0px_rgba(0,_0,_0,_0.1)] text-white relative">
      <img src={Logo} className="h-11" alt="Logo" />

      <div className="flex items-center gap-2">
        Bienvenido {userData.usuario} !
        <div
          onClick={() => setOpen(!open)}
          className="rounded-md w-10 h-10 bg-sky-700 text-white hover:text-sky-700 flex items-center justify-center cursor-pointer hover:bg-sky-500"
        >
          <TiThMenu />
        </div>
        {open && (
          <div className="absolute right-0 mt-45 mr-6 w-40 bg-sky-600 rounded-md shadow-lg py-2 z-10">
            {admin ? (
              <Link
                to={"/perfil"}
                onClick={() => setOpen(!open)}
                className="px-4 py-2 cursor-pointer hover:bg-sky-500 text-white w-full text-left flex flex-row gap-2 justify-start items-center hover:text-white"
              >
                <FaRegUser className="text-white" />
                Crear Perfil
              </Link>
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
