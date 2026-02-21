import { useTheme } from "../../core/context/ThemeContext";
import { FaSun, FaMoon, FaDesktop } from "react-icons/fa6";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-xl gap-1 border border-gray-200 dark:border-slate-800">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-lg transition-all ${
          theme === "light" 
            ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm" 
            : "text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
        }`}
        title="Modo Claro"
      >
        <FaSun className="text-sm" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-lg transition-all ${
          theme === "dark" 
            ? "bg-white dark:bg-slate-800 text-sky-400 shadow-sm" 
            : "text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
        }`}
        title="Modo Oscuro"
      >
        <FaMoon className="text-sm" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-lg transition-all ${
          theme === "system" 
            ? "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 shadow-sm" 
            : "text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
        }`}
        title="Modo Sistema"
      >
        <FaDesktop className="text-sm" />
      </button>
    </div>
  );
}
