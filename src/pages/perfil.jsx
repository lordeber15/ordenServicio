import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { updateLogin } from "../request/loginrequest";
import logo from "../assets/ALEXANDER.webp";
import { Link } from "react-router";
function Perfil() {
  const [admin, setIsAdmin] = useState(false);
  const queryClient = useQueryClient();

  const updateLoginMutation = useMutation({
    mutationFn: updateLogin,
    onSuccess: () => {
      queryClient.invalidateQueries("login");
    },
  });

  const [userData, setUserData] = useState(null);
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const [password, setPassword] = useState("");

  const handlerChangePassword = (e) => {
    setPassword(e.target.value);
  };
  const handleLogout = () => {
    localStorage.removeItem("userData");
  };

  const handleUpdatePassword = async () => {
    if (password === "") {
      console.log("Por favor, complete todos los campos.");
      return;
    }

    try {
      await updateLoginMutation.mutateAsync({
        id: userData?.id,
        usuario: userData?.usuario,
        password,
        cargo: userData?.cargo,
        // Agrega aquí los demás campos requeridos que deseas enviar al servidor
      });
      handleLogout();
      window.location.replace("");
      console.log("listo pero falta redirecionar");
    } catch (error) {
      console.error("Error al actualizar la contraseña:", error);
    }
  };
  useEffect(() => {
    if (userData && userData.cargo === "Administrador") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [userData]);

  // Verificar si userData está inicializado antes de renderizar
  if (!userData) {
    return null; // O puedes mostrar un spinner de carga u otro indicador
  }

  return (
    <div className="w-screen flex flex-col md:flex-row p-6 gap-3">
      <div className=" flex flex-col w-full md:w-1/2 justify-center gap-2 items-center">
        <img src={logo} alt="Foto de Perfil" className="w-40 md:w-48" />

        {admin ? (
          <div className="flex flex-col w-full md:w-9/12 gap-1">
            <Link className="full p-2 hover:bg-sky-700 hover:text-white rounded-md shadow-md inset-shadow-sm">
              Cambiar Imagen
            </Link>
            <Link className="w-full p-2 hover:bg-sky-700 hover:text-white rounded-md shadow-md inset-shadow-sm">
              Cambio de Contraseña
            </Link>
            <Link className="w-full p-2 hover:bg-sky-700 hover:text-white rounded-md shadow-md inset-shadow-sm">
              Lista de Usuario
            </Link>
          </div>
        ) : (
          <div className="flex flex-col w-full md:w-9/12 gap-1">
            <Link className="w-full p-2 hover:bg-sky-700 hover:text-white rounded-md shadow-md inset-shadow-sm">
              Cambiar Imagen
            </Link>
            <Link className="w-full p-2 hover:bg-sky-700 hover:text-white rounded-md shadow-md inset-shadow-sm">
              Cambio de Contraseña
            </Link>
          </div>
        )}
      </div>
      <div className="flex flex-col w-full md:w-screen justify-center gap-4 h-full m-0 md:mx-0  p-6 md:px-6 shadow-md inset-shadow-sm rounded-md">
        <span className=" text-2xl font-bold flex justify-center items-center">
          Cambiar Contraseña
        </span>
        <div className="flex gap-2 items-center w-full">
          <span className="w-1/3">Usuario:</span>
          <label className="px-2 w-full">{userData.usuario}</label>
        </div>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-row gap-2 items-center w-full">
            <div className="w-1/3">Contraseña: </div>
            <input
              type="password"
              placeholder="Nueva Contraseña"
              onChange={handlerChangePassword}
              className="p-2 w-full"
            ></input>
          </div>

          <button
            className="bg-sky-700 p-2 text-white rounded-md"
            onClick={handleUpdatePassword}
          >
            Cambiar Contraseña
          </button>
        </div>
      </div>
    </div>
  );
}

export default Perfil;
