import "./App.css";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import NavBar from "./components/navbar";
import Perfil from "./pages/perfil";
import Inventario from "./pages/inventario";
import Boleta from "./pages/facturacion/boleta";
import Factura from "./pages/facturacion/factura";
import Guiarem from "./pages/facturacion/guiaremision";
import Notacredito from "./pages/facturacion/notadecredito";
import { Route, Routes, useLocation } from "react-router";
import ProtectedRoutes from "./components/protectedRoutes";
import { Toaster } from "react-hot-toast";
import { FaC } from "react-icons/fa6";

function App() {
  const storedUserData = JSON.parse(localStorage.getItem("userData")) || null;
  const locationNow = useLocation();
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      {locationNow.pathname !== "/" && <NavBar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRoutes user={storedUserData} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/boleta" element={<Boleta />} />
          <Route path="/factura" element={<Factura />} />
          <Route path="/guiarem" element={<Guiarem />} />
          <Route path="/notacredito" element={<Notacredito />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
