import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import Constants from 'expo-constants';
import { router, usePathname } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

export function CustomDrawerContent(props: any) {
  const { colors, mode, setMode, theme } = useTheme();
  const { ipMkAuth, logout } = useAuthStore();
  const { currentUser, clearIdentification } = useUserStore();
  const pathname = usePathname();

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const initials = useMemo(
    () =>
      currentUser?.nome
        ? currentUser.nome
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
        : '?',
    [currentUser?.nome]
  );

  const handleLogout = useCallback(async () => {
    Alert.alert('Desconectar', 'Deseja desconectar da API?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desconectar',
        style: 'destructive',
        onPress: async () => {
          props.navigation.closeDrawer();
          // Aguarda animação do drawer completar antes de mudar estado
          await new Promise(resolve => setTimeout(resolve, 300));
          await clearIdentification();
          await logout();
        },
      },
    ]);
  }, [props.navigation, clearIdentification, logout]);

  const handleSwitchUser = useCallback(async () => {
    Alert.alert('Trocar Usuário', 'Deseja fazer login com outro usuário?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Trocar',
        style: 'default',
        onPress: async () => {
          props.navigation.closeDrawer();
          // Aguarda animação do drawer completar antes de mudar estado
          await new Promise(resolve => setTimeout(resolve, 300));
          await clearIdentification();
          // AppLayout detecta mudança e redireciona automaticamente
        },
      },
    ]);
  }, [props.navigation, clearIdentification]);

  return (
    <DrawerContentScrollView
      {...props}
      className="bg-white dark:bg-gray-900"
      contentContainerStyle={{ flex: 1 }}
      contentContainerClassName="flex-1"
      style={{ paddingBottom: 0 }}>
      {/* Header */}
      <Pressable
        onPress={() => {
          props.navigation.closeDrawer();
          router.push('/(app)/perfil');
        }}
        className="p-6 pt-12 active:opacity-70">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-3">
            <Text className="text-white text-base font-semibold">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xl font-semibold text-gray-900 dark:text-white">
              {currentUser?.nome?.split(' ')[0] || 'Usuário'}
            </Text>
            <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
              @{currentUser?.login}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6b7280" />
        </View>
      </Pressable>

      {/* Menu */}
      <View className="flex-1 px-6 pt-2">
        <Pressable
          onPress={() => {
            props.navigation.closeDrawer();
            router.push('/');
          }}
          className="py-2 flex-row items-center justify-between active:opacity-60">
          <View className="flex-row items-center flex-1">
            <Ionicons name="calendar-outline" size={20} color={pathname === '/' ? '#3b82f6' : '#6b7280'} />
            <Text className={`text-sm font-medium ml-3 ${pathname === '/' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
              Agenda
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={pathname === '/' ? '#3b82f6' : '#9ca3af'} />
        </Pressable>

        <Pressable
          onPress={() => {
            props.navigation.closeDrawer();
            router.push('/(app)/sobre');
          }}
          className="py-2 flex-row items-center justify-between active:opacity-60">
          <View className="flex-row items-center flex-1">
            <Ionicons name="information-circle-outline" size={20} color={pathname === '/sobre' ? '#3b82f6' : '#6b7280'} />
            <Text className={`text-sm font-medium ml-3 ${pathname === '/sobre' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
              Sobre
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={pathname === '/sobre' ? '#3b82f6' : '#9ca3af'} />
        </Pressable>

        <Pressable
          onPress={() => {
            props.navigation.closeDrawer();
            router.push('/(app)/ajuda');
          }}
          className="py-2 flex-row items-center justify-between active:opacity-60">
          <View className="flex-row items-center flex-1">
            <Ionicons name="help-circle-outline" size={20} color={pathname === '/ajuda' ? '#3b82f6' : '#6b7280'} />
            <Text className={`text-sm font-medium ml-3 ${pathname === '/ajuda' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
              Ajuda
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={pathname === '/ajuda' ? '#3b82f6' : '#9ca3af'} />
        </Pressable>

        <Pressable
          onPress={() => {
            props.navigation.closeDrawer();
            router.push('/(app)/limitacoes');
          }}
          className="py-2 flex-row items-center justify-between active:opacity-60">
          <View className="flex-row items-center flex-1">
            <Ionicons name="warning-outline" size={20} color={pathname === '/limitacoes' ? '#3b82f6' : '#6b7280'} />
            <Text className={`text-sm font-medium ml-3 ${pathname === '/limitacoes' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
              Limitações da API
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={pathname === '/limitacoes' ? '#3b82f6' : '#9ca3af'} />
        </Pressable>

        <Text className="text-xs uppercase tracking-wide font-semibold mb-2 mt-4 text-gray-500 dark:text-gray-400">
          Tema
        </Text>

        <Pressable
          onPress={() => setMode('light')}
          className="py-2 flex-row items-center active:opacity-60">
          <Ionicons name="sunny" size={20} color="#6b7280" />
          <View className="flex-1 ml-3">
            <Text className={`text-sm font-medium ${mode === 'light' ? 'text-blue-500' : 'text-gray-900 dark:text-white'}`}>
              Claro
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Sempre modo claro
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => setMode('dark')}
          className="py-2 flex-row items-center active:opacity-60">
          <Ionicons name="moon" size={20} color="#6b7280" />
          <View className="flex-1 ml-3">
            <Text className={`text-sm font-medium ${mode === 'dark' ? 'text-blue-500' : 'text-gray-900 dark:text-white'}`}>
              Escuro
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Sempre modo escuro
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => setMode('auto')}
          className="py-2 flex-row items-center active:opacity-60">
          <Ionicons name="phone-portrait-outline" size={20} color="#6b7280" />
          <View className="flex-1 ml-3">
            <Text className={`text-sm font-medium ${mode === 'auto' ? 'text-blue-500' : 'text-gray-900 dark:text-white'}`}>
              Automático
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Usa o tema do sistema
            </Text>
          </View>
        </Pressable>

        <Text className="text-xs uppercase tracking-wide font-semibold mb-2 mt-4 text-gray-500 dark:text-gray-400">
          Conta
        </Text>

        <View>
          <Pressable
            onPress={handleSwitchUser}
            className="py-2 flex-row items-center active:opacity-60">
            <Ionicons name="swap-horizontal" size={20} color="#6b7280" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-medium text-gray-900 dark:text-white">
                Trocar Usuário
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Mudar de conta
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={handleLogout}
            className="py-2 flex-row items-center active:opacity-60">
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-medium text-red-600">
                Desconectar
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {ipMkAuth?.replace('https://', '').replace('http://', '') || 'Não conectado'}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Footer */}
      <View className="pt-4 pb-2">
        <Text className="text-xs text-center text-gray-400 dark:text-gray-500">
          v{appVersion} • {ipMkAuth?.replace('https://', '').replace('http://', '') || 'Não conectado'}
        </Text>
      </View>
    </DrawerContentScrollView>
  );
}
