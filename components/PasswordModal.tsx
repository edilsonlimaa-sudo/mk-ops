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
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-3">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xl font-bold text-gray-900">Confirmar Identidade</Text>
            <TouchableOpacity onPress={handleClose} className="p-2 -mr-2" disabled={isLoading}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 px-4 pt-6">
          {/* User Info */}
          {usuario && (
            <View className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center">
                <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mr-4">
                  <Text className="text-blue-600 font-bold text-2xl">
                    {usuario.login.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-900 mb-1">
                    @{usuario.login}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {usuario.email}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2">Senha</Text>
            <View className={`flex-row items-center bg-white rounded-lg px-4 py-3 border ${error ? 'border-red-300' : 'border-gray-200'}`}>
              <Ionicons name="lock-closed" size={20} color={error ? '#ef4444' : '#6b7280'} />
              <TextInput
                ref={inputRef}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                placeholder="Digite sua senha"
                placeholderTextColor="#9ca3af"
                className="flex-1 ml-3 text-gray-900 text-base"
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
                  color="#6b7280" 
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
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#3b82f6" style={{ marginTop: 2 }} />
              <Text className="text-blue-700 text-sm ml-2 flex-1">
                Digite sua senha para confirmar que é você e acessar o sistema
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={isLoading || !password.trim()}
              className={`rounded-lg py-4 px-6 ${
                isLoading || !password.trim() 
                  ? 'bg-gray-300' 
                  : 'bg-blue-600 active:bg-blue-700'
              }`}
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
              className="rounded-lg py-4 px-6 border border-gray-300 active:bg-gray-50"
            >
              <Text className="text-gray-700 font-semibold text-base text-center">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
