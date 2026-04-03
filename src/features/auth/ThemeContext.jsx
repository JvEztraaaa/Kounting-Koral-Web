import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const themeColors = {
  purple: {
    name: 'Pastel Purple',
    primary: '#9D7FB8',
    primaryDark: '#8B6FA6',
    primaryLight: '#E8DFF5',
    accent: '#9D7FB8',
    bgLight: '#ECECEC',
    bgCard: '#FFFFFF',
  },
  pink: {
    name: 'Pastel Pink',
    primary: '#F5A7C8',
    primaryDark: '#E395B6',
    primaryLight: '#FCE8F0',
    accent: '#F5A7C8',
    bgLight: '#ECECEC',
    bgCard: '#FFFFFF',
  },
  green: {
    name: 'Pastel Green',
    primary: '#A8D5BA',
    primaryDark: '#96C3A8',
    primaryLight: '#E8F5ED',
    accent: '#A8D5BA',
    bgLight: '#ECECEC',
    bgCard: '#FFFFFF',
  },
};

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('darkMode');
      if (stored !== null) {
        return stored === 'true';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [themeColor, setThemeColor] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('themeColor') || 'purple';
      return themeColors[storedTheme] ? storedTheme : 'purple';
    }
    return 'purple';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    root.style.colorScheme = darkMode ? 'dark' : 'light';
    
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    const colors = themeColors[themeColor] || themeColors.purple;
    const root = document.documentElement;
    
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-dark', colors.primaryDark);
    root.style.setProperty('--color-primary-light', colors.primaryLight);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-bg-light', colors.bgLight);
    root.style.setProperty('--color-bg-card', colors.bgCard);
    
    localStorage.setItem('themeColor', themeColor);
  }, [themeColor]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const setDarkModeEnabled = (enabled) => {
    setDarkMode(enabled);
  };

  const changeThemeColor = (color) => {
    if (themeColors[color]) {
      setThemeColor(color);
    }
  };

  const value = {
    darkMode,
    themeColor,
    themeColors: themeColors[themeColor],
    toggleDarkMode,
    setDarkModeEnabled,
    changeThemeColor,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
