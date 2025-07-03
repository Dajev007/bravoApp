import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

interface Colors {
  // Background colors
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Brand colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Accent colors
  accent: string;
  accentLight: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Border and divider colors
  border: string;
  borderLight: string;
  divider: string;
  
  // Interactive colors
  cardBackground: string;
  buttonBackground: string;
  inputBackground: string;
  
  // Shadow color
  shadow: string;
}

const lightColors: Colors = {
  // Background colors
  background: '#f0f8ff',
  backgroundSecondary: '#ffffff',
  surface: '#ffffff',
  surfaceSecondary: '#f0f8ff',
  
  // Text colors
  text: '#1e3a8a',
  textSecondary: '#3b8dba',
  textTertiary: '#64748b',
  
  // Brand colors
  primary: '#3b8dba',
  primaryLight: '#a2c7e7',
  primaryDark: '#1e3a8a',
  
  // Accent colors
  accent: '#b1e0e7',
  accentLight: '#f0f8ff',
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Border and divider colors
  border: '#b1e0e7',
  borderLight: '#e2e8f0',
  divider: '#f0f8ff',
  
  // Interactive colors
  cardBackground: '#ffffff',
  buttonBackground: '#3b8dba',
  inputBackground: '#ffffff',
  
  // Shadow color
  shadow: '#3b8dba',
};

const darkColors: Colors = {
  // Background colors
  background: '#0f172a',
  backgroundSecondary: '#1e293b',
  surface: '#1e293b',
  surfaceSecondary: '#334155',
  
  // Text colors
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textTertiary: '#94a3b8',
  
  // Brand colors
  primary: '#60a5fa',
  primaryLight: '#93c5fd',
  primaryDark: '#3b82f6',
  
  // Accent colors
  accent: '#475569',
  accentLight: '#334155',
  
  // Status colors
  success: '#22c55e',
  warning: '#eab308',
  error: '#f87171',
  info: '#60a5fa',
  
  // Border and divider colors
  border: '#475569',
  borderLight: '#334155',
  divider: '#334155',
  
  // Interactive colors
  cardBackground: '#1e293b',
  buttonBackground: '#60a5fa',
  inputBackground: '#334155',
  
  // Shadow color
  shadow: '#000000',
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  colors: Colors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = '@bravo_nest_theme';

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  // Load saved theme preference on app start
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Determine if we should use dark mode
  const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');

  // Get current colors based on theme
  const colors = isDark ? darkColors : lightColors;

  const value = {
    theme,
    setTheme,
    isDark,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Export color palettes for external use
export { lightColors, darkColors };
export type { Colors, Theme };