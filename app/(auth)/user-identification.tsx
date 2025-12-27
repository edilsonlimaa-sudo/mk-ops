import { PasswordModal } from '@/components/PasswordModal';
import { useUsuarios } from '@/hooks/usuario';
import { fetchUsuarioDetail } from '@/services/api/usuario';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';
import { Usuario } from '@/types/usuario';
import bcrypt from 'bcryptjs';
import * as Crypto from 'expo-crypto';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UserIdentification() {
  console.log('👤 [UserIdentification] Componente renderizado');
  const router = useRouter();
  const { identifyUser } = useUserStore();
  const { ipMkAuth } = useAuthStore();
  const insets = useSafeAreaInsets();
  
  const { data: usuarios = [], isLoading, isError, refetch } = useUsuarios();
  console.log('📋 [UserIdentification] Usuários carregados:', usuarios?.length || 0);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const handleSelectUser = (usuario: Usuario) => {
    console.log('👆 [UserIdentification] Usuário selecionado:', usuario.login);
    setSelectedUsuario(usuario);
    setPasswordModalVisible(true);
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!selectedUsuario) return;

    try {
      console.log('🔐 [UserIdentification] Iniciando validação de senha para:', selectedUsuario.login);
      // Busca dados completos do usuário incluindo hash
      const usuarioDetalhado = await fetchUsuarioDetail(selectedUsuario.uuid);
      console.log('✅ [UserIdentification] Dados completos do usuário obtidos');
      
      // Valida senha com SHA-256 + bcrypt
      console.log('🔒 [UserIdentification] Gerando hash SHA-256 da senha...');
      const sha256Hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );
      
      // Converte $2y$ para $2a$ (compatibilidade PHP -> JS)
      const bcryptHash = usuarioDetalhado.sha.replace('$2y$', '$2a$');
      
      // Compara hash SHA-256 da senha com bcrypt armazenado
      console.log('🔍 [UserIdentification] Comparando hashes...');
      const isValid = await bcrypt.compare(sha256Hash, bcryptHash);
      
      if (!isValid) {
        console.log('❌ [UserIdentification] Senha incorreta');
        throw new Error('Senha incorreta');
      }
      
      console.log('✅ [UserIdentification] Senha validada com sucesso');
      
      // Identifica o usuário com dados completos (hash será removido automaticamente)
      console.log('💾 [UserIdentification] Chamando identifyUser...');
      await identifyUser(usuarioDetalhado);
      console.log('✨ [UserIdentification] Usuário identificado com sucesso!');
      
      // Fecha modal - AuthLayout guard vai redirecionar automaticamente
      setPasswordModalVisible(false);
      setSelectedUsuario(null);
      console.log('✅ [UserIdentification] Modal fechado. AuthLayout guard vai redirecionar...');
    } catch (error) {
      console.error('❌ [UserIdentification] Erro:', error);
      throw error; // Modal vai pegar e mostrar o erro
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen 
          options={{
            headerRight: () => (
              <View className="flex-row items-center bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 mr-2">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-xs text-green-700 font-medium">
                  {ipMkAuth}
                </Text>
              </View>
            ),
          }}
        />
        <View className="flex-1 bg-gray-50 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Carregando funcionários...</Text>
        </View>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Stack.Screen 
          options={{
            headerRight: () => (
              <View className="flex-row items-center bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 mr-2">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-xs text-green-700 font-medium">
                  {ipMkAuth}
                </Text>
              </View>
            ),
          }}
        />
        <View className="flex-1 bg-gray-50 items-center justify-center px-6">
          <Text className="text-gray-600 text-center mb-4">Erro ao carregar funcionários</Text>
          <TouchableOpacity 
            onPress={() => refetch()}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  if (usuarios.length === 0) {
    return (
      <>
        <Stack.Screen 
          options={{
            headerRight: () => (
              <View className="flex-row items-center bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 mr-2">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-xs text-green-700 font-medium">
                  {ipMkAuth}
                </Text>
              </View>
            ),
          }}
        />
        <View className="flex-1 bg-gray-50 items-center justify-center px-6">
          <Text className="text-gray-600 text-center mb-4">Nenhum funcionário encontrado</Text>
          <TouchableOpacity 
            onPress={() => refetch()}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          headerRight: () => (
            <View className="flex-row items-center bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 mr-2">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <Text className="text-xs text-green-700 font-medium">
                {ipMkAuth}
              </Text>
            </View>
          ),
        }}
      />
      <View className="flex-1 bg-gray-50">
        {/* Subtítulo */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <Text className="text-base text-gray-600">
            Selecione seu usuário para continuar
          </Text>
        </View>

        {/* Lista de Funcionários */}
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.uuid}
          contentContainerStyle={{ 
            padding: 16,
            paddingBottom: insets.bottom + 16 
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => refetch()}
              tintColor="#3B82F6"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 active:bg-gray-50"
              onPress={() => handleSelectUser(item)}
              disabled={isLoading}
            >
              <View className="flex-row items-center">
                {/* Avatar placeholder */}
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                  <Text className="text-blue-600 font-semibold text-lg">
                    {item.login.charAt(0).toUpperCase()}
                  </Text>
                </View>

                {/* Info */}
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900 mb-1">
                    @{item.login}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {item.email}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    Último acesso: {item.ultacesso}
                  </Text>
                </View>

                {/* Seta */}
                <View className="ml-2">
                  <Text className="text-gray-400 text-xl">›</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Password Modal */}
      <PasswordModal
        visible={passwordModalVisible}
        onClose={() => {
          setPasswordModalVisible(false);
          setSelectedUsuario(null);
        }}
        usuario={selectedUsuario}
        onConfirm={handlePasswordConfirm}
      />
    </>
  );
}
