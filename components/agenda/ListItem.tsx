import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, TouchableOpacity, View } from 'react-native';

interface ListItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  isChamado?: boolean;
  isConcluido?: boolean;
  horario?: string;
}

export function ListItem({ title, subtitle, onPress, isChamado = true, isConcluido = false, horario }: ListItemProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="mx-4 mb-3 p-4 rounded-lg"
      style={{ 
        backgroundColor: colors.cardBackground,
        opacity: isConcluido ? 0.6 : 1,
      }}
    >
      {/* Linha superior: Badge + Horário */}
      <View className="flex-row items-center justify-between mb-2">
        <Badge 
          label={isChamado ? 'Chamado' : 'Instalação'} 
          color={isChamado ? 'blue' : 'purple'} 
          variant="outline"
        />
        {horario && (
          <Text
            className="text-xs font-medium"
            style={{ color: colors.cardTextSecondary }}
          >
            {horario}
          </Text>
        )}
      </View>

      {/* Título */}
      <Text
        className="text-base font-semibold mb-1"
        style={{ color: colors.cardTextPrimary }}
      >
        {title}
      </Text>
      
      {/* Subtítulo */}
      {subtitle && (
        <Text
          className="text-sm"
          style={{ color: colors.cardTextSecondary }}
        >
          {subtitle}
        </Text>
      )}

      {/* Indicador de status (sempre presente) */}
      <View className="mt-2 pt-2" style={{ borderTopWidth: 1, borderTopColor: colors.cardBorder }}>
        <Text
          className="text-xs font-medium"
          style={{ color: isConcluido ? colors.successText : colors.cardTextSecondary }}
        >
          {isConcluido 
            ? `✓ ${isChamado ? 'Fechado' : 'Concluído'}`
            : `• ${isChamado ? 'Em aberto' : 'Pendente'}`
          }
        </Text>
      </View>
    </TouchableOpacity>
  );
}
