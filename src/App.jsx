import "./App.css";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import NavBar from "./components/navbar";
import Perfil from "./pages/perfil";
import Inventario from "./pages/inventario";
import { Route, Routes, useLocation } from "react-router";
import ProtectedRoutes from "./components/protectedRoutes";
import { Toaster } from "react-hot-toast";

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
        </Route>
      </Routes>
    </div>
  );
}

export default App;
