import { useTheme } from '@/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';

/**
 * StatusBar temática centralizada
 * - Tema claro: StatusBar escura (ícones escuros)
 * - Tema escuro: StatusBar clara (ícones claros)
 */
export function ThemedStatusBar() {
  const { theme } = useTheme();
  
  return <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />;
}
