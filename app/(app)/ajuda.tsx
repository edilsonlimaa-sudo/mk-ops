import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AjudaScreen() {
  const { colors, theme } = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Ajuda',
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerText,
        }}
      />

      <SafeAreaView style={{ backgroundColor: colors.screenBackground }} className="flex-1" edges={['bottom']}>
        <ScrollView contentContainerClassName="p-6">
        {/* Guia Rápido */}
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="rocket" size={24} color="#10b981" />
            <Text className="text-lg font-bold ml-2" style={{ color: colors.cardTextPrimary }}>
              Guia Rápido
            </Text>
          </View>

          <GuideItem
            icon="calendar"
            title="Ver seus atendimentos"
            description="Acesse a 'Agenda' no menu. Visualize chamados e instalações agendados."
            colors={colors}
            theme={theme}
          />
          <GuideItem
            icon="search"
            title="Buscar um cliente"
            description="Use o ícone de busca no topo. Busque por nome, CPF, telefone ou login."
            colors={colors}
            theme={theme}
          />
          <GuideItem
            icon="checkmark-done"
            title="Fechar um chamado"
            description="Abra os detalhes do chamado, role até o final e toque 'Fechar Chamado'."
            colors={colors}
            theme={theme}
          />
        </View>

        {/* Problemas Comuns */}
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="construct" size={24} color="#f59e0b" />
            <Text className="text-lg font-bold ml-2" style={{ color: colors.cardTextPrimary }}>
              Problemas Comuns
            </Text>
          </View>

          <ProblemItem
            icon="wifi"
            problem="Não consigo conectar"
            solution="Verifique o IP do servidor MK-Auth. Confirme se o servidor está online."
            colors={colors}
          />
          <ProblemItem
            icon="refresh-circle"
            problem="Dados desatualizados"
            solution="Puxe para baixo nas listas para forçar atualização."
            colors={colors}
          />
          <ProblemItem
            icon="log-out"
            problem="Fui desconectado"
            solution="O token expira por segurança. Faça login novamente."
            colors={colors}
          />
        </View>

        {/* Modo Offline */}
        <View
          className="rounded-2xl p-5 mb-6 border"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : '#faf5ff',
            borderColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.3)' : '#e9d5ff',
          }}>
          <View className="flex-row items-center mb-3">
            <Ionicons name="cloud-offline" size={24} color="#8b5cf6" />
            <Text className="text-lg font-bold ml-2" style={{ color: colors.cardTextPrimary }}>
              Modo Offline
            </Text>
          </View>
          <Text className="text-sm leading-6 mb-3" style={{ color: colors.cardTextPrimary }}>
            O app funciona parcialmente sem internet:
          </Text>
          <View className="space-y-2">
            <View className="flex-row items-start">
              <Ionicons name="checkmark-circle" size={18} color="#10b981" className="mt-0.5" />
              <Text className="text-sm ml-2 flex-1" style={{ color: colors.cardTextPrimary }}>
                Visualizar dados já consultados (cache local)
              </Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons name="close-circle" size={18} color="#ef4444" className="mt-0.5" />
              <Text className="text-sm ml-2 flex-1" style={{ color: colors.cardTextPrimary }}>
                Buscar novos dados ou fazer atualizações
              </Text>
            </View>
          </View>
        </View>

        {/* Dicas */}
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="bulb" size={24} color="#eab308" />
            <Text className="text-lg font-bold ml-2" style={{ color: colors.cardTextPrimary }}>
              Dicas
            </Text>
          </View>

          <TipItem
            icon="flash"
            tip="Puxe para baixo em qualquer lista para atualizar rapidamente"
            colors={colors}
          />
          <TipItem
            icon="copy"
            tip="Pressione e segure em telefones e CPFs para copiar"
            colors={colors}
          />
          <TipItem
            icon="sync"
            tip="Consulte dados importantes antes de sair para área sem cobertura"
            colors={colors}
          />
        </View>

        {/* Suporte */}
        <View
          className="rounded-2xl p-5 mb-6 border"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
            borderColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe',
          }}>
          <View className="flex-row items-center mb-3">
            <Ionicons name="help-buoy" size={24} color="#3b82f6" />
            <Text className="text-lg font-bold ml-2" style={{ color: colors.cardTextPrimary }}>
              Precisa de Ajuda?
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:suporte@mkauthmobile.com')}
            className="bg-blue-500 rounded-xl p-4 active:bg-blue-600">
            <View className="flex-row items-center justify-center">
              <Ionicons name="mail" size={20} color="white" />
              <Text className="text-white text-base font-semibold ml-2">
                suporte@mkauthmobile.com
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function GuideItem({
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
      className="rounded-xl p-4 mb-3 border"
      style={{
        backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4',
        borderColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : '#bbf7d0',
      }}>
      <View className="flex-row items-center mb-2">
        <View
          className="w-8 h-8 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: '#10b981' }}>
          <Ionicons name={icon as any} size={18} color="white" />
        </View>
        <Text className="text-base font-bold flex-1" style={{ color: colors.cardTextPrimary }}>
          {title}
        </Text>
      </View>
      <Text className="text-sm leading-5 ml-11" style={{ color: colors.cardTextSecondary }}>
        {description}
      </Text>
    </View>
  );
}

function ProblemItem({
  icon,
  problem,
  solution,
  colors,
}: {
  icon: string;
  problem: string;
  solution: string;
  colors: any;
}) {
  return (
    <View
      className="rounded-xl p-4 mb-3"
      style={{ backgroundColor: colors.searchInputBackground }}>
      <View className="flex-row items-start mb-2">
        <Ionicons name={icon as any} size={20} color="#f59e0b" className="mr-3 mt-0.5" />
        <Text className="text-base font-semibold flex-1" style={{ color: colors.cardTextPrimary }}>
          {problem}
        </Text>
      </View>
      <Text className="text-sm leading-5 ml-8" style={{ color: colors.cardTextSecondary }}>
        {solution}
      </Text>
    </View>
  );
}

function TipItem({ icon, tip, colors }: { icon: string; tip: string; colors: any }) {
  return (
    <View className="flex-row items-start mb-3">
      <Ionicons name={icon as any} size={18} color="#eab308" className="mr-3 mt-0.5" />
      <Text className="flex-1 text-sm leading-5" style={{ color: colors.cardTextPrimary }}>
        {tip}
      </Text>
    </View>
  );
}
