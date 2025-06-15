import "./App.css";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import NavBar from "./components/navbar";
import { Route, Routes, useLocation } from "react-router";
import ProtectedRoutes from "./components/protectedRoutes";

function App() {
  const storedUserData = JSON.parse(localStorage.getItem("userData")) || null;
  const locationNow = useLocation();
  return (
    <div>
      {locationNow.pathname !== "/" && <NavBar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRoutes user={storedUserData} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
