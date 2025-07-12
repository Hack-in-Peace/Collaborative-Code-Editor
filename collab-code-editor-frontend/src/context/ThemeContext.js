import React, { createContext, useContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

// Safe wrapper with fallback
export const ThemeProvider = (props) => {
  const { children } = props || {};  // defensive destructuring

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark-mode');
    return saved === 'true' || false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('dark-mode', darkMode);
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
