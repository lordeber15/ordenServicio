
import './App.css'
import Login from "./pages/login"
import NavBar from "./components/navbar"
import { Route, Routes, useLocation } from 'react-router'


function App() {
const locationNow = useLocation();

  return (
    <div>
      {locationNow.pathname !== "/" && <NavBar />}
      <Routes>
        <Route path="/" element={<Login />} />
      
        
      </Routes>
    </div>
  )
}

export default App
