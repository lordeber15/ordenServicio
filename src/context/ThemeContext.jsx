import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Estado inicial: buscar en localStorage o defecto 'system'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Función para aplicar el tema físico
    const applyTheme = (targetTheme) => {
      root.classList.remove("light", "dark");
      
      let actualTheme = targetTheme;
      if (targetTheme === "system") {
        actualTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      
      root.classList.add(actualTheme);
      // Forzar color-scheme para que scrollbars y controles de sistema se adapten
      root.style.colorScheme = actualTheme;
    };

    applyTheme(theme);
    localStorage.setItem("theme", theme);

    // Escuchar cambios del sistema si el modo es 'system'
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system");
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  return context;
};
