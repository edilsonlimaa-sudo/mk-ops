import { PasswordModal } from '@/components/PasswordModal';
import { useUsuarios } from '@/hooks/usuario';
import { fetchUsuarioDetail } from '@/services/api/usuario';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';
import { Usuario } from '@/types/usuario';
import bcrypt from 'bcryptjs';
import * as Crypto from 'expo-crypto';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ValidationState = 'idle' | 'validating' | 'success' | 'error';

export default function UserIdentification() {
  console.log('👤 [UserIdentification] Componente renderizado');
  const router = useRouter();
  const { identifyUser } = useUserStore();
  const { ipMkAuth, logout } = useAuthStore();
  const insets = useSafeAreaInsets();
  
  const { data: usuarios = [], isLoading, isError, refetch } = useUsuarios();
  console.log('📋 [UserIdentification] Usuários carregados:', usuarios?.length || 0);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0));

  // Animação de entrada do loading screen
  useEffect(() => {
    if (validationState === 'validating') {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [validationState]);

  // Animação de sucesso (check verde)
  useEffect(() => {
    if (validationState === 'success') {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    // Animação de erro (X vermelho)
    if (validationState === 'error') {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Após mostrar erro, reabre o modal
      setTimeout(() => {
        setValidationState('idle');
        setPasswordModalVisible(true); // Reabre modal (mantém selectedUsuario!)
      }, 1800);
    }
  }, [validationState]);

  const handleDisconnect = () => {
    console.log('🚪 [UserIdentification] Desconectando...');
    logout();
  };

  const handleSelectUser = (usuario: Usuario) => {
    console.log('👆 [UserIdentification] Usuário selecionado:', usuario.login);
    setSelectedUsuario(usuario);
    setPasswordModalVisible(true);
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!selectedUsuario) return;

    // Fecha o modal ANTES para o loading imersivo aparecer
    setPasswordModalVisible(false);

    try {
      console.log('🔐 [UserIdentification] Iniciando validação de senha para:', selectedUsuario.login);
      
      // Aguarda um pouco para o modal fechar completamente
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Inicia loading imersivo
      setValidationState('validating');
      
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
        setValidationState('error'); // Mostra X vermelho
        // NÃO limpa selectedUsuario - mantém referência para reabrir modal
        return; // Sai da função (useEffect cuida do resto)
      }
      
      console.log('✅ [UserIdentification] Senha validada com sucesso');
      
      // Mostra animação de sucesso
      setValidationState('success');
      
      // Aguarda animação completar
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      // Identifica o usuário (guard vai redirecionar automaticamente)
      console.log('💾 [UserIdentification] Chamando identifyUser...');
      await identifyUser(usuarioDetalhado);
      console.log('✨ [UserIdentification] Usuário identificado! Guard vai redirecionar...');
      
    } catch (error) {
      console.error('❌ [UserIdentification] Erro:', error);
      // Em caso de erro genérico (não senha incorreta), mostra erro e reabre modal
      setValidationState('error');
      // Mantém selectedUsuario para poder tentar novamente
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
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
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 bg-gray-50 items-center justify-center px-6">
          <Text className="text-2xl mb-2">😕</Text>
          <Text className="text-gray-900 font-semibold text-lg mb-2">Erro ao carregar funcionários</Text>
          <Text className="text-gray-600 text-center mb-4">Não foi possível buscar a lista de usuários</Text>
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
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 bg-gray-50 items-center justify-center px-6">
          <Text className="text-2xl mb-2">👥</Text>
          <Text className="text-gray-900 font-semibold text-lg mb-2">Nenhum funcionário encontrado</Text>
          <Text className="text-gray-600 text-center mb-4">Não há usuários cadastrados no sistema</Text>
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
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-gray-50">
        {/* Hero Section direto (sem header de navegador rs) */}
        <View className="bg-white px-6 pt-16 pb-8 border-b border-gray-200" style={{ paddingTop: insets.top + 40 }}>
          <Text className="text-4xl font-bold text-gray-900 mb-3 text-center">
            👋 Quem é você?
          </Text>
          <Text className="text-lg text-gray-600 text-center">
            Escolha seu usuário para entrar
          </Text>
        </View>

        {/* Lista de Funcionários Horizontal */}
        <View className="flex-1 justify-center">
          <FlatList
            data={usuarios}
            keyExtractor={(item) => item.uuid}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingHorizontal: 20,
              alignItems: 'center',
            }}
            snapToInterval={200} // Snap nos cards
            decelerationRate="fast"
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={() => refetch()}
                tintColor="#3B82F6"
              />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                className="bg-white rounded-3xl p-6 mx-3 shadow-lg border border-gray-200 active:scale-95"
                style={{ width: 180 }}
                onPress={() => handleSelectUser(item)}
                disabled={isLoading}
              >
                <View className="items-center">
                  {/* Avatar grande e centralizado */}
                  <View className="w-24 h-24 bg-blue-500 rounded-full items-center justify-center mb-4 shadow-md">
                    <Text className="text-white font-bold text-4xl">
                      {item.login.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  {/* Info centralizada */}
                  <Text className="text-xl font-bold text-gray-900 mb-2 text-center" numberOfLines={1}>
                    @{item.login}
                  </Text>
                  <Text className="text-xs text-gray-600 text-center mb-1" numberOfLines={2}>
                    {item.email}
                  </Text>
                  <Text className="text-xs text-gray-400 text-center mt-2" numberOfLines={1}>
                    {item.ultacesso}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Footer discreto com info de conexão */}
        <View className="bg-white border-t border-gray-200 px-6 py-4" style={{ paddingBottom: insets.bottom + 16 }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-4">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <Text className="text-xs text-gray-500 flex-1" numberOfLines={1}>
                Conectado: {ipMkAuth}
              </Text>
            </View>
            <TouchableOpacity onPress={handleDisconnect} className="py-1">
              <Text className="text-xs text-gray-400">Desconectar</Text>
            </TouchableOpacity>
          </View>
        </View>
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

      {/* Loading Screen Fullscreen - Validação */}
      {validationState !== 'idle' && (
        <Animated.View 
          style={{ opacity: fadeAnim }}
          className="absolute inset-0 bg-white justify-center items-center z-50"
        >
          {validationState === 'validating' && (
            <View className="items-center">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-xl font-semibold text-gray-900 mt-6">
                Validando senha
              </Text>
              <Text className="text-sm text-gray-500 mt-2">
                Aguarde um momento...
              </Text>
            </View>
          )}

          {validationState === 'success' && (
            <Animated.View 
              style={{ transform: [{ scale: scaleAnim }] }}
              className="items-center"
            >
              {/* Check Icon Verde */}
              <View className="w-20 h-20 bg-green-500 rounded-full items-center justify-center mb-6">
                <Text className="text-white text-4xl font-bold">✓</Text>
              </View>
              <Text className="text-xl font-semibold text-gray-900">
                Bem-vindo, @{selectedUsuario?.login}!
              </Text>
              <Text className="text-sm text-gray-500 mt-2">
                Entrando no sistema...
              </Text>
            </Animated.View>
          )}

          {validationState === 'error' && (
            <Animated.View 
              style={{ transform: [{ scale: scaleAnim }] }}
              className="items-center"
            >
              {/* X Icon Vermelho */}
              <View className="w-20 h-20 bg-red-500 rounded-full items-center justify-center mb-6">
                <Text className="text-white text-4xl font-bold">✕</Text>
              </View>
              <Text className="text-xl font-semibold text-gray-900">
                Senha incorreta!
              </Text>
              <Text className="text-sm text-gray-500 mt-2">
                Tente novamente...
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      )}
    </>
  );
}