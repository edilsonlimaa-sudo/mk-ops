import type { Instalacao } from '@/types/instalacao';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import type { UseMutationResult } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

interface FinalizacaoModalProps {
  visible: boolean;
  onClose: () => void;
  instalacao: Instalacao;
  onSuccess: () => void;
  fechaInstalacaoMutation: UseMutationResult<any, Error, string, unknown>;
  editaInstalacaoMutation: UseMutationResult<any, Error, { uuid: string; dados: any }, unknown>;
}

export function FinalizacaoModal({
  visible,
  onClose,
  instalacao,
  onSuccess,
  fechaInstalacaoMutation,
  editaInstalacaoMutation,
}: FinalizacaoModalProps) {
  const finalizacaoScrollRef = useRef<ScrollView>(null);
  
  // Estados para finalização
  const [visitadoSim, setVisitadoSim] = useState(false);
  const [instaladoSim, setInstaladoSim] = useState<boolean | null>(null);
  const [dataInstalacao, setDataInstalacao] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Resetar estados quando o modal fechar
  useEffect(() => {
    if (!visible) {
      setVisitadoSim(false);
      setInstaladoSim(null);
      setDataInstalacao(new Date());
      setShowDatePicker(false);
    }
  }, [visible]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDataInstalacao(selectedDate);
    }
  };

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: dataInstalacao,
        mode: 'date',
        onChange: (event, date) => {
          if (event.type === 'set' && date) {
            DateTimePickerAndroid.open({
              value: date,
              mode: 'time',
              onChange: (timeEvent, time) => {
                if (timeEvent.type === 'set' && time) {
                  setDataInstalacao(time);
                }
              },
            });
          }
        },
      });
    } else {
      setShowDatePicker(true);
    }
  };

  const handleFinalizar = () => {
    let dados: any = {
      visitado: visitadoSim ? 'sim' : 'nao',
    };

    if (!visitadoSim) {
      dados.instalado = 'nao';
      dados.datainst = undefined;
    } else {
      dados.instalado = instaladoSim === true ? 'sim' : 'nao';

      if (instaladoSim !== true) {
        dados.datainst = undefined;
      } else {
        const year = dataInstalacao.getFullYear();
        const month = String(dataInstalacao.getMonth() + 1).padStart(2, '0');
        const day = String(dataInstalacao.getDate()).padStart(2, '0');
        const hours = String(dataInstalacao.getHours()).padStart(2, '0');
        const minutes = String(dataInstalacao.getMinutes()).padStart(2, '0');
        dados.datainst = `${year}-${month}-${day} ${hours}:${minutes}:00`;
      }
    }

    editaInstalacaoMutation.mutate(
      { uuid: instalacao.uuid_solic, dados },
      {
        onSuccess: () => {
          fechaInstalacaoMutation.mutate(instalacao.uuid_solic, {
            onSuccess: () => {
              onClose();
              onSuccess();
              setTimeout(() => {
                Toast.show({
                  type: 'success',
                  text1: 'Instalação concluída! ✅',
                  text2: 'Você pode vê-la na aba Histórico',
                  position: 'top',
                  visibilityTime: 4000,
                  topOffset: 60,
                });
              }, 300);
            },
            onError: (error) => {
              Toast.show({
                type: 'error',
                text1: 'Erro ao fechar instalação',
                text2: error instanceof Error ? error.message : 'Tente novamente',
                position: 'top',
                topOffset: 60,
              });
            },
          });
        },
        onError: (error) => {
          Toast.show({
            type: 'error',
            text1: 'Erro ao salvar dados',
            text2: error instanceof Error ? error.message : 'Tente novamente',
            position: 'top',
            topOffset: 60,
          });
        },
      }
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-purple-50">
        {/* Header Celebrativo */}
        <View className="bg-purple-600 px-6 pt-14 pb-8">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-xl font-bold text-white mb-1">Finalizar Instalação</Text>
              <Text className="text-purple-100 text-sm">Complete as informações da instalação</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="bg-white/20 p-2 rounded-full">
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Ícone Central Celebrativo */}
          <View className="items-center">
            <View className="bg-white/20 w-20 h-20 rounded-full items-center justify-center">
              <View className="bg-white w-16 h-16 rounded-full items-center justify-center">
                <Ionicons name="rocket" size={28} color="#9333ea" />
              </View>
            </View>
          </View>
        </View>

        <ScrollView ref={finalizacaoScrollRef} className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6">
            {/* Card 1: Visita */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <View className="bg-purple-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Text className="text-purple-600 font-bold text-base">1</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900">Visita ao Cliente</Text>
                  <Text className="text-xs text-gray-500">O cliente foi visitado?</Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    setVisitadoSim(true);
                    setInstaladoSim(null);
                    // Scroll para esconder o passo 1 e mostrar o passo 2
                    setTimeout(() => {
                      finalizacaoScrollRef.current?.scrollTo({ y: 200, animated: true });
                    }, 100);
                  }}
                  style={{
                    backgroundColor: visitadoSim ? '#f0fdf4' : '#f9fafb',
                    borderColor: visitadoSim ? '#22c55e' : '#e5e7eb',
                    borderWidth: 2,
                  }}
                  className="flex-1 py-3 rounded-xl"
                >
                  <View className="items-center gap-2">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: visitadoSim ? '#22c55e' : '#e5e7eb',
                      }}
                    >
                      <Ionicons name="checkmark" size={24} color={visitadoSim ? 'white' : '#9ca3af'} />
                    </View>
                    <Text className={`font-bold ${visitadoSim ? 'text-green-700' : 'text-gray-500'}`}>
                      Sim
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setVisitadoSim(false);
                    setInstaladoSim(null);
                  }}
                  style={{
                    backgroundColor: visitadoSim === false ? '#f3f4f6' : '#f9fafb',
                    borderColor: visitadoSim === false ? '#9ca3af' : '#e5e7eb',
                    borderWidth: 2,
                  }}
                  className="flex-1 py-3 rounded-xl"
                >
                  <View className="items-center gap-2">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: visitadoSim === false ? '#9ca3af' : '#e5e7eb',
                      }}
                    >
                      <Ionicons name="close" size={24} color={visitadoSim === false ? 'white' : '#9ca3af'} />
                    </View>
                    <Text
                      className={`font-bold ${visitadoSim === false ? 'text-gray-700' : 'text-gray-500'}`}
                    >
                      Não
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Card 2: Instalação */}
            <View
              className={`bg-white rounded-2xl p-5 mb-4 shadow-sm border ${
                visitadoSim ? 'border-gray-100' : 'border-gray-200 opacity-50'
              }`}
            >
              <View className="flex-row items-center mb-4">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                    visitadoSim ? 'bg-purple-100' : 'bg-gray-100'
                  }`}
                >
                  <Text
                    className={`font-bold text-base ${visitadoSim ? 'text-purple-600' : 'text-gray-400'}`}
                  >
                    2
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-base font-bold ${visitadoSim ? 'text-gray-900' : 'text-gray-400'}`}
                  >
                    Status da Instalação
                  </Text>
                  <Text className={`text-xs ${visitadoSim ? 'text-gray-500' : 'text-gray-400'}`}>
                    A instalação foi realizada?
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    if (visitadoSim) {
                      setInstaladoSim(true);
                      // Scroll para esconder o passo 2 e focar no passo 3
                      setTimeout(() => {
                        finalizacaoScrollRef.current?.scrollTo({ y: 450, animated: true });
                      }, 100);
                    }
                  }}
                  disabled={!visitadoSim}
                  style={{
                    backgroundColor: !visitadoSim
                      ? '#f9fafb'
                      : instaladoSim === true
                      ? '#faf5ff'
                      : '#f9fafb',
                    borderColor: !visitadoSim
                      ? '#e5e7eb'
                      : instaladoSim === true
                      ? '#9333ea'
                      : '#e5e7eb',
                    borderWidth: 2,
                  }}
                  className="flex-1 py-3 rounded-xl"
                >
                  <View className="items-center gap-2">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: !visitadoSim
                          ? '#e5e7eb'
                          : instaladoSim === true
                          ? '#9333ea'
                          : '#e5e7eb',
                      }}
                    >
                      <Ionicons
                        name="checkmark-done"
                        size={24}
                        color={!visitadoSim ? '#9ca3af' : instaladoSim === true ? 'white' : '#9ca3af'}
                      />
                    </View>
                    <Text
                      className={`font-bold ${
                        !visitadoSim
                          ? 'text-gray-400'
                          : instaladoSim === true
                          ? 'text-purple-700'
                          : 'text-gray-500'
                      }`}
                    >
                      Sim
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => visitadoSim && setInstaladoSim(false)}
                  disabled={!visitadoSim}
                  style={{
                    backgroundColor: !visitadoSim
                      ? '#f9fafb'
                      : instaladoSim === false
                      ? '#fff7ed'
                      : '#f9fafb',
                    borderColor: !visitadoSim
                      ? '#e5e7eb'
                      : instaladoSim === false
                      ? '#f97316'
                      : '#e5e7eb',
                    borderWidth: 2,
                  }}
                  className="flex-1 py-3 rounded-xl"
                >
                  <View className="items-center gap-2">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: !visitadoSim
                          ? '#e5e7eb'
                          : instaladoSim === false
                          ? '#f97316'
                          : '#e5e7eb',
                      }}
                    >
                      <Ionicons
                        name="close-circle"
                        size={24}
                        color={!visitadoSim ? '#9ca3af' : instaladoSim === false ? 'white' : '#9ca3af'}
                      />
                    </View>
                    <Text
                      className={`font-bold ${
                        !visitadoSim
                          ? 'text-gray-400'
                          : instaladoSim === false
                          ? 'text-orange-700'
                          : 'text-gray-500'
                      }`}
                    >
                      Não
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Card 3: Data */}
            <View
              className={`bg-white rounded-2xl p-5 mb-4 shadow-sm border ${
                instaladoSim === true ? 'border-gray-100' : 'border-gray-200 opacity-50'
              }`}
            >
              <View className="flex-row items-center mb-4">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                    instaladoSim === true ? 'bg-purple-100' : 'bg-gray-100'
                  }`}
                >
                  <Text
                    className={`font-bold text-base ${
                      instaladoSim === true ? 'text-purple-600' : 'text-gray-400'
                    }`}
                  >
                    3
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-base font-bold ${
                      instaladoSim === true ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    Data da Instalação
                  </Text>
                  <Text
                    className={`text-xs ${instaladoSim === true ? 'text-gray-500' : 'text-gray-400'}`}
                  >
                    Quando foi realizada?
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={openDatePicker}
                disabled={instaladoSim !== true}
                className={`rounded-xl p-2 border-2 ${
                  instaladoSim === true ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: instaladoSim === true ? '#9333ea' : '#e5e7eb',
                      }}
                    >
                      <Ionicons
                        name="calendar"
                        size={20}
                        color={instaladoSim === true ? 'white' : '#9ca3af'}
                      />
                    </View>
                    <View>
                      <Text
                        className={`text-xs ${
                          instaladoSim === true ? 'text-purple-600' : 'text-gray-400'
                        } font-semibold`}
                      >
                        Data selecionada
                      </Text>
                      <Text
                        className={`text-sm font-bold ${
                          instaladoSim === true ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {dataInstalacao.toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                  {instaladoSim === true && <Ionicons name="chevron-forward" size={24} color="#9333ea" />}
                </View>
              </TouchableOpacity>

              {/* DatePicker iOS */}
              {showDatePicker && Platform.OS === 'ios' && instaladoSim === true && (
                <View className="mt-4">
                  <DateTimePicker
                    value={dataInstalacao}
                    mode="datetime"
                    display="spinner"
                    onChange={handleDateChange}
                    locale="pt-BR"
                  />
                </View>
              )}
            </View>

            {/* Botões dentro do ScrollView */}
            <View className="bg-white rounded-2xl p-4 border border-gray-100 mt-4">
              {/* Botão Principal - Finalizar */}
              <TouchableOpacity
                onPress={handleFinalizar}
                disabled={fechaInstalacaoMutation.isPending || editaInstalacaoMutation.isPending}
                className="bg-green-600 py-4 rounded-2xl mb-3 shadow-lg"
              >
                {fechaInstalacaoMutation.isPending || editaInstalacaoMutation.isPending ? (
                  <View className="flex-row items-center justify-center gap-2">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-bold text-base">Finalizando...</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center justify-center gap-2">
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text className="text-white font-bold text-base">Confirmar e Finalizar</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Botão Secundário - Cancelar */}
              <TouchableOpacity onPress={onClose} className="bg-gray-100 py-4 rounded-xl">
                <Text className="text-gray-700 font-semibold text-center text-base">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
