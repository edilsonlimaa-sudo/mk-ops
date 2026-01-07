import { useTheme } from '@/contexts/ThemeContext';
import { Text, TouchableOpacity } from 'react-native';

interface ListItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
}

export function ListItem({ title, subtitle, onPress }: ListItemProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="mx-4 mb-3 p-4 rounded-lg"
      style={{ backgroundColor: colors.cardBackground }}
    >
      <Text
        className="text-base font-semibold mb-1"
        style={{ color: colors.cardTextPrimary }}
      >
        {title}
      </Text>
      
      {subtitle && (
        <Text
          className="text-sm"
          style={{ color: colors.cardTextSecondary }}
        >
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
}
