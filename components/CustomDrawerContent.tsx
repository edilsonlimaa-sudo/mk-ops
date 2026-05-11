import { useTheme } from '@/contexts/ThemeContext';
import { disconnectCompletely } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/useUserStore';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import Constants from 'expo-constants';
import { router, usePathname } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

/** Tipografia da drawer; cores sempre de `colors` (ThemeContext). */
const drawerFont = {
  userName: { fontSize: 20, fontWeight: '600' as const },
  userLogin: { fontSize: 14, fontWeight: '500' as const },
  menuItem: { fontSize: 14, fontWeight: '500' as const, marginLeft: 12 },
  section: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
  },
  themeSub: { fontSize: 12 },
  footer: { fontSize: 12, textAlign: 'center' as const },
};

export function CustomDrawerContent(props: any) {
  const { colors, mode, setMode } = useTheme();
  const ipMkAuth = useAuthStore(state => state.ipMkAuth);
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
          await new Promise(resolve => setTimeout(resolve, 300));
          await disconnectCompletely();
        },
      },
    ]);
  }, [props.navigation]);

  const handleSwitchUser = useCallback(async () => {
    Alert.alert('Trocar Usuário', 'Deseja fazer login com outro usuário?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Trocar',
        style: 'default',
        onPress: async () => {
          props.navigation.closeDrawer();
          await new Promise(resolve => setTimeout(resolve, 300));
          await clearIdentification();
        },
      },
    ]);
  }, [props.navigation, clearIdentification]);

  const ink = colors.text;
  const muted = colors.cardTextSecondary;
  const active = colors.tabBarActiveTint;
  const inactiveIcon = colors.tabBarInactiveTint;

  return (
    <DrawerContentScrollView
      {...props}
      style={[props.style, { paddingBottom: 0, backgroundColor: colors.cardBackground }]}
      contentContainerStyle={{ flex: 1, backgroundColor: colors.cardBackground }}>
      <Pressable
        onPress={() => {
          props.navigation.closeDrawer();
          router.push('/(app)/perfil');
        }}
        className="p-6 pt-12 active:opacity-70">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-3">
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{initials}</Text>
          </View>
          <View className="flex-1">
            <Text style={[drawerFont.userName, { color: ink }]} numberOfLines={1}>
              {currentUser?.nome?.split(' ')[0] || 'Usuário'}
            </Text>
            <Text style={[drawerFont.userLogin, { color: muted }]} numberOfLines={1}>
              @{currentUser?.login}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={inactiveIcon} />
        </View>
      </Pressable>

      <View className="flex-1 px-6 pt-2">
        <Pressable
          onPress={() => {
            props.navigation.closeDrawer();
            router.push('/');
          }}
          className="py-2 flex-row items-center justify-between active:opacity-60">
          <View className="flex-row items-center flex-1">
            <Ionicons
              name="calendar-outline"
              size={20}
              color={pathname === '/' ? active : inactiveIcon}
            />
            <Text style={[drawerFont.menuItem, { color: pathname === '/' ? active : ink }]}>
              Agenda
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={pathname === '/' ? active : colors.searchInputPlaceholder}
          />
        </Pressable>

        <Pressable
          onPress={() => {
            props.navigation.closeDrawer();
            router.push('/(app)/sobre');
          }}
          className="py-2 flex-row items-center justify-between active:opacity-60">
          <View className="flex-row items-center flex-1">
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={pathname === '/sobre' ? active : inactiveIcon}
            />
            <Text style={[drawerFont.menuItem, { color: pathname === '/sobre' ? active : ink }]}>
              Sobre
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={pathname === '/sobre' ? active : colors.searchInputPlaceholder}
          />
        </Pressable>

        <Pressable
          onPress={() => {
            props.navigation.closeDrawer();
            router.push('/(app)/ajuda');
          }}
          className="py-2 flex-row items-center justify-between active:opacity-60">
          <View className="flex-row items-center flex-1">
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={pathname === '/ajuda' ? active : inactiveIcon}
            />
            <Text style={[drawerFont.menuItem, { color: pathname === '/ajuda' ? active : ink }]}>
              Ajuda
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={pathname === '/ajuda' ? active : colors.searchInputPlaceholder}
          />
        </Pressable>

        <Pressable
          onPress={() => {
            props.navigation.closeDrawer();
            router.push('/(app)/limitacoes');
          }}
          className="py-2 flex-row items-center justify-between active:opacity-60">
          <View className="flex-row items-center flex-1">
            <Ionicons
              name="warning-outline"
              size={20}
              color={pathname === '/limitacoes' ? active : inactiveIcon}
            />
            <Text style={[drawerFont.menuItem, { color: pathname === '/limitacoes' ? active : ink }]}>
              Limitações da API
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={pathname === '/limitacoes' ? active : colors.searchInputPlaceholder}
          />
        </Pressable>

        <Text style={[drawerFont.section, { color: muted }]}>Tema</Text>

        <Pressable onPress={() => setMode('light')} className="py-2 flex-row items-center active:opacity-60">
          <Ionicons name="sunny" size={20} color={inactiveIcon} />
          <View className="flex-1 ml-3">
            <Text style={[drawerFont.menuItem, { marginLeft: 0 }, { color: mode === 'light' ? active : ink }]}>
              Claro
            </Text>
            <Text style={[drawerFont.themeSub, { color: muted }]}>Sempre modo claro</Text>
          </View>
        </Pressable>

        <Pressable onPress={() => setMode('dark')} className="py-2 flex-row items-center active:opacity-60">
          <Ionicons name="moon" size={20} color={inactiveIcon} />
          <View className="flex-1 ml-3">
            <Text style={[drawerFont.menuItem, { marginLeft: 0 }, { color: mode === 'dark' ? active : ink }]}>
              Escuro
            </Text>
            <Text style={[drawerFont.themeSub, { color: muted }]}>Sempre modo escuro</Text>
          </View>
        </Pressable>

        <Pressable onPress={() => setMode('auto')} className="py-2 flex-row items-center active:opacity-60">
          <Ionicons name="phone-portrait-outline" size={20} color={inactiveIcon} />
          <View className="flex-1 ml-3">
            <Text style={[drawerFont.menuItem, { marginLeft: 0 }, { color: mode === 'auto' ? active : ink }]}>
              Automático
            </Text>
            <Text style={[drawerFont.themeSub, { color: muted }]}>Usa o tema do sistema</Text>
          </View>
        </Pressable>

        <Text style={[drawerFont.section, { color: muted }]}>Conta</Text>

        <View>
          <Pressable onPress={handleSwitchUser} className="py-2 flex-row items-center active:opacity-60">
            <Ionicons name="swap-horizontal" size={20} color={inactiveIcon} />
            <View className="flex-1 ml-3">
              <Text style={[drawerFont.menuItem, { marginLeft: 0 }, { color: ink }]}>Trocar Usuário</Text>
              <Text style={[drawerFont.themeSub, { color: muted }]}>Mudar de conta</Text>
            </View>
          </Pressable>

          <Pressable onPress={handleLogout} className="py-2 flex-row items-center active:opacity-60">
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <View className="flex-1 ml-3">
              <Text style={[drawerFont.menuItem, { marginLeft: 0 }, { color: '#dc2626' }]}>Desconectar</Text>
              <Text style={[drawerFont.themeSub, { color: muted }]}>
                {ipMkAuth?.replace('https://', '').replace('http://', '') || 'Não conectado'}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      <View className="pt-4 pb-2">
        <Text style={[drawerFont.footer, { color: colors.searchInputPlaceholder }]}>
          v{appVersion} • {ipMkAuth?.replace('https://', '').replace('http://', '') || 'Não conectado'}
        </Text>
      </View>
    </DrawerContentScrollView>
  );
}
