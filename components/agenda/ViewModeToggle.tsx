import { useTheme } from '@/contexts/ThemeContext';
import { Text, TouchableOpacity, View } from 'react-native';

export type ViewMode = 'agenda' | 'day';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.searchInputBackground,
          borderRadius: 20,
          padding: 3,
        }}
      >
        <TouchableOpacity
          onPress={() => onChange('agenda')}
          activeOpacity={0.7}
          style={{
            paddingHorizontal: 18,
            paddingVertical: 7,
            borderRadius: 17,
            backgroundColor: value === 'agenda' ? colors.tabBarActiveTint : 'transparent',
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: value === 'agenda' ? '#ffffff' : colors.cardTextSecondary,
            }}
          >
            Agenda
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onChange('day')}
          activeOpacity={0.7}
          style={{
            paddingHorizontal: 18,
            paddingVertical: 7,
            borderRadius: 17,
            backgroundColor: value === 'day' ? colors.tabBarActiveTint : 'transparent',
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: value === 'day' ? '#ffffff' : colors.cardTextSecondary,
            }}
          >
            Dia
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
