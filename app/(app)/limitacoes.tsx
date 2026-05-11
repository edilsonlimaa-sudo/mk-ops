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
                O Mk-Ops só faz o que a API do seu MK-Auth expõe. Permissões de OAuth, versão do painel
                e regras do provedor podem mudar o que é aceito em cada rota.
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
            title="No app (hoje)"
            type="allowed"
            items={[
              {
                field: 'Detalhes e histórico',
                description: 'Visualizar dados do chamado e linha do tempo de relatos.',
              },
              {
                field: 'Fechar',
                description: 'Chamado aberto pode ser fechado com motivo (modal no final da tela).',
              },
              {
                field: 'Reabrir',
                description: 'Chamado fechado pode ser reaberto pelo botão na tela, se a API permitir.',
              },
            ]}
            colors={colors}
            theme={theme}
          />

          <LimitationSection
            title="Não há no app"
            type="blocked"
            items={[
              {
                field: 'Editar assunto ou prioridade',
                description: 'Não existe edição inline desses campos na tela de chamado.',
              },
              {
                field: 'Alterar técnico ou data de visita',
                description: 'Use o painel web do MK-Auth se a operação for necessária.',
              },
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
            title="No app (edição)"
            type="allowed"
            items={[
              {
                field: 'Agenda e responsável',
                description: 'Data/hora da visita e técnico, quando a tela oferecer edição.',
              },
              {
                field: 'Plano, contatos e endereço',
                description: 'Plano, e-mail, telefones, endereço completo e CEP, entre outros.',
              },
              {
                field: 'Acesso e equipamento',
                description: 'Login, senha (com cuidado), IP, MAC, comodato, equipamento.',
              },
              {
                field: 'Valores e observações',
                description: 'Valor, vencimento, observações; coordenadas com mapa onde existir.',
              },
              {
                field: 'Finalização',
                description: 'Fluxo de finalizar instalação quando disponível na tela.',
              },
            ]}
            colors={colors}
            theme={theme}
          />

          <LimitationSection
            title='O que a API não aceitar'
            type="blocked"
            items={[
              {
                field: 'Campos rejeitados',
                description: 'O servidor pode devolver erro para um campo; nesse caso ajuste no painel ou peça ao administrador.',
              },
              {
                field: 'Reversão de finalização',
                description: 'Reabrir ou alterar instalação já finalizada depende da API — pode ser só pelo painel web.',
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
              <Ionicons name="create-outline" size={20} color="#8b5cf6" />
              <Text className="text-base font-bold ml-2" style={{ color: colors.cardTextPrimary }}>
                Edição e limites
              </Text>
            </View>
            <Text className="text-sm leading-6 mb-3" style={{ color: colors.cardTextPrimary }}>
              Nos detalhes do cliente (rotas da Agenda), vários campos podem ser alterados quando aparecem
              com ícone de edição — por exemplo dados de contato, endereço, coordenadas e observações. O
              que for salvo depende do endpoint{' '}
              <Text className="font-semibold">/api/cliente/editar</Text> do seu MK-Auth.
            </Text>
            <Text className="text-sm leading-6" style={{ color: colors.cardTextSecondary }}>
              O app não oferece criar cliente novo nem excluir cadastro; isso permanece no painel web.
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
            description="Para operações que o app não cobre (cadastro em massa, exclusões, regras avançadas), use o MK-Auth no navegador."
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
