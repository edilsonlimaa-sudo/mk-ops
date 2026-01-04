import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

interface InfoRowProps {
  label: string;
  value: string;
}

export function InfoRow({ label, value }: InfoRowProps) {
  const { colors } = useTheme();
  
  const copiarValor = async () => {
    await Clipboard.setStringAsync(value);
    Toast.show({
      type: 'success',
      text1: `${label} copiado! 📋`,
      position: 'top',
      visibilityTime: 2000,
      topOffset: 60,
    });
  };

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.infoRowBorder }}>
      <Pressable
        onLongPress={copiarValor}
        delayLongPress={500}
        className="flex-row justify-between py-2"
        style={({ pressed }) => ({
          backgroundColor: pressed ? colors.filterPillBackground : 'transparent',
        })}
      >
        <Text className="text-sm" style={{ color: colors.cardTextSecondary }}>{label}</Text>
        <Text className="text-sm font-medium flex-1 text-right ml-4" style={{ color: colors.cardTextPrimary }}>
          {value}
        </Text>
      </Pressable>
    </View>
  );
}

interface EditableInfoRowProps {
  label: string;
  value: string;
  onEdit: () => void;
  editable?: boolean;
  labelStyle?: string;
  valueStyle?: string;
}

export function EditableInfoRow({
  label,
  value,
  onEdit,
  editable = true,
  labelStyle,
  valueStyle
}: EditableInfoRowProps) {
  const { colors } = useTheme();
  
  const copiarValor = async () => {
    await Clipboard.setStringAsync(value);
    Toast.show({
      type: 'success',
      text1: `${label} copiado! 📋`,
      position: 'top',
      visibilityTime: 2000,
      topOffset: 60,
    });
  };

  if (!editable) {
    return <InfoRow label={label} value={value} />;
  }

  if (labelStyle && valueStyle) {
    // Modo customizado para o Plano
    return (
      <TouchableOpacity
        onPress={onEdit}
        onLongPress={copiarValor}
        delayLongPress={500}
        className="mb-4"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className={labelStyle}>{label}</Text>
            <Text className={valueStyle}>{value}</Text>
          </View>
          <Ionicons name="create-outline" size={18} color={colors.cardTextSecondary} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.infoRowBorder }}>
      <Pressable
        onLongPress={copiarValor}
        delayLongPress={500}
        className="flex-row justify-between items-center py-2"
        style={({ pressed }) => ({
          backgroundColor: pressed ? colors.filterPillBackground : 'transparent',
        })}
      >
        <Text className="text-sm" style={{ color: colors.cardTextSecondary }}>{label}</Text>
        <TouchableOpacity
          onPress={onEdit}
          className="flex-row items-center gap-2 flex-1 justify-end ml-4"
        >
          <Text className="text-sm font-medium text-right flex-1" style={{ color: colors.cardTextPrimary }}>
            {value}
          </Text>
          <Ionicons name="create-outline" size={16} color={colors.cardTextSecondary} />
        </TouchableOpacity>
      </Pressable>
    </View>
  );
}
