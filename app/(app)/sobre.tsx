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
            {Constants.expoConfig?.name || 'Mk-Ops'}
          </Text>
          <Text className="text-base" style={{ color: colors.cardTextSecondary }}>
            v{appVersion} (Build {buildNumber})
          </Text>
          <Text className="text-sm mt-2 text-center px-2" style={{ color: colors.cardTextSecondary }}>
            Operações de campo integradas à API do MK-Auth do seu provedor.
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
            O Mk-Ops é um app para técnicos em campo: agenda de instalações e chamados, detalhes do
            cliente, busca e ações do dia a dia, sempre falando com o{' '}
            <Text className="font-bold">mesmo MK-Auth</Text> que o provedor já utiliza — sem
            servidor intermediário.
          </Text>
        </View>

        {/* Como Funciona */}
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="link" size={24} color="#3b82f6" />
            <Text className="text-lg font-bold ml-2" style={{ color: colors.cardTextPrimary }}>
              Fluxo no aparelho
            </Text>
          </View>

          <View className="rounded-2xl p-5" style={{ backgroundColor: colors.searchInputBackground }}>
            <Text className="text-sm leading-6 mb-3" style={{ color: colors.cardTextPrimary }}>
              Na primeira vez, o app guia o <Text className="font-bold">cadastro do servidor</Text>,{' '}
              <Text className="font-bold">credenciais da API</Text> (Client ID / Secret),{' '}
              <Text className="font-bold">permissões</Text> esperadas no MK-Auth e um teste de
              conexão. Depois você <Text className="font-bold">identifica o usuário</Text> (login do
              técnico) e passa a usar a <Text className="font-bold">Agenda</Text> (menu lateral),
              busca no topo e o tema claro/escuro quando quiser.
            </Text>
            <Text className="text-sm leading-6" style={{ color: colors.cardTextPrimary }}>
              Os dados vêm da API do seu MK-Auth; o app mantém cache local (React Query) para lista e
              detalhes já abertos — com internet as alterações são enviadas ao servidor.
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
              title="Dados no seu MK-Auth"
              description="O provedor continua dono dos dados: o app consulta e altera via API no servidor que você configurou. Não há nuvem nossa entre técnico e MK-Auth."
              colors={colors}
              theme={theme}
            />
            <SecurityItem
              icon="server"
              title="Conexão direta"
              description="Somente o app no seu celular usa a URL e as credenciais informadas no setup. A equipe do Mk-Ops não acessa seu servidor."
              colors={colors}
              theme={theme}
            />
            <SecurityItem
              icon="phone-portrait"
              title="Cache e sessão"
              description="Listas e detalhes já carregados podem ser lidos sem rede por um tempo (cache). Tokens e dados sensíveis seguem as práticas do app (Secure Store onde aplicável). Ao desconectar, a sessão com a API é encerrada."
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
              <View className="flex-1 ml-3">
                <Text className="text-sm" style={{ color: colors.cardTextPrimary }}>
                  suporte@mkauthmobile.com
                </Text>
                <Text className="text-xs mt-1" style={{ color: colors.cardTextSecondary }}>
                  Dúvidas sobre o app. Problemas de rede, permissões ou faturamento: fale com o seu
                  provedor.
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <View className="items-center py-8 mb-4">
          <Text className="text-sm mb-2" style={{ color: colors.cardTextSecondary }}>
            © {new Date().getFullYear()} Mk-Ops
          </Text>
          <Text className="text-xs" style={{ color: colors.cardTextSecondary }}>
            Integração com a API do MK-Auth
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
