import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface EditModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  isPending?: boolean;
  saveButtonColor?: string;
}

export function EditModal({
  visible,
  onClose,
  title,
  value,
  onChange,
  onSave,
  placeholder,
  multiline = false,
  keyboardType = 'default',
  isPending = false,
  saveButtonColor = 'bg-blue-600',
}: EditModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-base font-bold text-gray-800">
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
            keyboardType={keyboardType}
            className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-base text-gray-800 mb-4"
            style={multiline ? { height: 100, textAlignVertical: 'top' } : {}}
            autoFocus
          />

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-gray-100 py-3 rounded-lg"
            >
              <Text className="text-gray-700 font-semibold text-center">Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSave}
              disabled={isPending}
              className={`flex-1 ${saveButtonColor} py-3 rounded-lg`}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-semibold text-center">Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
