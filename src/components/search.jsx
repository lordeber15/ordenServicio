import { FaSearch } from "react-icons/fa";
function Search() {
  return (
    <div>
      <div className="flex w-fit border-sky-500 border items-center rounded-md p-2 m-2">
        <input
          type="text"
          placeholder="Buscar..."
          className="focus:outline-none"
        />
        <FaSearch className="cursor-pointer hover:text-sky-700" />
      </div>
    </div>
  );
}

export default Search;
