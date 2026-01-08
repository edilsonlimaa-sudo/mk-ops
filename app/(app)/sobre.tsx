import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SobreScreen() {
  const { colors, theme } = useTheme();
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1';

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Sobre',
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerText,
        }}
      />

      <SafeAreaView style={{ backgroundColor: colors.screenBackground }} className="flex-1" edges={['bottom']}>
        <ScrollView
          contentContainerClassName="p-6">
        {/* Logo/Ícone */}
        <View className="items-center mb-6">
          <View
            className="w-24 h-24 rounded-3xl items-center justify-center mb-4"
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe',
            }}>
            <Ionicons name="phone-portrait" size={48} color="#3b82f6" />
          </View>
          <Text className="text-2xl font-bold mb-1" style={{ color: colors.cardTextPrimary }}>
            MK Auth Mobile
          </Text>
          <Text className="text-base" style={{ color: colors.cardTextSecondary }}>
            v{appVersion} (Build {buildNumber})
          </Text>
        </View>

        {/* Descrição */}
        <View
          className="rounded-2xl p-5 mb-6 border"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
            borderColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe',
          }}>
          <Text className="text-base leading-6" style={{ color: colors.cardTextPrimary }}>
            Aplicativo móvel oficial para técnicos gerenciarem atendimentos, conectando-se
            diretamente ao servidor MK-Auth do seu provedor.
          </Text>
        </View>

        {/* Como Funciona */}
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="link" size={24} color="#3b82f6" />
            <Text className="text-lg font-bold ml-2" style={{ color: colors.cardTextPrimary }}>
              Como Funciona
            </Text>
          </View>

          <View className="rounded-2xl p-5" style={{ backgroundColor: colors.searchInputBackground }}>
            <Text className="text-sm leading-6 mb-3" style={{ color: colors.cardTextPrimary }}>
              O aplicativo se conecta <Text className="font-bold">diretamente</Text> ao servidor
              MK-Auth do seu provedor usando as credenciais fornecidas no login.
            </Text>
            <Text className="text-sm leading-6" style={{ color: colors.cardTextPrimary }}>
              Todas as consultas e operações são feitas em{' '}
              <Text className="font-bold">tempo real</Text> através da API REST oficial do MK-Auth,
              sem intermediários.
            </Text>
          </View>
        </View>

        {/* Segurança */}
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="shield-checkmark" size={24} color="#10b981" />
            <Text className="text-lg font-bold ml-2" style={{ color: colors.cardTextPrimary }}>
              Segurança & Privacidade
            </Text>
          </View>

          <View className="space-y-3">
            <SecurityItem
              icon="lock-closed"
              title="Sem Cópia de Dados"
              description="Não copiamos, armazenamos ou mantemos backup dos dados do seu MK-Auth. Tudo permanece apenas no seu servidor."
              colors={colors}
              theme={theme}
            />
            <SecurityItem
              icon="server"
              title="Sem Acesso ao Servidor"
              description="Não temos acesso ao seu servidor. Apenas o aplicativo instalado no celular do técnico se conecta."
              colors={colors}
              theme={theme}
            />
            <SecurityItem
              icon="phone-portrait"
              title="Cache Local Temporário"
              description="Para funcionar offline, o app mantém um cache temporário no celular. Esse cache é criptografado e apagado ao fazer logout."
              colors={colors}
              theme={theme}
            />
          </View>
        </View>

        {/* Suporte */}
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="headset" size={24} color="#ec4899" />
            <Text className="text-lg font-bold ml-2" style={{ color: colors.cardTextPrimary }}>
              Suporte
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:suporte@mkauthmobile.com')}
            className="rounded-2xl p-5"
            style={{ backgroundColor: colors.searchInputBackground }}>
            <View className="flex-row items-center">
              <Ionicons name="mail" size={20} color={colors.cardTextSecondary} />
              <Text className="text-sm ml-3" style={{ color: colors.cardTextPrimary }}>
                suporte@mkauthmobile.com
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <View className="items-center py-8 mb-4">
          <Text className="text-sm mb-2" style={{ color: colors.cardTextSecondary }}>
            © 2025 MK Auth Mobile
          </Text>
          <Text className="text-xs" style={{ color: colors.cardTextSecondary }}>
            Integração segura e transparente
          </Text>
        </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function SecurityItem({
  icon,
  title,
  description,
  colors,
  theme,
}: {
  icon: string;
  title: string;
  description: string;
  colors: any;
  theme: string;
}) {
  return (
    <View
      className="rounded-xl p-4 border mb-3"
      style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }}>
      <View className="flex-row items-start mb-2">
        <View
          className="w-8 h-8 rounded-full items-center justify-center mr-3 mt-0.5"
          style={{ backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5' }}>
          <Ionicons name={icon as any} size={16} color="#10b981" />
        </View>
        <Text className="text-base font-semibold flex-1" style={{ color: colors.cardTextPrimary }}>
          {title}
        </Text>
      </View>
      <Text className="text-sm leading-5 ml-11" style={{ color: colors.cardTextSecondary }}>
        {description}
      </Text>
    </View>
  );
}
