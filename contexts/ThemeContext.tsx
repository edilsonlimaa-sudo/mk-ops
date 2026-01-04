import { Colors } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

const THEME_STORAGE_KEY = '@mk-auth/theme-mode';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: 'light' | 'dark';
  colors: typeof Colors.light;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('auto'); // Padrão: seguir sistema
  const [isLoaded, setIsLoaded] = useState(false);
  const systemColorScheme = useColorScheme();

  // Restaura tema salvo ao iniciar
  useEffect(() => {
    async function loadTheme() {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
          console.log('🎨 [Theme] Tema restaurado:', savedMode);
          setModeState(savedMode as ThemeMode);
        } else {
          console.log('🎨 [Theme] Usando padrão: auto (sistema)');
        }
      } catch (error) {
        console.error('❌ [Theme] Erro ao restaurar tema:', error);
      } finally {
        setIsLoaded(true);
      }
    }
    loadTheme();
  }, []);

  // Função que persiste e atualiza o modo
  const setMode = async (newMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
      console.log('💾 [Theme] Tema salvo:', newMode);
      setModeState(newMode);
    } catch (error) {
      console.error('❌ [Theme] Erro ao salvar tema:', error);
      setModeState(newMode); // Atualiza mesmo se falhar ao salvar
    }
  };

  // Determina o tema efetivo
  const effectiveTheme = mode === 'auto' 
    ? (systemColorScheme === 'dark' ? 'dark' : 'light')
    : mode;

  const colors = Colors[effectiveTheme];

  return (
    <ThemeContext.Provider value={{ theme: effectiveTheme, colors, mode, setMode, isLoaded }}>
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
