import { useTheme } from '@/contexts/ThemeContext';
import { useOnlineStatus } from '@/hooks/ui/useOnlineStatus';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

interface InfoRowProps {
  label: string;
  value?: string | null;
}

/**
 * InfoRow simples (não editável) com long press para copiar
 */
export function InfoRow({ label, value }: InfoRowProps) {
  const { colors } = useTheme();
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
    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.infoRowBorder }}>
      <Pressable
        onLongPress={copiarValor}
        delayLongPress={500}
        className="flex-row justify-between py-2"
        style={({ pressed }) => ({
          backgroundColor: pressed ? colors.searchInputBackground : 'transparent',
        })}
      >
        <Text className="text-sm" style={{ color: colors.cardTextSecondary }}>
          {label}
        </Text>
        <Text
          className="text-sm font-medium flex-1 text-right ml-4"
          style={{ color: colors.cardTextPrimary }}
        >
          {safeValue}
        </Text>
      </Pressable>
    </View>
  );
}

interface EditableInfoRowProps {
  label: string;
  value?: string | null;
  onEdit?: () => void;
  editable?: boolean;
}

/**
 * InfoRow editável genérico - recebe onEdit como prop
 * Pode ser usado em qualquer contexto do app
 */
export function EditableInfoRow({
  label,
  value,
  onEdit,
  editable = true,
}: EditableInfoRowProps) {
  const { colors } = useTheme();
  const isOnline = useOnlineStatus();

  // Proteção contra valores undefined/null
  const safeValue = value ?? '';

  // Calcula se pode editar (precisa estar online E editable)
  const canEdit = editable && isOnline;

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

  const handleEdit = () => {
    if (!isOnline) {
      Toast.show({
        type: 'info',
        text1: 'Ação indisponível offline',
        text2: 'Conecte-se à internet para editar',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }
    onEdit?.();
  };

  if (!editable || !onEdit) {
    return <InfoRow label={label} value={safeValue} />;
  }

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.infoRowBorder }}>
      <Pressable
        onLongPress={copiarValor}
        delayLongPress={500}
        className="flex-row justify-between items-center py-2"
        style={({ pressed }) => ({
          backgroundColor: pressed ? colors.searchInputBackground : 'transparent',
          opacity: canEdit ? 1 : 0.5,
        })}
      >
        <Text className="text-sm" style={{ color: colors.cardTextSecondary }}>
          {label}
        </Text>
        <TouchableOpacity
          onPress={handleEdit}
          disabled={!canEdit}
          className="flex-row items-center gap-2 flex-1 justify-end ml-4"
        >
          <Text
            className="text-sm font-medium text-right flex-1"
            style={{ color: colors.cardTextPrimary }}
          >
            {safeValue}
          </Text>
          <Ionicons 
            name="create-outline" 
            size={16} 
            color={canEdit ? colors.cardTextSecondary : colors.cardBorder} 
          />
        </TouchableOpacity>
      </Pressable>
    </View>
  );
}
