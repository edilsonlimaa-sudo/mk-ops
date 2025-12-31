import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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
  secureTextEntry?: boolean;
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
  secureTextEntry = false,
  isPending = false,
  saveButtonColor = 'bg-blue-600',
}: EditModalProps) {
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  
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

          <View className="relative mb-4">
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder={placeholder}
              multiline={multiline}
              numberOfLines={multiline ? 4 : 1}
              keyboardType={keyboardType}
              secureTextEntry={secureTextEntry && !senhaVisivel}
              className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-base text-gray-800"
              style={multiline ? { height: 100, textAlignVertical: 'top' } : { paddingRight: secureTextEntry ? 50 : 12 }}
              autoFocus
            />
            
            {secureTextEntry && (
              <TouchableOpacity
                onPress={() => setSenhaVisivel(!senhaVisivel)}
                className="absolute right-3 top-3 p-1"
                style={{ top: multiline ? 12 : 12 }}
              >
                <Ionicons 
                  name={senhaVisivel ? "eye-off" : "eye"} 
                  size={20} 
                  color="#6b7280" 
                />
              </TouchableOpacity>
            )}
          </View>

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
