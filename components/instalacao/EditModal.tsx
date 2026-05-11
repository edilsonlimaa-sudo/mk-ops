import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
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

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  
  if (!visible) return null;

  /** Android: KAV com behavior "height" costuma falhar em modal transparente; usamos margem pelo teclado. */
  const androidKeyboardLift = Platform.OS === 'android' ? keyboardHeight : 0;

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
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            enabled={Platform.OS === 'ios'}
            keyboardVerticalOffset={0}
            className="flex-1 justify-end"
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View 
                className="rounded-t-3xl p-6"
                style={{
                  backgroundColor: colors.cardBackground,
                  paddingBottom: Math.max(insets.bottom + 16, 24),
                  maxHeight: '90%',
                  marginBottom: androidKeyboardLift,
                }}
              >
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                  contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: Math.max(
                      8,
                      insets.bottom + (keyboardHeight > 0 ? 24 : 8)
                    ),
                  }}
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
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
