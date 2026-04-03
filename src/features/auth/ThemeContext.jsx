import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const themeColors = {
  lagoon: {
    name: 'Lagoon Teal',
    primary: '#27B3A8',
    primaryDark: '#1F8D85',
    primaryLight: '#E7F7F4',
    accent: '#FF7A5C',
    bgLight: '#F6F9F9',
    bgCard: '#FFFFFF',
  },
  sunrise: {
    name: 'Sunrise Coral',
    primary: '#FF8A65',
    primaryDark: '#E26745',
    primaryLight: '#FFF1EB',
    accent: '#1AAFA0',
    bgLight: '#F9F7F4',
    bgCard: '#FFFFFF',
  },
  tide: {
    name: 'Tide Blue',
    primary: '#4C8FD8',
    primaryDark: '#3A74B4',
    primaryLight: '#EAF2FD',
    accent: '#2BAE9C',
    bgLight: '#F5F8FC',
    bgCard: '#FFFFFF',
  },
  pink: {
    name: 'Pastel Pink',
    primary: '#F39AC1',
    primaryDark: '#DB7FA8',
    primaryLight: '#FDEBF4',
    accent: '#8E7CD6',
    bgLight: '#FCF8FB',
    bgCard: '#FFFFFF',
  },
  purple: {
    name: 'Pastel Purple',
    primary: '#B69AE8',
    primaryDark: '#9B82CC',
    primaryLight: '#F2EDFD',
    accent: '#F6A9C5',
    bgLight: '#F8F7FC',
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
      const storedTheme = localStorage.getItem('themeColor') || 'lagoon';
      return themeColors[storedTheme] ? storedTheme : 'lagoon';
    }
    return 'lagoon';
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
    const colors = themeColors[themeColor] || themeColors.lagoon;
    const root = document.documentElement;
    const cardBg = darkMode ? '#111C2D' : colors.bgCard;
    
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-dark', colors.primaryDark);
    root.style.setProperty('--color-primary-light', colors.primaryLight);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-bg-light', colors.bgLight);
    root.style.setProperty('--color-bg-card', cardBg);
    
    localStorage.setItem('themeColor', themeColor);
  }, [themeColor, darkMode]);

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
