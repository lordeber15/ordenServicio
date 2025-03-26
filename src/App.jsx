
import './App.css'
import Login from "./pages/login"
import Dashboard from "./pages/dashboard"
import NavBar from "./components/navbar"
import { Route, Routes, useLocation } from 'react-router'


function App() {
const locationNow = useLocation();

  return (
    <div>
      {locationNow.pathname !== "/" && <NavBar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        
      </Routes>
    </div>
  )
}

export default App
