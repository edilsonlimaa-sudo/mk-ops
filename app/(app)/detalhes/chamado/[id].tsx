import { ClientSearchModal } from '@/components/ClientSearchModal';
import { useChamadoDetail, useFechaChamado, useReabrirChamado } from '@/hooks/chamado';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
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
  const [motivo, setMotivo] = useState('');
  const fechaChamadoMutation = useFechaChamado();
  const reabrirChamadoMutation = useReabrirChamado();
  const motivoInputRef = useRef<TextInput>(null);

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
          <View className="p-4">
            {/* Card Principal */}
            <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
              {/* Header */}
              <View className="mb-4 pb-3 border-b border-gray-100">
                <Text className="text-gray-400 text-xs">#{chamado.chamado}</Text>
              </View>

              {/* Cliente */}
              <TouchableOpacity
                onPress={() => setSearchModalVisible(true)}
                className="active:opacity-70 mb-4"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-gray-500 text-xs mb-1">CLIENTE</Text>
                    <Text className="text-gray-900 text-xl font-bold mb-1">{chamado.nome || 'Cliente não informado'}</Text>
                    {chamado.login && (
                      <Text className="text-gray-500 text-sm">{chamado.login}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </TouchableOpacity>

              {/* Problema */}
              <View className="mb-4">
                <Text className="text-gray-500 text-xs mb-1">PROBLEMA</Text>
                <Text className="text-gray-900 text-base font-medium">
                  {chamado.assunto || 'Não informado'}
                </Text>
              </View>

              {/* Visita Agendada - Destaque mais sutil */}
              {chamado.visita && (
                <View className="mb-4 pb-4 border-b border-gray-100">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-orange-600 text-xs font-semibold mb-1">VISITA AGENDADA</Text>
                      <Text className="text-gray-900 font-bold">
                        {formatarDataCompleta(chamado.visita)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Informações em InfoRow */}
              <View className="gap-3">
                {/* Status com badge */}
                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-gray-600 text-sm">Status</Text>
                  <View className={`${statusColor} px-3 py-1 rounded-full`}>
                    <Text className={`${statusColor.split(' ')[1]} font-semibold text-xs`}>
                      {chamado.status}
                    </Text>
                  </View>
                </View>

                {/* Prioridade com badge */}
                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-gray-600 text-sm">Prioridade</Text>
                  <View className={`${prioridadeColor} px-3 py-1 rounded-full`}>
                    <Text className={`${prioridadeColor.split(' ')[1]} font-semibold text-xs`}>
                      {chamado.prioridade}
                    </Text>
                  </View>
                </View>

                <InfoRow 
                  label="Aberto em" 
                  value={formatarDataCompleta(chamado.abertura)} 
                />
                
                {chamado.atendente && (
                  <InfoRow label="Atendente" value={chamado.atendente} />
                )}

                {chamado.tecnico && (
                  <InfoRow label="Técnico" value={`ID #${chamado.tecnico}`} />
                )}

                {chamado.email && (
                  <InfoRow label="E-mail" value={chamado.email} />
                )}

                {chamado.ramal && (
                  <InfoRow label="Ramal" value={chamado.ramal} />
                )}
              </View>
            </View>

            {/* Histórico de Atualizações */}
            <View className="bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-xs text-gray-500 uppercase font-semibold mb-4">Histórico de Atualizações</Text>

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
                            {(() => {
                              try {
                                const data = new Date(chamado.abertura.replace(' ', 'T'));
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
                                return chamado.abertura;
                              }
                            })()}
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
                              {(() => {
                                try {
                                  const data = new Date(chamado.fechamento.replace(' ', 'T'));
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
                                  return chamado.fechamento;
                                }
                              })()}
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

            {/* Botão de Ação */}
            {chamado.status === 'aberto' && (
              <TouchableOpacity
                onPress={() => setFecharModalVisible(true)}
                disabled={fechaChamadoMutation.isPending}
                className="bg-green-600 py-3.5 rounded-lg shadow-sm active:opacity-90 mt-3"
              >
                <Text className="text-white font-semibold text-center">
                  {fechaChamadoMutation.isPending ? 'Fechando...' : 'Fechar Chamado'}
                </Text>
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
                className="bg-blue-600 py-3.5 rounded-lg shadow-sm active:opacity-90 mt-3"
              >
                <Text className="text-white font-semibold text-center">
                  {reabrirChamadoMutation.isPending ? 'Reabrindo...' : 'Reabrir Chamado'}
                </Text>
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
        <Modal
          visible={fecharModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setFecharModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
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
                    className={`flex-1 py-3 rounded-lg ${fechaChamadoMutation.isPending ? 'bg-gray-300' : 'bg-gray-200'
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

                              // Aguarda modal fechar antes de navegar
                              setTimeout(() => {
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
                                }, 100);
                              }, 200);
                            },
                          }
                        );
                      } else {
                        Alert.alert('Atenção', 'Por favor, informe um motivo para o fechamento.');
                      }
                    }}
                    disabled={fechaChamadoMutation.isPending}
                    className={`flex-1 py-3 rounded-lg ${fechaChamadoMutation.isPending ? 'bg-green-400' : 'bg-green-600'
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
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </>
  );
}

// Componente helper para exibir informações com long press para copiar
function InfoRow({ label, value }: { label: string; value: string }) {
  const copiarValor = async () => {
    await Clipboard.setStringAsync(value);
    Toast.show({
      type: 'success',
      text1: `${label} copiado! 📋`,
      position: 'top',
      visibilityTime: 2000,
      topOffset: 60,
    });
  };

  return (
    <Pressable 
      onLongPress={copiarValor}
      delayLongPress={500}
      className="flex-row justify-between py-2 border-b border-gray-100"
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? '#f3f4f6' : 'transparent',
        }
      ]}
    >
      <Text className="text-gray-600 text-sm">{label}</Text>
      <Text className="text-gray-900 text-sm font-medium flex-1 text-right ml-4">
        {value}
      </Text>
    </Pressable>
  );
}
