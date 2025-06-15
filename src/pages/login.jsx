import { useState, useEffect } from "react";
import logo from "../assets/ALEXANDER.png";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getLogin } from "../request/loginrequest";
import toast from "react-hot-toast";

function Login() {
  const [userData, setUserData] = useState(null);
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const navigate = useNavigate();

  const {
    data: dataLogin,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["login"],
    queryFn: getLogin,
  });

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const handledusuario = (e) => {
    setUsuario(e.target.value);
  };
  const handledPassword = (e) => {
    setContrasena(e.target.value);
  };

  const handleIngresar = () => {
    if (!usuario || !contrasena) {
      toast.error("Debes completar usuario y contraseña");
      return;
    }
    if (dataLogin) {
      const user = dataLogin.find(
        (user) => usuario === user.usuario && contrasena === user.password
      );
      if (user) {
        localStorage.setItem("userData", JSON.stringify(user));
        toast.success("¡Acceso correcto!");
        navigate("/dashboard");
      } else {
        toast.error("Usuario o contraseña incorrectos");
        console.log("No puedes ingresar");
      }
    } else {
      toast.error("Datos no disponibles aún, intenta en unos segundos");
      console.log("Datos de usuario no disponibles aún");
    }
  };

  return (
    <div className="flex justify-center bg-gradient-to-r from-indigo-500 to-blue-500">
      <div className="flex flex-col p-4 gap-4 justify-center items-center max-w-2xl h-screen">
        <img
          src={logo}
          className="w-7/12 animate-fade-down animate-once animate-duration-1000 animate-ease-in-out"
          alt="logo"
        />
        <input
          type="text"
          value={usuario}
          onChange={handledusuario}
          className="p-2 w-8/12 border rounded-md font-bold px-4 text-amber-50 bg-transparent placeholder:text-amber-100"
          placeholder="Nombre"
        />
        <input
          type="password"
          value={contrasena}
          onChange={handledPassword}
          className="p-2 w-8/12 border rounded-md font-bold px-4 text-amber-50 bg-transparent placeholder:text-amber-100"
          placeholder="Contraseña"
        />
        <button
          onClick={handleIngresar}
          disabled={isLoading || isError}
          className="w-8/12 bg-cyan-500 rounded-md p-2 text-white font-bold hover:bg-cyan-400 flex justify-center"
        >
          {isLoading ? "Cargando usuarios..." : "Ingresar"}
        </button>
      </div>
    </div>
  );
}

export default Login;
