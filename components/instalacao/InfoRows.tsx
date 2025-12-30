import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

interface InfoRowProps {
  label: string;
  value: string;
}

export function InfoRow({ label, value }: InfoRowProps) {
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
    <Pressable
      onLongPress={copiarValor}
      delayLongPress={500}
      className="flex-row justify-between py-2 border-b border-gray-100"
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? '#f3f4f6' : 'transparent',
        }
      ]}
    >
      <Text className="text-gray-600 text-sm">{label}</Text>
      <Text className="text-gray-900 text-sm font-medium flex-1 text-right ml-4">
        {value}
      </Text>
    </Pressable>
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
          <Ionicons name="create-outline" size={18} color="#6b7280" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Pressable
      onLongPress={copiarValor}
      delayLongPress={500}
      className="flex-row justify-between items-center py-2 border-b border-gray-100"
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? '#f3f4f6' : 'transparent',
        }
      ]}
    >
      <Text className="text-gray-600 text-sm">{label}</Text>
      <TouchableOpacity
        onPress={onEdit}
        className="flex-row items-center gap-2 flex-1 justify-end ml-4"
      >
        <Text className="text-gray-900 text-sm font-medium text-right flex-1">
          {value}
        </Text>
        <Ionicons name="create-outline" size={16} color="#6b7280" />
      </TouchableOpacity>
    </Pressable>
  );
}
