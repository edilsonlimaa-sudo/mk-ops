import { useTheme } from '@/contexts/ThemeContext';
import { View, ViewProps } from 'react-native';

type ThemedViewVariant = 'screen' | 'card' | 'header';

interface ThemedViewProps extends ViewProps {
  variant?: ThemedViewVariant;
}

/**
 * View com background temático automático.
 * - variant="screen": Fundo da tela (cinza claro / escuro)
 * - variant="card": Fundo de card (branco / slate)
 * - variant="header": Extensão do header (mesma cor do header)
 */
export function ThemedView({ variant = 'screen', style, ...props }: ThemedViewProps) {
  const { colors } = useTheme();
  
  const backgroundColor = 
    variant === 'card' ? colors.cardBackground :
    variant === 'header' ? colors.headerBackground :
    colors.screenBackground;

  return (
    <View 
      style={[{ backgroundColor }, style]} 
      {...props} 
    />
  );
}
