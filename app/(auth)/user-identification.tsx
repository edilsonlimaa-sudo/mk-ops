import { ImmersiveLoadingScreen } from '@/components/ImmersiveLoadingScreen';
import { PasswordModal } from '@/components/PasswordModal';
import { useTheme } from '@/contexts/ThemeContext';
import { useUsuarios } from '@/hooks/usuario';
import { validatePassword } from '@/services/api/usuario';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';
import { Usuario } from '@/types/usuario';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ValidationState = 'idle' | 'validating' | 'success' | 'error';
type InitialLoadState = 'loading' | 'success' | 'done';

export default function UserIdentification() {
  console.log('👤 [UserIdentification] Componente renderizado');
  const { flow = 'login' } = useLocalSearchParams<{ flow?: 'login' | 'switchUser' }>();
  const { theme, colors } = useTheme();
  const { identifyUser } = useUserStore();
  const { ipMkAuth, logout } = useAuthStore();

  const { data: usuarios = [], isLoading, isError, refetch } = useUsuarios();
  console.log('📋 [UserIdentification] Usuários carregados:', usuarios?.length || 0);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>('idle');

  // Se flow=switchUser (troca de usuário), pula o intro imersivo
  const [initialLoadState, setInitialLoadState] = useState<InitialLoadState>(
    flow === 'switchUser' ? 'done' : 'loading'
  );

  // Controla o loading inicial (quando vem da tela de login)
  useEffect(() => {
    if (initialLoadState === 'loading') {
      // Quando carregar os usuários, mostra o green check
      if (!isLoading && !isError && usuarios.length > 0) {
        setInitialLoadState('success');
      }
    }
  }, [isLoading, isError, usuarios, initialLoadState]);

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

      // Valida senha via service layer (retorna usuário validado)
      const usuarioDetalhado = await validatePassword(selectedUsuario.uuid, password);
      console.log('✅ [UserIdentification] Senha validada com sucesso');

      // Mostra animação de sucesso
      setValidationState('success');

      // Aguarda animação completar ANTES de identificar (evita redirect prematuro)
      await new Promise(resolve => setTimeout(resolve, 1800));

      // Identifica o usuário (guard vai redirecionar automaticamente)
      console.log('💾 [UserIdentification] Identificando usuário...');
      await identifyUser(usuarioDetalhado);
      console.log('✨ [UserIdentification] Usuário identificado! Guard vai redirecionar...');

    } catch (error) {
      console.error('❌ [UserIdentification] Erro:', error);
      setValidationState('error');
      // Mantém selectedUsuario para poder tentar novamente
    }
  };

  // Se ainda está no loading inicial, não renderiza nada (tela de loading vai cobrir)
  if (initialLoadState !== 'done') {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        {/* Loading Screen Fullscreen - Carregamento Inicial */}
        <ImmersiveLoadingScreen
          visible={true}
          state={initialLoadState}
          loadingTitle="Buscando funcionários"
          loadingSubtitle="Aguarde um momento..."
          successTitle="Conectado com sucesso!"
          successSubtitle="Funcionários carregados..."
          errorTitle="" // Not used in initial load
          onAnimationComplete={() => setInitialLoadState('done')}
        />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ backgroundColor: colors.screenBackground }} className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ color: colors.cardTextSecondary }} className="mt-4">Carregando funcionários...</Text>
        </View>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ backgroundColor: colors.screenBackground }} className="flex-1 items-center justify-center px-6" edges={['bottom']}>
          <Text className="text-2xl mb-2">😕</Text>
          <Text style={{ color: colors.cardTextPrimary }} className="font-semibold text-lg mb-2">Erro ao carregar funcionários</Text>
          <Text style={{ color: colors.cardTextSecondary }} className="text-center mb-4">Não foi possível buscar a lista de usuários</Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Tentar novamente</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </>
    );
  }

  if (usuarios.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ backgroundColor: colors.screenBackground }} className="flex-1 items-center justify-center px-6" edges={['bottom']}>
          <Text className="text-2xl mb-2">👥</Text>
          <Text style={{ color: colors.cardTextPrimary }} className="font-semibold text-lg mb-2">Nenhum funcionário encontrado</Text>
          <Text style={{ color: colors.cardTextSecondary }} className="text-center mb-4">Não há usuários cadastrados no sistema</Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Tentar novamente</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ backgroundColor: colors.screenBackground }} className="flex-1" edges={['top', 'bottom']}>
        {/* Hero Section direto (sem header de navegador rs) */}
        <View style={{ backgroundColor: colors.cardBackground, borderBottomColor: colors.cardBorder }} className="px-6 pb-8 pt-10 border-b">
          <Text style={{ color: colors.cardTextPrimary }} className="text-4xl font-bold mb-3 text-center">
            👋 Quem é você?
          </Text>
          <Text style={{ color: colors.cardTextSecondary }} className="text-lg text-center">
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
                style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder, width: 180 }}
                className="rounded-3xl p-6 mx-3 shadow-lg border active:scale-95"
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
                  <Text style={{ color: colors.cardTextPrimary }} className="text-xl font-bold mb-2 text-center" numberOfLines={1}>
                    @{item.login}
                  </Text>
                  <Text style={{ color: colors.cardTextSecondary }} className="text-xs text-center mb-1" numberOfLines={2}>
                    {item.email}
                  </Text>
                  <Text style={{ color: theme === 'dark' ? '#64748b' : '#9ca3af' }} className="text-xs text-center mt-2" numberOfLines={1}>
                    {item.ultacesso}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Footer discreto com info de conexão */}
        <View style={{ backgroundColor: colors.cardBackground, borderTopColor: colors.cardBorder }} className="border-t px-6 py-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-4">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <Text style={{ color: colors.cardTextSecondary }} className="text-xs flex-1" numberOfLines={1}>
                Conectado: {ipMkAuth}
              </Text>
            </View>
            <TouchableOpacity onPress={handleDisconnect} className="py-1">
              <Text style={{ color: theme === 'dark' ? '#64748b' : '#9ca3af' }} className="text-xs">Desconectar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

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
      <ImmersiveLoadingScreen
        visible={validationState !== 'idle'}
        state={validationState === 'validating' ? 'loading' : (validationState as 'success' | 'error')}
        loadingTitle="Validando senha"
        loadingSubtitle="Aguarde um momento..."
        successTitle={`Bem-vindo, @${selectedUsuario?.login}!`}
        successSubtitle="Entrando no sistema..."
        errorTitle="Senha incorreta!"
        errorSubtitle="Tente novamente..."
        onAnimationComplete={() => {
          if (validationState === 'error') {
            setValidationState('idle');
            setPasswordModalVisible(true); // Reabre modal (mantém selectedUsuario!)
          }
        }}
      />
    </>
  );
}