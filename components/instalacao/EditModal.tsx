import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

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
  saveButtonColor,
}: EditModalProps) {
  const { colors } = useTheme();
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  // Callback ref que foca automaticamente quando o input é montado
  const setInputRef = useCallback((node: TextInput | null) => {
    if (node) {
      // Salva a referência
      (inputRef as any).current = node;
      // Foca após delay para garantir que o modal está totalmente renderizado
      setTimeout(() => {
        node.focus();
      }, 200);
    }
  }, []);
  
  if (!visible) return null;
  
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 justify-end"
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View 
                className="rounded-t-3xl p-6"
                style={{ backgroundColor: colors.cardBackground }}
              >
                <View className="flex-row items-center justify-between mb-4">
                  <Text 
                    className="text-base font-bold"
                    style={{ color: colors.cardTextPrimary }}
                  >
                    {title}
                  </Text>
                  <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={24} color={colors.cardTextSecondary} />
                  </TouchableOpacity>
                </View>

                <View className="relative mb-4">
                  <TextInput
                    ref={setInputRef}
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    placeholderTextColor={colors.searchInputPlaceholder}
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    keyboardType={keyboardType}
                    secureTextEntry={secureTextEntry && !senhaVisivel}
                    className="rounded-lg p-3 text-base"
                    style={[
                      { 
                        backgroundColor: colors.searchInputBackground,
                        borderWidth: 1,
                        borderColor: colors.cardBorder,
                        color: colors.cardTextPrimary,
                      },
                      multiline ? { height: 100, textAlignVertical: 'top' } : { paddingRight: secureTextEntry ? 50 : 12 }
                    ]}
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
                        color={colors.cardTextSecondary} 
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={onClose}
                    className="flex-1 py-3 rounded-lg"
                    style={{ backgroundColor: colors.filterPillInactive }}
                  >
                    <Text 
                      className="font-semibold text-center"
                      style={{ color: colors.filterPillTextInactive }}
                    >
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={onSave}
                    disabled={isPending}
                    className={`flex-1 py-3 rounded-lg ${saveButtonColor || 'bg-blue-600'}`}
                  >
                    {isPending ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-white font-semibold text-center">Salvar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
