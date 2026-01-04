import { useTheme } from '@/contexts/ThemeContext';
import { Usuario } from '@/types/usuario';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    InteractionManager,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PasswordModalProps {
  visible: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  onConfirm: (password: string) => Promise<void>;
}

export function PasswordModal({
  visible,
  onClose,
  usuario,
  onConfirm,
}: PasswordModalProps) {
  const { theme, colors } = useTheme();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleModalShow = () => {
    // Espera todas as animações terminarem antes de focar
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    });
  };

  const handleConfirm = async () => {
    if (!password.trim()) {
      setError('Digite sua senha');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await onConfirm(password);
      // Limpa o estado ao confirmar com sucesso
      setPassword('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Senha incorreta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
      onShow={handleModalShow}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBackground }} edges={['top']}>
        {/* Header */}
        <View style={{ backgroundColor: colors.cardBackground, borderBottomColor: colors.cardBorder }} className="border-b px-4 py-3">
          <View className="flex-row items-center justify-between mb-3">
            <Text style={{ color: colors.cardTextPrimary }} className="text-xl font-bold">Confirmar Identidade</Text>
            <TouchableOpacity onPress={handleClose} className="p-2 -mr-2" disabled={isLoading}>
              <Ionicons name="close" size={24} color={colors.cardTextSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 px-4 pt-6">
          {/* User Info */}
          {usuario && (
            <View style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }} className="rounded-xl p-4 mb-6 shadow-sm border">
              <View className="flex-row items-center">
                <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center mr-4">
                  <Text className="text-white font-bold text-2xl">
                    {usuario.login.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.cardTextPrimary }} className="text-xl font-bold mb-1">
                    @{usuario.login}
                  </Text>
                  <Text style={{ color: colors.cardTextSecondary }} className="text-sm">
                    {usuario.email}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Password Input */}
          <View className="mb-4">
            <Text style={{ color: colors.cardTextPrimary }} className="font-semibold mb-2">Senha</Text>
            <View style={{ backgroundColor: colors.cardBackground, borderColor: error ? '#fca5a5' : colors.cardBorder }} className="flex-row items-center rounded-lg px-4 py-3 border">
              <Ionicons name="lock-closed" size={20} color={error ? '#ef4444' : colors.cardTextSecondary} />
              <TextInput
                ref={inputRef}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                placeholder="Digite sua senha"
                placeholderTextColor={colors.cardTextSecondary}
                style={{ color: colors.cardTextPrimary }}
                className="flex-1 ml-3 text-base"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                onSubmitEditing={handleConfirm}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)} 
                className="p-1"
                disabled={isLoading}
              >
                <Ionicons 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={colors.cardTextSecondary} 
                />
              </TouchableOpacity>
            </View>
            {error && (
              <View className="flex-row items-center mt-2">
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text className="text-red-600 text-sm ml-1">{error}</Text>
              </View>
            )}
          </View>

          {/* Info Text */}
          <View style={{ backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', borderColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe' }} className="rounded-lg p-3 mb-6 border">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#3b82f6" style={{ marginTop: 2 }} />
              <Text style={{ color: theme === 'dark' ? '#93c5fd' : '#1d4ed8' }} className="text-sm ml-2 flex-1">
                Digite sua senha para confirmar que é você e acessar o sistema
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={isLoading || !password.trim()}
              style={{ 
                backgroundColor: isLoading || !password.trim() ? '#9ca3af' : '#2563eb',
                borderRadius: 8,
                paddingVertical: 16,
                paddingHorizontal: 24,
              }}
            >
              {isLoading ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="text-white font-semibold text-base ml-2">
                    Validando...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-base text-center">
                  Entrar
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClose}
              disabled={isLoading}
              style={{ borderColor: colors.cardBorder }}
              className="rounded-lg py-4 px-6 border"
            >
              <Text style={{ color: colors.cardTextPrimary }} className="font-semibold text-base text-center">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
