import { useTheme } from '@/contexts/ThemeContext';
import { Text, TouchableOpacity, View } from 'react-native';

export interface FilterPillOption<T extends string = string> {
  key: T;
  label: string;
  emoji?: string;
  count?: number;
}

interface FilterPillProps<T extends string> {
  option: FilterPillOption<T>;
  isActive: boolean;
  onPress: (key: T) => void;
}

export function FilterPill<T extends string>({ option, isActive, onPress }: FilterPillProps<T>) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => onPress(option.key)}
      className="flex-row items-center px-3 py-2 rounded-full"
      style={{
        backgroundColor: isActive ? colors.filterPillActive : colors.filterPillInactive,
      }}
      activeOpacity={0.7}
    >
      {option.emoji && (
        <Text className="text-sm mr-1">{option.emoji}</Text>
      )}
      <Text
        className="text-sm font-semibold"
        style={{
          color: isActive ? colors.filterPillTextActive : colors.filterPillTextInactive,
        }}
      >
        {option.label}
      </Text>
      {option.count !== undefined && option.count > 0 && (
        <View
          className="ml-1.5 px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor: isActive ? colors.filterPillBadgeActive : colors.filterPillBadgeInactive,
          }}
        >
          <Text
            className="text-xs font-bold"
            style={{
              color: isActive ? colors.filterPillTextActive : colors.filterPillTextInactive,
            }}
          >
            {option.count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
