import { FechaChamadoModal } from '@/components/chamado/FechaChamadoModal';
import { ClientSearchModal } from '@/components/ClientSearchModal';
import { Badge } from '@/components/ui/badge';
import { InfoRow } from '@/components/ui/info-row';
import { InfoSection } from '@/components/ui/info-section';
import { useTheme } from '@/contexts/ThemeContext';
import { useChamadoDetail, useFechaChamado, useReabrirChamado } from '@/hooks/chamado';
import { useFuncionarios } from '@/hooks/funcionario';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function ChamadoDetalhesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [fecharModalVisible, setFecharModalVisible] = useState(false);
  const fechaChamadoMutation = useFechaChamado();
  const reabrirChamadoMutation = useReabrirChamado();
  const { data: funcionarios } = useFuncionarios();
  const scrollRef = useRef<ScrollView>(null);

  const copiarParaClipboard = async (texto: string, label: string) => {
    await Clipboard.setStringAsync(texto);
    Toast.show({
      type: 'success',
      text1: `${label} copiado! 📋`,
      position: 'top',
      visibilityTime: 2000,
      topOffset: 60,
    });
  };

  if (!id) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.screenBackground }}>
        <Text style={{ color: colors.cardTextSecondary }}>ID do chamado não fornecido</Text>
      </View>
    );
  }

  const { data: chamado, isLoading, isFetching, error } = useChamadoDetail(id);

  // Função para buscar nome do técnico pelo ID
  const getNomeTecnico = (tecnicoId: string | null) => {
    if (!tecnicoId || !funcionarios) return null;
    const tecnico = funcionarios.find(f => f.id === tecnicoId);
    return tecnico ? tecnico.nome : null;
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.screenBackground }}>
        <ActivityIndicator size="large" color={colors.tabBarActiveTint} />
        <Text className="mt-4" style={{ color: colors.cardTextSecondary }}>Carregando chamado...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4" style={{ backgroundColor: colors.screenBackground }}>
        <Text className="text-red-600 text-lg font-semibold mb-2">Erro ao carregar chamado</Text>
        <Text className="text-center" style={{ color: colors.cardTextSecondary }}>
          {error instanceof Error ? error.message : 'Erro desconhecido'}
        </Text>
      </View>
    );
  }

  if (!chamado) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.screenBackground }}>
        <Text style={{ color: colors.cardTextSecondary }}>Chamado não encontrado</Text>
      </View>
    );
  }

  const statusColor = chamado.status === 'aberto' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  const prioridadeColor =
    chamado.prioridade === 'Alta' ? 'bg-red-100 text-red-800' :
      chamado.prioridade === 'Média' ? 'bg-yellow-100 text-yellow-800' :
        'bg-blue-100 text-blue-800';

  // Formatar data para dd/MM/yyyy HH:mm
  const formatarDataCompleta = (dataStr: string) => {
    try {
      const data = new Date(dataStr.replace(' ', 'T'));
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dataStr;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: `Chamado #${chamado.chamado}`,
          headerBackTitle: 'Voltar',
          headerStyle: {
            backgroundColor: colors.headerBackground,
          },
          headerTintColor: colors.headerText,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.screenBackground }} edges={['bottom']}>
        <ScrollView ref={scrollRef} className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4">
            {/* HERO SECTION - Informações Críticas */}
            <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.cardBorder }}>
              {/* Header com Status Badge e ID */}
              <View className="flex-row justify-between items-start mb-4">
                <Badge 
                  label={chamado.status === 'aberto' ? 'Aberto' : 'Fechado'}
                  color={chamado.status === 'aberto' ? 'orange' : 'green'}
                  variant="solid"
                />
                <Text className="text-xs font-medium" style={{ color: colors.cardTextSecondary }}>#{chamado.chamado}</Text>
              </View>

              {/* Cliente - Destaque Principal */}
              <TouchableOpacity
                onPress={() => setSearchModalVisible(true)}
                className="mb-4 active:opacity-80"
              >
                <Text className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: colors.cardTextSecondary }}>CLIENTE</Text>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-bold mb-1" numberOfLines={2} style={{ color: colors.cardTextPrimary }}>{chamado.nome || 'Cliente não informado'}</Text>
                    {chamado.login && (
                      <Text className="text-sm" style={{ color: colors.cardTextSecondary }}>{chamado.login}</Text>
                    )}
                  </View>
                  <View className="p-2 rounded-full ml-2" style={{ backgroundColor: colors.filterPillInactive }}>
                    <Ionicons name="chevron-forward" size={20} color={colors.cardTextSecondary} />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Problema */}
              <View className="mb-4">
                <Text className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: colors.cardTextSecondary }}>PROBLEMA</Text>
                <Text className="text-sm font-medium" style={{ color: colors.cardTextPrimary }}>
                  {chamado.assunto || 'Não informado'}
                </Text>
              </View>

              {/* Informações Principais - Técnico e Visita */}
              <View className="rounded-xl p-3 mb-4" style={{ backgroundColor: colors.searchInputBackground, borderWidth: 1, borderColor: colors.cardBorder }}>
                {/* Técnico */}
                <View className="mb-2">
                  <Text className="text-xs font-medium mb-1" style={{ color: colors.cardTextSecondary }}>Técnico</Text>
                  <Text className="text-sm font-semibold" numberOfLines={1} style={{ color: colors.cardTextPrimary }}>
                    {chamado.tecnico 
                      ? (getNomeTecnico(chamado.tecnico) || `ID #${chamado.tecnico}`)
                      : 'Não atribuído'
                    }
                  </Text>
                </View>

                {chamado.visita && (
                  <>
                    <View className="h-px my-2" style={{ backgroundColor: colors.infoRowBorder }} />
                    
                    {/* Visita Agendada */}
                    <View className="mb-2">
                      <Text className="text-xs font-medium mb-1" style={{ color: colors.cardTextSecondary }}>Visita Agendada</Text>
                      <Text className="text-sm font-semibold" style={{ color: colors.cardTextPrimary }}>
                        {formatarDataCompleta(chamado.visita)}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* INFORMAÇÕES ADMINISTRATIVAS */}
            <InfoSection title="Informações do Chamado" icon="document-text-outline" color="blue">
              <InfoRow 
                label="Aberto em" 
                value={formatarDataCompleta(chamado.abertura)} 
              />

              <InfoRow 
                label="Prioridade" 
                value={chamado.prioridade} 
              />

              {chamado.atendente && (
                <InfoRow label="Atendente" value={chamado.atendente} />
              )}

              {chamado.login_atend && (
                <InfoRow label="Login Atendente" value={chamado.login_atend} />
              )}

              {chamado.email && (
                <InfoRow label="E-mail" value={chamado.email} />
              )}

              {chamado.ramal && (
                <InfoRow label="Ramal" value={chamado.ramal} />
              )}

              {chamado.reply && (
                <InfoRow label="Reply" value={chamado.reply} />
              )}
            </InfoSection>

            {/* Histórico de Atualizações */}
            <InfoSection title="Histórico de Atualizações" icon="time-outline" color="purple" noContentWrapper>
              {!chamado.relatos && isFetching ? (
                // Loading skeleton enquanto relatos carregam
                <View className="py-8 items-center">
                  <ActivityIndicator size="small" color={colors.tabBarActiveTint} />
                  <Text className="text-sm text-center mt-2" style={{ color: colors.cardTextSecondary }}>Carregando histórico...</Text>
                </View>
              ) : !chamado.relatos || chamado.relatos.length === 0 ? (
                // Nenhum relato
                <View className="py-8 items-center">
                  <Text className="text-4xl mb-2">📭</Text>
                  <Text className="text-center" style={{ color: colors.cardTextSecondary }}>Nenhuma atualização registrada</Text>
                </View>
              ) : (
                // Lista de relatos com timeline
                <View className="relative">
                  {/* Linha vertical da timeline */}
                  <View className="absolute left-4 top-6 bottom-6 w-0.5" style={{ backgroundColor: colors.cardBorder }} />

                  {/* Evento de Abertura - aparece no início do histórico */}
                  <View className="relative mb-4">
                    {/* Círculo da timeline - azul para abertura */}
                    <View className="absolute left-0 w-8 h-8 rounded-full bg-blue-500 items-center justify-center border-2 z-10" style={{ borderColor: colors.cardBackground }}>
                      <Text className="text-sm">📋</Text>
                    </View>

                    {/* Conteúdo da abertura */}
                    <View 
                      className="ml-12 rounded-lg p-3" 
                      style={{ 
                        backgroundColor: colors.searchInputBackground, 
                        borderWidth: 1, 
                        borderColor: colors.tabBarActiveTint,
                        borderLeftWidth: 3,
                      }}
                    >
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1">
                          <Text className="font-bold text-sm" style={{ color: colors.tabBarActiveTint }}>Chamado Aberto</Text>
                          <Text className="text-xs mt-0.5" style={{ color: colors.cardTextSecondary }}>
                            {formatarDataRelativa(chamado.abertura)}
                          </Text>
                        </View>
                      </View>
                      {chamado.atendente && (
                        <Text className="text-xs mb-1" style={{ color: colors.cardTextPrimary }}>
                          por <Text className="font-semibold">{chamado.atendente}</Text>
                        </Text>
                      )}
                      {chamado.assunto && (
                        <Text className="text-sm leading-5" style={{ color: colors.cardTextPrimary }}>
                          {chamado.assunto}
                        </Text>
                      )}
                    </View>
                  </View>

                  {chamado.relatos.map((relato, index) => {
                    const isUltimo = index === chamado.relatos!.length - 1;

                    return (
                      <View
                        key={relato.id}
                        className={`relative ${!isUltimo ? 'mb-4' : ''}`}
                      >
                        {/* Círculo da timeline */}
                        <View className="absolute left-0 w-8 h-8 rounded-full bg-blue-100 items-center justify-center border-2 z-10" style={{ borderColor: colors.cardBackground }}>
                          <Text className="text-sm">💬</Text>
                        </View>

                        {/* Conteúdo do relato */}
                        <View className="ml-12 rounded-lg p-3" style={{ backgroundColor: colors.searchInputBackground, borderWidth: 1, borderColor: colors.cardBorder }}>
                          <View className="flex-row justify-between items-start mb-2">
                            <View className="flex-1">
                              <Text className="font-bold text-sm" style={{ color: colors.cardTextPrimary }}>{relato.atendente}</Text>
                              <Text className="text-xs mt-0.5" style={{ color: colors.cardTextSecondary }}>
                                {formatarDataRelativa(relato.msg_data)}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-sm leading-5" style={{ color: colors.cardTextPrimary }}>{relato.msg}</Text>
                        </View>
                      </View>
                    );
                  })}

                  {/* Evento de Fechamento - aparece no final do histórico */}
                  {chamado.status === 'fechado' && chamado.fechamento && chamado.fechamento !== '0000-00-00' && chamado.fechamento !== '0000-00-00 00:00:00' && (
                    <View className={`relative ${chamado.relatos && chamado.relatos.length > 0 ? 'mt-4' : ''}`}>
                      {/* Círculo da timeline - verde para fechamento */}
                      <View className="absolute left-0 w-8 h-8 rounded-full bg-green-500 items-center justify-center border-2 z-10" style={{ borderColor: colors.cardBackground }}>
                        <Text className="text-sm">✅</Text>
                      </View>

                      {/* Conteúdo do fechamento */}
                      <View 
                        className="ml-12 rounded-lg p-3" 
                        style={{ 
                          backgroundColor: colors.searchInputBackground, 
                          borderWidth: 1, 
                          borderColor: '#10b981',
                          borderLeftWidth: 3,
                        }}
                      >
                        <View className="flex-row justify-between items-start mb-2">
                          <View className="flex-1">
                            <Text className="font-bold text-sm" style={{ color: '#10b981' }}>Chamado Fechado</Text>
                            <Text className="text-xs mt-0.5" style={{ color: colors.cardTextSecondary }}>
                              {formatarDataRelativa(chamado.fechamento)}
                            </Text>
                          </View>
                        </View>
                        {chamado.motivo_fechar && (
                          <Text className="text-sm leading-5" style={{ color: colors.cardTextPrimary }}>
                            {chamado.motivo_fechar}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </InfoSection>

            {/* Botão de Ação Principal */}
            {chamado.status === 'aberto' && (
              <TouchableOpacity
                onPress={() => setFecharModalVisible(true)}
                disabled={fechaChamadoMutation.isPending}
                className="bg-green-600 py-4 rounded-2xl shadow-lg mb-6"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text className="text-white font-bold text-sm ml-2">
                    {fechaChamadoMutation.isPending ? 'Fechando...' : 'Fechar Chamado'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {chamado.status === 'fechado' && (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Reabrir Chamado',
                    'Tem certeza que deseja reabrir este chamado?',
                    [
                      {
                        text: 'Cancelar',
                        style: 'cancel',
                      },
                      {
                        text: 'Reabrir',
                        style: 'default',
                        onPress: () => {
                          reabrirChamadoMutation.mutate(chamado.chamado, {
                            onSuccess: () => {
                              // Scroll para o topo para exibir o badge "Aberto"
                              scrollRef.current?.scrollTo({ y: 0, animated: true });
                              
                              setTimeout(() => {
                                Toast.show({
                                  type: 'success',
                                  text1: 'Chamado reaberto com sucesso! 🔓',
                                  text2: 'Você pode vê-lo na aba Agenda',
                                  position: 'top',
                                  visibilityTime: 4000,
                                  topOffset: 60,
                                });
                              }, 300);
                            },
                          });
                        },
                      },
                    ]
                  );
                }}
                disabled={reabrirChamadoMutation.isPending}
                className="bg-blue-600 py-4 rounded-2xl shadow-lg mb-6"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="refresh-circle" size={20} color="white" />
                  <Text className="text-white font-bold text-sm ml-2">
                    {reabrirChamadoMutation.isPending ? 'Reabrindo...' : 'Reabrir Chamado'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Client Search Modal */}
        <ClientSearchModal
          visible={searchModalVisible}
          onClose={() => setSearchModalVisible(false)}
          initialSearchQuery={chamado?.nome || ''}
        />

        {/* Modal Fechar Chamado */}
        <FechaChamadoModal
          visible={fecharModalVisible}
          onClose={() => setFecharModalVisible(false)}
          numeroChamado={chamado!.chamado}
          fechaChamadoMutation={fechaChamadoMutation}
          onSuccess={() => {
            // Scroll para o topo para exibir o badge "Fechado"
            scrollRef.current?.scrollTo({ y: 0, animated: true });
          }}
        />
      </SafeAreaView>
    </>
  );
}

// Componente helper para formatar data relativa
function formatarDataRelativa(dataStr: string) {
  try {
    const data = new Date(dataStr.replace(' ', 'T'));
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    const dataFormatada = data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
    const horaFormatada = data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const dataData = new Date(data);
    dataData.setHours(0, 0, 0, 0);
    const hojeData = new Date(hoje);
    hojeData.setHours(0, 0, 0, 0);
    const ontemData = new Date(ontem);
    ontemData.setHours(0, 0, 0, 0);

    if (dataData.getTime() === hojeData.getTime()) {
      return `Hoje às ${horaFormatada}`;
    } else if (dataData.getTime() === ontemData.getTime()) {
      return `Ontem às ${horaFormatada}`;
    }
    return `${dataFormatada} às ${horaFormatada}`;
  } catch {
    return dataStr;
  }
}
