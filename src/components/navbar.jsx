
import Logo from "../assets/ALEXANDER.png"
function navbar() {
  return (
    <div className="h-16 bg-gray-500 flex flex-row content-center">
      <img src={Logo} className="h-11 flex content-center"/>
      <div className="flex flex-row grap-2 items-center content-center">
        <div>imagenlogin</div>
        <div>usuario</div>
      </div>
      
    </div>
  )
}

export default navbar