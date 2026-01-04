import { Colors } from '@/constants/theme';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: 'light' | 'dark';
  colors: typeof Colors.light;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('auto');
  const systemColorScheme = useColorScheme();

  // Determina o tema efetivo
  const effectiveTheme = mode === 'auto' 
    ? (systemColorScheme === 'dark' ? 'dark' : 'light')
    : mode;

  const colors = Colors[effectiveTheme];

  return (
    <ThemeContext.Provider value={{ theme: effectiveTheme, colors, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
