import { ClientSearchModal } from '@/components/ClientSearchModal';
import { useChamadoDetail, useFechaChamado, useReabrirChamado } from '@/hooks/chamado';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function ChamadoDetalhesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [fecharModalVisible, setFecharModalVisible] = useState(false);
  const [motivo, setMotivo] = useState('');
  const fechaChamadoMutation = useFechaChamado();
  const reabrirChamadoMutation = useReabrirChamado();
  const motivoInputRef = useRef<TextInput>(null);

  // Foca no input quando o modal abre
  useEffect(() => {
    if (fecharModalVisible) {
      // Timeout para garantir que o modal terminou a animação
      setTimeout(() => {
        motivoInputRef.current?.focus();
      }, 100);
    }
  }, [fecharModalVisible]);
  
  if (!id) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">ID do chamado não fornecido</Text>
      </View>
    );
  }

  const { data: chamado, isLoading, isFetching, error } = useChamadoDetail(id);

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
      <Stack.Screen
        options={{
          title: `Chamado #${chamado.chamado}`,
          headerBackTitle: 'Voltar',
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ScrollView className="flex-1">
          <View className="p-4 gap-4">
          {/* Status e Prioridade */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-500 text-xs mb-1">Status</Text>
                <View className={`${statusColor} px-3 py-1 rounded-full self-start`}>
                  <Text className={`${statusColor.split(' ')[1]} font-semibold text-sm`}>
                    {chamado.status}
                  </Text>
                </View>
              </View>
              <View>
                <Text className="text-gray-500 text-xs mb-1 text-right">Prioridade</Text>
                <View className={`${prioridadeColor} px-3 py-1 rounded-full`}>
                  <Text className={`${prioridadeColor.split(' ')[1]} font-semibold text-sm`}>
                    {chamado.prioridade}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Informações do Chamado */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-3">Informações do Chamado</Text>
            
            <View className="gap-3">
              <View>
                <Text className="text-gray-500 text-xs mb-1">Número do Chamado</Text>
                <Text className="text-gray-900 font-semibold">#{chamado.chamado}</Text>
              </View>

              <View className="border-t border-gray-100 pt-3">
                <Text className="text-gray-500 text-xs mb-1">Assunto</Text>
                <Text className="text-gray-900 font-medium">{chamado.assunto || 'Não informado'}</Text>
              </View>

              {chamado.reply && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Problema Reportado</Text>
                  <Text className="text-gray-900">{chamado.reply}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Informações do Cliente */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-3">Cliente</Text>
            
            <View className="gap-3">
              <TouchableOpacity 
                onPress={() => setSearchModalVisible(true)}
                className="active:opacity-70"
              >
                <View className="flex-row items-center justify-between border border-blue-200 bg-blue-50 rounded-lg p-3">
                  <View className="flex-1">
                    <Text className="text-blue-600 text-xs mb-1 font-medium">Nome (toque para buscar)</Text>
                    <Text className="text-gray-900 font-semibold">{chamado.nome || 'Não informado'}</Text>
                  </View>
                  <Ionicons name="search" size={20} color="#2563eb" />
                </View>
              </TouchableOpacity>

              {chamado.login && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Login/CPF</Text>
                  <Text className="text-gray-900">{chamado.login}</Text>
                </View>
              )}

              {chamado.email && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">E-mail</Text>
                  <Text className="text-gray-900">{chamado.email}</Text>
                </View>
              )}

              {chamado.ramal && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Ramal</Text>
                  <Text className="text-gray-900">{chamado.ramal}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Atendimento */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-3">Atendimento</Text>
            
            <View className="gap-3">
              <View>
                <Text className="text-gray-500 text-xs mb-1">Atendente Responsável</Text>
                <Text className="text-gray-900 font-semibold">
                  {chamado.atendente || 'Não atribuído'}
                </Text>
              </View>

              {chamado.tecnico && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">ID do Técnico</Text>
                  <Text className="text-gray-900">{chamado.tecnico}</Text>
                </View>
              )}

              {chamado.visita && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Visita Agendada</Text>
                  <Text className="text-gray-900 font-medium">{formatarDataCompleta(chamado.visita)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Datas */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-3">Datas</Text>
            
            <View className="gap-3">
              <View>
                <Text className="text-gray-500 text-xs mb-1">Data de Abertura</Text>
                <Text className="text-gray-900">{formatarDataCompleta(chamado.abertura)}</Text>
              </View>

              {chamado.fechamento && chamado.fechamento !== '0000-00-00' && chamado.fechamento !== '0000-00-00 00:00:00' && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Data de Fechamento</Text>
                  <Text className="text-gray-900">{formatarDataCompleta(chamado.fechamento)}</Text>
                </View>
              )}

              {chamado.motivo_fechar && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Motivo do Fechamento</Text>
                  <Text className="text-gray-900">{chamado.motivo_fechar}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Histórico de Relatos */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="bg-blue-100 p-2 rounded-full mr-2">
                <Text className="text-blue-600 text-base">📝</Text>
              </View>
              <Text className="text-lg font-bold text-gray-900">Histórico de Atualizações</Text>
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
                
                {chamado.relatos.map((relato, index) => {
                  // Formatar data/hora
                  const formatarData = (dataStr: string) => {
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
                  };

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
                              {formatarData(relato.msg_data)}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-gray-800 text-sm leading-5">{relato.msg}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Botão Fechar Chamado */}
          {chamado.status === 'aberto' && (
            <View className="bg-white rounded-lg p-4 shadow-sm">
              <TouchableOpacity
                onPress={() => setFecharModalVisible(true)}
                disabled={fechaChamadoMutation.isPending}
                className={`${
                  fechaChamadoMutation.isPending ? 'bg-gray-400' : 'bg-green-600'
                } py-4 px-6 rounded-lg items-center`}
              >
                <Text className="text-white font-bold text-base">
                  {fechaChamadoMutation.isPending ? 'Fechando...' : 'Fechar Chamado'}
                </Text>
              </TouchableOpacity>

              {fechaChamadoMutation.isError && (
                <Text className="text-red-600 text-sm mt-2 text-center">
                  Erro ao fechar chamado. Tente novamente.
                </Text>
              )}

              {fechaChamadoMutation.isSuccess && (
                <Text className="text-green-600 text-sm mt-2 text-center">
                  Chamado fechado com sucesso!
                </Text>
              )}
            </View>
          )}

          {/* Botão Reabrir Chamado */}
          {chamado.status === 'fechado' && (
            <View className="bg-white rounded-lg p-4 shadow-sm">
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
                              router.back();
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
                className={`${
                  reabrirChamadoMutation.isPending ? 'bg-gray-400' : 'bg-blue-600'
                } py-4 px-6 rounded-lg items-center flex-row justify-center gap-2`}
              >
                {reabrirChamadoMutation.isPending ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-bold text-base">Reabrindo...</Text>
                  </>
                ) : (
                  <Text className="text-white font-bold text-base">Reabrir Chamado</Text>
                )}
              </TouchableOpacity>

              {reabrirChamadoMutation.isError && (
                <Text className="text-red-600 text-sm mt-2 text-center">
                  Erro ao reabrir chamado. Tente novamente.
                </Text>
              )}
            </View>
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
      <Modal
        visible={fecharModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFecharModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md">
            <Text className="text-xl font-bold text-gray-900 mb-4">Fechar Chamado</Text>
            
            <TextInput
              ref={motivoInputRef}
              className="bg-gray-50 border border-gray-300 rounded-lg p-3 mb-4 text-gray-900"
              placeholder="Digite o motivo..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={motivo}
              onChangeText={setMotivo}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setFecharModalVisible(false);
                  setMotivo('');
                }}
                disabled={fechaChamadoMutation.isPending}
                className={`flex-1 py-3 rounded-lg ${
                  fechaChamadoMutation.isPending ? 'bg-gray-300' : 'bg-gray-200'
                }`}
              >
                <Text className="text-gray-700 font-semibold text-center">Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (motivo.trim()) {
                    fechaChamadoMutation.mutate(
                      {
                        numeroChamado: chamado!.chamado,
                        motivo: motivo.trim(),
                      },
                      {
                        onSuccess: () => {
                          setFecharModalVisible(false);
                          setMotivo('');

                          // Volta imediatamente para a agenda
                          router.back();

                          // Toast aparece na agenda (não-bloqueante)
                          setTimeout(() => {
                            Toast.show({
                              type: 'success',
                              text1: 'Chamado fechado com sucesso! ✅',
                              text2: 'Você pode vê-lo na aba Histórico',
                              position: 'top',
                              visibilityTime: 4000,
                              topOffset: 60,
                            });
                          }, 300);
                        },
                      }
                    );
                  } else {
                    Alert.alert('Atenção', 'Por favor, informe um motivo para o fechamento.');
                  }
                }}
                disabled={fechaChamadoMutation.isPending}
                className={`flex-1 py-3 rounded-lg ${
                  fechaChamadoMutation.isPending ? 'bg-green-400' : 'bg-green-600'
                }`}
              >
                {fechaChamadoMutation.isPending ? (
                  <View className="flex-row items-center justify-center gap-2">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-bold text-center">Fechando...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-bold text-center">Fechar Chamado</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </SafeAreaView>
    </>
  );
}
