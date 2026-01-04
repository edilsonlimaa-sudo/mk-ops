import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

type QuickActionColor = 'green' | 'emerald' | 'purple' | 'blue' | 'red' | 'orange';

interface QuickActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: QuickActionColor;
  onPress: () => void;
}

// Cores semânticas para os ícones (mantém significado visual)
const iconColors: Record<QuickActionColor, { bg: string; icon: string }> = {
  green: { bg: '#22c55e', icon: '#ffffff' },    // green-500
  emerald: { bg: '#10b981', icon: '#ffffff' },  // emerald-500
  purple: { bg: '#a855f7', icon: '#ffffff' },   // purple-500
  blue: { bg: '#3b82f6', icon: '#ffffff' },     // blue-500
  red: { bg: '#ef4444', icon: '#ffffff' },      // red-500
  orange: { bg: '#f97316', icon: '#ffffff' },   // orange-500
};

/**
 * Botão de ação rápida com suporte a tema.
 * O fundo do card segue o tema, mas o ícone mantém cor semântica.
 * 
 * @example
 * <QuickActionButton
 *   icon="call"
 *   label="Ligar"
 *   color="green"
 *   onPress={() => Linking.openURL('tel:...')}
 * />
 */
export function QuickActionButton({ icon, label, color, onPress }: QuickActionButtonProps) {
  const { colors } = useTheme();
  const iconStyle = iconColors[color];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-1 rounded-xl p-4"
      style={{ 
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.cardBorder,
      }}
    >
      <View className="items-center">
        <View 
          className="w-10 h-10 rounded-full items-center justify-center mb-2"
          style={{ backgroundColor: iconStyle.bg }}
        >
          <Ionicons name={icon} size={18} color={iconStyle.icon} />
        </View>
        <Text 
          className="font-bold text-xs"
          style={{ color: colors.cardTextPrimary }}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
