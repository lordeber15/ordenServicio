//import imagenlogin from "../assets/imprenta.jpg";
import logo from "../assets/ALEXANDER.png";
import { Link } from "react-router";
function login() {
  return (
    <div className="flex justify-center bg-gradient-to-r from-indigo-500 to-blue-500">
      {/* <img className="w-8/12 m-auto h-screen object-cover" src={imagenlogin} /> */}
      <div className="flex flex-col p-4 gap-4 justify-center items-center max-w-2xl h-screen">
        <img
          src={logo}
          className="w-7/12 animate-fade-down animate-once animate-duration-1000 animate-ease-in-out"
        />
        <input
          type="text"
          className="p-2 w-8/12 border rounded-md font-bold px-4 text-amber-50 animate-fade-down animate-once animate-duration-1200 animate-ease-in-out"
          placeholder="Nombre"
        />
        <input
          type="password"
          className="p-2 w-8/12 border rounded-md font-bold px-4 text-amber-50 animate-fade-down animate-once animate-duration-1500 animate-ease-in-out"
          placeholder="Contraseña"
        />
        <Link
          to={"/dashboard"}
          className=" w-8/12 bg-cyan-500 rounded-md p-2 text-white font-bold hover:bg-cyan-400 flex justify-center animate-fade-down animate-once animate-duration-1600 animate-ease-in-out"
        >
          Ingresar
        </Link>
      </div>
    </div>
  );
}

export default login;
