import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native';

interface ComodatoModalProps {
  visible: boolean;
  currentValue: string | null;
  onSelect: (value: 'sim' | 'nao') => void;
  onClose: () => void;
  isPending?: boolean;
}

export function ComodatoModal({ visible, currentValue, onSelect, onClose, isPending }: ComodatoModalProps) {
  const [selectedOption, setSelectedOption] = useState<'sim' | 'nao' | null>(null);

  const handleSelect = (value: 'sim' | 'nao') => {
    setSelectedOption(value);
    onSelect(value);
  };

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
            <Text className="text-base font-bold text-gray-800">Comodato</Text>
            <TouchableOpacity onPress={onClose} disabled={isPending}>
              <Ionicons name="close" size={24} color={isPending ? "#d1d5db" : "#6b7280"} />
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            <TouchableOpacity
              onPress={() => handleSelect('sim')}
              disabled={isPending}
              className="bg-gray-50 rounded-xl p-4 border border-gray-200 active:bg-gray-100"
              style={{ opacity: isPending && selectedOption !== 'sim' ? 0.4 : 1 }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="bg-green-100 w-10 h-10 rounded-full items-center justify-center">
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  </View>
                  <View>
                    <Text className="text-base font-bold text-gray-800">Sim</Text>
                    <Text className="text-sm text-gray-600">Equipamento em comodato</Text>
                  </View>
                </View>
                {isPending && selectedOption === 'sim' ? (
                  <ActivityIndicator size="small" color="#10b981" />
                ) : (
                  <Ionicons
                    name={currentValue === 'sim' ? "checkmark-circle" : "chevron-forward"}
                    size={24}
                    color={currentValue === 'sim' ? "#10b981" : "#9ca3af"}
                  />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSelect('nao')}
              disabled={isPending}
              className="bg-gray-50 rounded-xl p-4 border border-gray-200 active:bg-gray-100"
              style={{ opacity: isPending && selectedOption !== 'nao' ? 0.4 : 1 }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="bg-red-100 w-10 h-10 rounded-full items-center justify-center">
                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                  </View>
                  <View>
                    <Text className="text-base font-bold text-gray-800">Não</Text>
                    <Text className="text-sm text-gray-600">Equipamento próprio</Text>
                  </View>
                </View>
                {isPending && selectedOption === 'nao' ? (
                  <ActivityIndicator size="small" color="#ef4444" />
                ) : (
                  <Ionicons
                    name={currentValue === 'nao' || !currentValue ? "checkmark-circle" : "chevron-forward"}
                    size={24}
                    color={currentValue === 'nao' || !currentValue ? "#10b981" : "#9ca3af"}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
