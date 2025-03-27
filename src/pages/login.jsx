import imagenlogin from "../assets/imagenlogin.jpeg";
import logo from "../assets/ALEXANDER.png";
import { Link } from "react-router";
function login() {
  return (
    <div className="flex flex-row">
      <img className="w-4/5 h-screen" src={imagenlogin} />
      <div className="flex flex-col justify-center p-4 gap-4 w-full">
        <img src={logo} className="w-full scale-75" />
        <input
          type="text"
          className="p-2 border rounded-md font-bold px-4"
          placeholder="Nombre"
        />
        <input
          type="password"
          className="p-2 border rounded-md font-bold px-4"
          placeholder="Contraseña"
        />
        <Link
          to={"/dashboard"}
          className="bg-gray-500 rounded-md p-2 text-white font-bold hover:bg-gray-600 flex justify-center"
        >
          Ingresar
        </Link>
      </div>
    </div>
  );
}

export default login;
