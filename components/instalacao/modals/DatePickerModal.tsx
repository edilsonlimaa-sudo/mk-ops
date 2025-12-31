import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ActivityIndicator, Modal, Platform, Text, TouchableOpacity, View } from 'react-native';

interface DatePickerModalProps {
  visible: boolean;
  value: Date;
  onChange: (date: Date) => void;
  onSave: () => void;
  onClose: () => void;
  isPending?: boolean;
}

export function DatePickerModal({ visible, value, onChange, onSave, onClose, isPending }: DatePickerModalProps) {
  // Só renderiza no iOS
  if (Platform.OS !== 'ios') return null;

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
              Editar Data da Visita
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <DateTimePicker
            value={value}
            mode="datetime"
            display="spinner"
            onChange={(event, date) => {
              if (date) {
                onChange(date);
              }
            }}
            locale="pt-BR"
            minimumDate={new Date()}
          />

          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-gray-100 py-3 rounded-lg"
            >
              <Text className="text-gray-700 font-semibold text-center">Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSave}
              disabled={isPending}
              className="flex-1 bg-blue-600 py-3 rounded-lg"
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
