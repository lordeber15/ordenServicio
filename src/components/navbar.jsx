import Logo from "../assets/ALEXANDER.png";

function navbar() {
  return (
    <div className="h-16 bg-gray-500 flex flex-row justify-between items-center content-center px-6 shadow-[0px_4px_6px_0px_rgba(0,_0,_0,_0.1)]">
      <img src={Logo} className="h-11 flex content-center" />
      <div className="flex flex-row grap-2 items-center content-center">
        <div>
          <img
            src={Logo}
            className="rounded-full w-10 cursor-pointer hover:bg-amber-50"
          />
        </div>
      </div>
    </div>
  );
}

export default navbar;
