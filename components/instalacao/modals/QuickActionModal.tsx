import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

interface QuickActionOption {
  label: string;
  value: string;
  icon: string;
  action: () => void;
}

interface QuickActionModalProps {
  visible: boolean;
  title: string;
  options: QuickActionOption[];
  onClose: () => void;
}

export default function QuickActionModal({ visible, title, options, onClose }: QuickActionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-end"
        onPress={onClose}
      >
        <Pressable
          className="bg-white rounded-t-3xl p-6 pb-8"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />

          <Text className="text-base font-bold text-gray-900 mb-4">
            {title}
          </Text>

          <View className="gap-3">
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={option.action}
                className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl active:bg-gray-100"
              >
                <View className="flex-row items-center flex-1">
                  <View className="bg-purple-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                    <Ionicons name={option.icon as any} size={20} color="#9333ea" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 mb-0.5">
                      {option.label}
                    </Text>
                    <Text className="text-sm text-gray-500" numberOfLines={1}>
                      {option.value}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={onClose}
            className="mt-6 bg-gray-100 p-4 rounded-xl active:bg-gray-200"
          >
            <Text className="text-center font-semibold text-gray-700">Cancelar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
