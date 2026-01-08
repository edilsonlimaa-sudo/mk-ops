import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LimitacoesScreen() {
  const { colors, theme } = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Limitações da API',
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerText,
        }}
      />

      <SafeAreaView style={{ backgroundColor: colors.screenBackground }} className="flex-1" edges={['bottom']}>
        <ScrollView contentContainerClassName="p-6">
        {/* Introdução */}
        <View
          className="rounded-2xl p-5 mb-6 border"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : '#fffbeb',
            borderColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.3)' : '#fde68a',
          }}>
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={24} color="#f59e0b" />
            <View className="flex-1 ml-3">
              <Text className="text-base font-bold mb-2" style={{ color: colors.cardTextPrimary }}>
                Por que essas limitações?
              </Text>
              <Text className="text-sm leading-6" style={{ color: colors.cardTextPrimary }}>
                O aplicativo se conecta diretamente à API do MK-Auth. As funcionalidades disponíveis
                dependem do que a API permite.
              </Text>
            </View>
          </View>
        </View>

        {/* Chamados */}
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="construct" size={24} color="#ef4444" />
            <Text className="text-lg font-bold ml-2" style={{ color: colors.cardTextPrimary }}>
              Chamados
            </Text>
          </View>

          <LimitationSection
            title="Pode Editar"
            type="allowed"
            items={[
              { field: 'Assunto', description: 'Alterar título/descrição' },
              { field: 'Prioridade', description: 'Mudar nível de prioridade' },
              { field: 'Status', description: 'Fechar ou reabrir chamado' },
            ]}
            colors={colors}
            theme={theme}
          />

          <LimitationSection
            title="NÃO Pode Editar"
            type="blocked"
            items={[
              {
                field: 'Data da Visita',
                description: 'A API não permite alterar a data agendada',
              },
              {
                field: 'Técnico',
                description: 'Não é possível atribuir ou mudar o técnico',
              },
              { field: 'Cliente', description: 'Não pode alterar o cliente vinculado' },
            ]}
            colors={colors}
            theme={theme}
          />
        </View>

        {/* Instalações */}
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="home" size={24} color="#10b981" />
            <Text className="text-lg font-bold ml-2" style={{ color: colors.cardTextPrimary }}>
              Instalações
            </Text>
          </View>

          <LimitationSection
            title="Pode Editar"
            type="allowed"
            items={[
              { field: 'Data da Visita', description: 'Alterar data e hora agendadas' },
              { field: 'Técnico', description: 'Atribuir ou mudar o técnico' },
              { field: 'Plano', description: 'Alterar o plano contratado' },
              { field: 'Observações', description: 'Adicionar ou editar notas' },
              { field: 'Contatos', description: 'Editar e-mail, telefone e celular' },
            ]}
            colors={colors}
            theme={theme}
          />

          <LimitationSection
            title="NÃO Pode Editar"
            type="blocked"
            items={[
              {
                field: 'Reabrir',
                description: 'API não disponibiliza endpoint para reabertura',
              },
            ]}
            colors={colors}
            theme={theme}
          />
        </View>

        {/* Clientes */}
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="people" size={24} color="#8b5cf6" />
            <Text className="text-lg font-bold ml-2" style={{ color: colors.cardTextPrimary }}>
              Clientes
            </Text>
          </View>

          <View
            className="rounded-xl p-4 border"
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : '#faf5ff',
              borderColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.3)' : '#e9d5ff',
            }}>
            <View className="flex-row items-center mb-3">
              <Ionicons name="eye" size={20} color="#8b5cf6" />
              <Text className="text-base font-bold ml-2" style={{ color: colors.cardTextPrimary }}>
                Somente Leitura
              </Text>
            </View>
            <Text className="text-sm leading-6" style={{ color: colors.cardTextPrimary }}>
              Todos os dados de clientes são somente para consulta. O app não permite criar, editar
              ou excluir clientes.
            </Text>
          </View>
        </View>

        {/* Solução */}
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="bulb" size={24} color="#f59e0b" />
            <Text className="text-lg font-bold ml-2" style={{ color: colors.cardTextPrimary }}>
              Como Contornar?
            </Text>
          </View>

          <WorkaroundItem
            icon="globe"
            title="Use o Painel Web"
            description="Para operações não suportadas, acesse o MK-Auth pelo navegador."
            colors={colors}
          />
          <WorkaroundItem
            icon="call"
            title="Solicite ao Administrador"
            description="Entre em contato com o administrador do sistema."
            colors={colors}
          />
        </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function LimitationSection({
  title,
  type,
  items,
  colors,
  theme,
}: {
  title: string;
  type: 'allowed' | 'blocked';
  items: { field: string; description: string }[];
  colors: any;
  theme: string;
}) {
  const isAllowed = type === 'allowed';
  const bgColor = isAllowed
    ? theme === 'dark'
      ? 'rgba(16, 185, 129, 0.1)'
      : '#f0fdf4'
    : theme === 'dark'
      ? 'rgba(239, 68, 68, 0.1)'
      : '#fef2f2';
  const borderColor = isAllowed
    ? theme === 'dark'
      ? 'rgba(16, 185, 129, 0.3)'
      : '#bbf7d0'
    : theme === 'dark'
      ? 'rgba(239, 68, 68, 0.3)'
      : '#fecaca';
  const iconColor = isAllowed ? '#10b981' : '#ef4444';
  const iconName = isAllowed ? 'checkmark-circle' : 'close-circle';

  return (
    <View
      className="rounded-xl p-4 mb-3 border"
      style={{ backgroundColor: bgColor, borderColor: borderColor }}>
      <View className="flex-row items-center mb-3">
        <Ionicons name={iconName} size={20} color={iconColor} />
        <Text className="text-base font-bold ml-2" style={{ color: colors.cardTextPrimary }}>
          {title}:
        </Text>
      </View>
      <View className="space-y-2">
        {items.map((item, index) => (
          <View key={index} className="mb-2">
            <Text className="text-sm font-semibold" style={{ color: colors.cardTextPrimary }}>
              • {item.field}
            </Text>
            <Text className="text-xs leading-5 ml-3" style={{ color: colors.cardTextSecondary }}>
              {item.description}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function WorkaroundItem({
  icon,
  title,
  description,
  colors,
}: {
  icon: string;
  title: string;
  description: string;
  colors: any;
}) {
  return (
    <View
      className="rounded-xl p-4 mb-3"
      style={{ backgroundColor: colors.searchInputBackground }}>
      <View className="flex-row items-start">
        <Ionicons name={icon as any} size={20} color="#f59e0b" className="mr-3 mt-0.5" />
        <View className="flex-1">
          <Text className="text-base font-semibold mb-1" style={{ color: colors.cardTextPrimary }}>
            {title}
          </Text>
          <Text className="text-sm leading-5" style={{ color: colors.cardTextSecondary }}>
            {description}
          </Text>
        </View>
      </View>
    </View>
  );
}
