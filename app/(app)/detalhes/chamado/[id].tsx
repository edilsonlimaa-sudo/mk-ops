import { FechaChamadoModal } from '@/components/chamado/FechaChamadoModal';
import { ClientSearchModal } from '@/components/ClientSearchModal';
import { InfoRow } from '@/components/instalacao/InfoRows';
import { useChamadoDetail, useFechaChamado, useReabrirChamado } from '@/hooks/chamado';
import { useFuncionarios } from '@/hooks/funcionario';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">ID do chamado não fornecido</Text>
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
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#0284c7" />
        <Text className="mt-4 text-gray-600">Carregando chamado...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-4">
        <Text className="text-red-600 text-lg font-semibold mb-2">Erro ao carregar chamado</Text>
        <Text className="text-gray-600 text-center">
          {error instanceof Error ? error.message : 'Erro desconhecido'}
        </Text>
      </View>
    );
  }

  if (!chamado) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Chamado não encontrado</Text>
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
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          title: `Chamado #${chamado.chamado}`,
          headerBackTitle: 'Voltar',
          headerStyle: {
            backgroundColor: '#0284c7',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ScrollView ref={scrollRef} className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4">
            {/* HERO SECTION - Informações Críticas */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
              {/* Header com Status Badge e ID */}
              <View className="flex-row justify-between items-start mb-4">
                <View className={`${chamado.status === 'aberto' ? 'bg-amber-400' : 'bg-green-400'} px-3 py-1.5 rounded-full`}>
                  <Text className={`${chamado.status === 'aberto' ? 'text-amber-900' : 'text-green-900'} font-bold text-xs uppercase tracking-wide`}>
                    {chamado.status === 'aberto' ? 'Aberto' : 'Fechado'}
                  </Text>
                </View>
                <Text className="text-gray-500 text-xs font-medium">#{chamado.chamado}</Text>
              </View>

              {/* Cliente - Destaque Principal */}
              <TouchableOpacity
                onPress={() => setSearchModalVisible(true)}
                className="mb-4 active:opacity-80"
              >
                <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">CLIENTE</Text>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-gray-900 text-base font-bold mb-1" numberOfLines={2}>{chamado.nome || 'Cliente não informado'}</Text>
                    {chamado.login && (
                      <Text className="text-gray-500 text-sm">{chamado.login}</Text>
                    )}
                  </View>
                  <View className="bg-gray-100 p-2 rounded-full ml-2">
                    <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Problema */}
              <View className="mb-4">
                <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">PROBLEMA</Text>
                <Text className="text-gray-900 text-sm font-medium">
                  {chamado.assunto || 'Não informado'}
                </Text>
              </View>

              {/* Informações Principais - Técnico e Visita */}
              <View className="bg-gray-50 rounded-xl p-3 border border-gray-200 mb-4">
                {/* Técnico */}
                <View className="mb-2">
                  <Text className="text-gray-500 text-xs font-medium mb-1">Técnico</Text>
                  <Text className="text-gray-900 text-sm font-semibold" numberOfLines={1}>
                    {chamado.tecnico 
                      ? (getNomeTecnico(chamado.tecnico) || `ID #${chamado.tecnico}`)
                      : 'Não atribuído'
                    }
                  </Text>
                </View>

                {chamado.visita && (
                  <>
                    <View className="h-px bg-gray-200 my-2" />
                    
                    {/* Visita Agendada */}
                    <View className="mb-2">
                      <Text className="text-gray-500 text-xs font-medium mb-1">Visita Agendada</Text>
                      <Text className="text-gray-900 text-sm font-semibold">
                        {formatarDataCompleta(chamado.visita)}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* INFORMAÇÕES ADMINISTRATIVAS */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
              <View className="flex-row items-center mb-4">
                <View className="bg-sky-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="document-text-outline" size={20} color="#0284c7" />
                </View>
                <Text className="text-sm text-gray-900 font-bold flex-1">Informações do Chamado</Text>
              </View>

              <View className="gap-2">
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
              </View>
            </View>

            {/* Histórico de Atualizações */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
              <View className="flex-row items-center mb-4">
                <View className="bg-purple-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="time-outline" size={20} color="#9333ea" />
                </View>
                <Text className="text-sm text-gray-900 font-bold flex-1">Histórico de Atualizações</Text>
              </View>

              {!chamado.relatos && isFetching ? (
                // Loading skeleton enquanto relatos carregam
                <View className="py-8 items-center">
                  <ActivityIndicator size="small" color="#0284c7" />
                  <Text className="text-gray-500 text-sm text-center mt-2">Carregando histórico...</Text>
                </View>
              ) : !chamado.relatos || chamado.relatos.length === 0 ? (
                // Nenhum relato
                <View className="py-8 items-center">
                  <Text className="text-4xl mb-2">📭</Text>
                  <Text className="text-gray-500 text-center">Nenhuma atualização registrada</Text>
                </View>
              ) : (
                // Lista de relatos com timeline
                <View className="relative">
                  {/* Linha vertical da timeline */}
                  <View className="absolute left-4 top-6 bottom-6 w-0.5 bg-gray-200" />

                  {/* Evento de Abertura - aparece no início do histórico */}
                  <View className="relative mb-4">
                    {/* Círculo da timeline - azul para abertura */}
                    <View className="absolute left-0 w-8 h-8 rounded-full bg-blue-500 items-center justify-center border-2 border-white z-10">
                      <Text className="text-sm">📋</Text>
                    </View>

                    {/* Conteúdo da abertura */}
                    <View className="ml-12 bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1">
                          <Text className="text-blue-900 font-bold text-sm">Chamado Aberto</Text>
                          <Text className="text-blue-600 text-xs mt-0.5">
                            {formatarDataRelativa(chamado.abertura)}
                          </Text>
                        </View>
                      </View>
                      {chamado.atendente && (
                        <Text className="text-blue-900 text-xs mb-1">
                          por <Text className="font-semibold">{chamado.atendente}</Text>
                        </Text>
                      )}
                      {chamado.assunto && (
                        <Text className="text-blue-900 text-sm leading-5">
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
                        <View className="absolute left-0 w-8 h-8 rounded-full bg-blue-100 items-center justify-center border-2 border-white z-10">
                          <Text className="text-sm">💬</Text>
                        </View>

                        {/* Conteúdo do relato */}
                        <View className="ml-12 bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <View className="flex-row justify-between items-start mb-2">
                            <View className="flex-1">
                              <Text className="text-gray-900 font-bold text-sm">{relato.atendente}</Text>
                              <Text className="text-gray-500 text-xs mt-0.5">
                                {formatarDataRelativa(relato.msg_data)}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-gray-800 text-sm leading-5">{relato.msg}</Text>
                        </View>
                      </View>
                    );
                  })}

                  {/* Evento de Fechamento - aparece no final do histórico */}
                  {chamado.status === 'fechado' && chamado.fechamento && chamado.fechamento !== '0000-00-00' && chamado.fechamento !== '0000-00-00 00:00:00' && (
                    <View className={`relative ${chamado.relatos && chamado.relatos.length > 0 ? 'mt-4' : ''}`}>
                      {/* Círculo da timeline - verde para fechamento */}
                      <View className="absolute left-0 w-8 h-8 rounded-full bg-green-100 items-center justify-center border-2 border-white z-10">
                        <Text className="text-sm">✅</Text>
                      </View>

                      {/* Conteúdo do fechamento */}
                      <View className="ml-12 bg-green-50 rounded-lg p-3 border border-green-200">
                        <View className="flex-row justify-between items-start mb-2">
                          <View className="flex-1">
                            <Text className="text-green-900 font-bold text-sm">Chamado Fechado</Text>
                            <Text className="text-green-600 text-xs mt-0.5">
                              {formatarDataRelativa(chamado.fechamento)}
                            </Text>
                          </View>
                        </View>
                        {chamado.motivo_fechar && (
                          <Text className="text-green-900 text-sm leading-5">
                            {chamado.motivo_fechar}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>

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
