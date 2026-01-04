import { useTheme } from '@/contexts/ThemeContext';

/**
 * Hook que retorna configurações de header baseadas no tema atual.
 * Use nas telas com Stack.Screen ou Tabs.Screen options.
 */
export function useThemedHeader() {
  const { colors } = useTheme();

  return {
    headerStyle: {
      backgroundColor: colors.headerBackground,
    },
    headerTintColor: colors.headerText,
    headerShadowVisible: true,
    headerTitleStyle: {
      fontWeight: '600' as const,
      color: colors.headerText,
    },
  };
}
