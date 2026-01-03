import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Pressable, Text, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { useClienteContext } from './ClienteContext';

interface InfoRowProps {
  label: string;
  value?: string | null;
}

/**
 * InfoRow simples (não editável) com long press para copiar
 */
export function InfoRow({ label, value }: InfoRowProps) {
  const safeValue = value ?? '';
  
  const copiarValor = async () => {
    if (!safeValue) return;
    try {
      await Clipboard.setStringAsync(safeValue);
      Toast.show({
        type: 'success',
        text1: `${label} copiado! 📋`,
        position: 'top',
        visibilityTime: 2000,
        topOffset: 60,
      });
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
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
        {safeValue}
      </Text>
    </Pressable>
  );
}

interface EditableInfoRowProps {
  label: string;
  value?: string | null;
  field: string;
  editable?: boolean;
  multiline?: boolean;
}

/**
 * InfoRow editável que usa o Context para abrir o modal
 */
export function EditableInfoRow({ 
  label, 
  value, 
  field,
  editable = true,
  multiline = false
}: EditableInfoRowProps) {
  const { openEditModal } = useClienteContext();

  // Proteção contra valores undefined/null
  const safeValue = value ?? '';

  const copiarValor = async () => {
    if (!safeValue) return;
    try {
      await Clipboard.setStringAsync(safeValue);
      Toast.show({
        type: 'success',
        text1: `${label} copiado! 📋`,
        position: 'top',
        visibilityTime: 2000,
        topOffset: 60,
      });
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  if (!editable) {
    return <InfoRow label={label} value={safeValue} />;
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
        onPress={() => openEditModal(field, safeValue, label, multiline)}
        className="flex-row items-center gap-2 flex-1 justify-end ml-4"
      >
        <Text className="text-gray-900 text-sm font-medium text-right flex-1">
          {safeValue}
        </Text>
        <Ionicons name="create-outline" size={16} color="#6b7280" />
      </TouchableOpacity>
    </Pressable>
  );
}
