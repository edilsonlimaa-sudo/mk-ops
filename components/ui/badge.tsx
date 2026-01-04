import { Text, View } from 'react-native';

type BadgeVariant = 'outline' | 'solid';
type BadgeColor = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'gray';

interface BadgeProps {
  label: string;
  color?: BadgeColor;
  variant?: BadgeVariant;
  /** Usa fonte bold (padrão: true) */
  bold?: boolean;
}

const colorStyles = {
  outline: {
    blue: { bg: 'bg-blue-100', text: 'text-blue-700' },
    green: { bg: 'bg-green-100', text: 'text-green-700' },
    red: { bg: 'bg-red-100', text: 'text-red-700' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-700' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-700' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
  },
  solid: {
    blue: { bg: 'bg-blue-500', text: 'text-white' },
    green: { bg: 'bg-green-500', text: 'text-white' },
    red: { bg: 'bg-red-500', text: 'text-white' },
    orange: { bg: 'bg-orange-500', text: 'text-white' },
    purple: { bg: 'bg-purple-500', text: 'text-white' },
    gray: { bg: 'bg-gray-500', text: 'text-white' },
  },
};

/**
 * Badge para indicadores semânticos (status, tipo, prioridade).
 * Cores fixas independente do tema para manter significado visual.
 * 
 * @example
 * <Badge label="Chamado" color="blue" variant="outline" />
 * <Badge label="ALTA" color="red" variant="solid" />
 * <Badge label="Ativo" color="green" variant="outline" />
 */
export function Badge({ label, color = 'blue', variant = 'outline', bold = true }: BadgeProps) {
  const styles = colorStyles[variant][color];

  return (
    <View className={`px-2 py-0.5 rounded ${styles.bg}`}>
      <Text className={`text-xs ${bold ? 'font-bold' : 'font-medium'} ${styles.text}`}>
        {label}
      </Text>
    </View>
  );
}
