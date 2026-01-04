import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

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
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={onClose}
      >
        <Pressable
          className="rounded-t-3xl p-6 pb-8"
          style={{ backgroundColor: colors.cardBackground }}
          onPress={(e) => e.stopPropagation()}
        >
          <View 
            className="w-12 h-1 rounded-full self-center mb-6"
            style={{ backgroundColor: colors.cardBorder }}
          />

          <Text 
            className="text-base font-bold mb-4"
            style={{ color: colors.cardTextPrimary }}
          >
            {title}
          </Text>

          <View className="gap-3">
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={option.action}
                className="flex-row items-center justify-between p-4 rounded-xl"
                style={{ backgroundColor: colors.searchInputBackground }}
              >
                <View className="flex-row items-center flex-1">
                  <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                    <Ionicons name={option.icon as any} size={20} color="#2563eb" />
                  </View>
                  <View className="flex-1">
                    <Text 
                      className="text-base font-semibold mb-0.5"
                      style={{ color: colors.cardTextPrimary }}
                    >
                      {option.label}
                    </Text>
                    <Text 
                      className="text-sm" 
                      numberOfLines={1}
                      style={{ color: colors.cardTextSecondary }}
                    >
                      {option.value}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.cardTextSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={onClose}
            className="mt-6 p-4 rounded-xl"
            style={{ backgroundColor: colors.filterPillInactive }}
          >
            <Text 
              className="text-center font-semibold"
              style={{ color: colors.cardTextSecondary }}
            >
              Cancelar
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
