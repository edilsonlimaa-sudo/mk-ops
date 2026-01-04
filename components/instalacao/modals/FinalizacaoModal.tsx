import { useTheme } from '@/contexts/ThemeContext';
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
  const { colors, theme } = useTheme();
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
      <View style={{ backgroundColor: colors.screenBackground }} className="flex-1">
        {/* Header Celebrativo */}
        <View style={{ backgroundColor: colors.headerBackground }} className="px-6 pt-14 pb-8">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text style={{ color: colors.cardTextPrimary }} className="text-xl font-bold mb-1">Finalizar Instalação</Text>
              <Text style={{ color: colors.cardTextSecondary }} className="text-sm">Complete as informações da instalação</Text>
            </View>
            <TouchableOpacity 
              onPress={onClose} 
              style={{ backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
              className="p-2 rounded-full"
            >
              <Ionicons name="close" size={24} color={colors.cardTextPrimary} />
            </TouchableOpacity>
          </View>

          {/* Ícone Central Celebrativo */}
          <View className="items-center">
            <View 
              style={{ backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe' }}
              className="w-20 h-20 rounded-full items-center justify-center"
            >
              <View 
                style={{ backgroundColor: colors.cardBackground }}
                className="w-16 h-16 rounded-full items-center justify-center"
              >
                <Ionicons name="rocket" size={28} color={theme === 'dark' ? '#60a5fa' : '#2563eb'} />
              </View>
            </View>
          </View>
        </View>

        <ScrollView ref={finalizacaoScrollRef} className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6">
            {/* Card 1: Visita */}
            <View 
              style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }} 
              className="rounded-2xl p-5 mb-4 shadow-sm border"
            >
              <View className="flex-row items-center mb-4">
                <View 
                  style={{ backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe' }} 
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                >
                  <Text style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }} className="font-bold text-base">1</Text>
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.cardTextPrimary }} className="text-base font-bold">Visita ao Cliente</Text>
                  <Text style={{ color: colors.cardTextSecondary }} className="text-xs">O cliente foi visitado?</Text>
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
                    backgroundColor: visitadoSim ? '#f0fdf4' : colors.searchInputBackground,
                    borderColor: visitadoSim ? '#22c55e' : colors.cardBorder,
                    borderWidth: 2,
                  }}
                  className="flex-1 py-3 rounded-xl"
                >
                  <View className="items-center gap-2">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: visitadoSim ? '#22c55e' : (theme === 'dark' ? '#374151' : '#e5e7eb'),
                      }}
                    >
                      <Ionicons name="checkmark" size={24} color={visitadoSim ? 'white' : '#9ca3af'} />
                    </View>
                    <Text style={{ color: visitadoSim ? '#15803d' : colors.cardTextSecondary }} className="font-bold">
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
                    backgroundColor: visitadoSim === false ? (theme === 'dark' ? '#374151' : '#f3f4f6') : colors.searchInputBackground,
                    borderColor: visitadoSim === false ? '#9ca3af' : colors.cardBorder,
                    borderWidth: 2,
                  }}
                  className="flex-1 py-3 rounded-xl"
                >
                  <View className="items-center gap-2">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: visitadoSim === false ? '#9ca3af' : (theme === 'dark' ? '#374151' : '#e5e7eb'),
                      }}
                    >
                      <Ionicons name="close" size={24} color={visitadoSim === false ? 'white' : '#9ca3af'} />
                    </View>
                    <Text style={{ color: visitadoSim === false ? colors.cardTextPrimary : colors.cardTextSecondary }} className="font-bold">
                      Não
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Card 2: Instalação */}
            <View
              style={{ 
                backgroundColor: colors.cardBackground, 
                borderColor: colors.cardBorder,
                opacity: visitadoSim ? 1 : 0.5
              }}
              className="rounded-2xl p-5 mb-4 shadow-sm border"
            >
              <View className="flex-row items-center mb-4">
                <View
                  style={{ 
                    backgroundColor: visitadoSim 
                      ? (theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe') 
                      : (theme === 'dark' ? '#374151' : '#f3f4f6')
                  }}
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                >
                  <Text
                    style={{ color: visitadoSim ? (theme === 'dark' ? '#60a5fa' : '#2563eb') : colors.cardTextSecondary }}
                    className="font-bold text-base"
                  >
                    2
                  </Text>
                </View>
                <View className="flex-1">
                  <Text style={{ color: visitadoSim ? colors.cardTextPrimary : colors.cardTextSecondary }} className="text-base font-bold">
                    Status da Instalação
                  </Text>
                  <Text style={{ color: colors.cardTextSecondary }} className="text-xs">
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
                      ? colors.searchInputBackground
                      : instaladoSim === true
                      ? (theme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff')
                      : colors.searchInputBackground,
                    borderColor: !visitadoSim
                      ? colors.cardBorder
                      : instaladoSim === true
                      ? '#3b82f6'
                      : colors.cardBorder,
                    borderWidth: 2,
                  }}
                  className="flex-1 py-3 rounded-xl"
                >
                  <View className="items-center gap-2">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: !visitadoSim
                          ? (theme === 'dark' ? '#374151' : '#e5e7eb')
                          : instaladoSim === true
                          ? '#3b82f6'
                          : (theme === 'dark' ? '#374151' : '#e5e7eb'),
                      }}
                    >
                      <Ionicons
                        name="checkmark-done"
                        size={24}
                        color={!visitadoSim ? '#9ca3af' : instaladoSim === true ? 'white' : '#9ca3af'}
                      />
                    </View>
                    <Text
                      style={{ 
                        color: !visitadoSim 
                          ? colors.cardTextSecondary 
                          : instaladoSim === true 
                          ? (theme === 'dark' ? '#60a5fa' : '#2563eb')
                          : colors.cardTextSecondary
                      }}
                      className="font-bold"
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
                      ? colors.searchInputBackground
                      : instaladoSim === false
                      ? (theme === 'dark' ? 'rgba(249, 115, 22, 0.15)' : '#fff7ed')
                      : colors.searchInputBackground,
                    borderColor: !visitadoSim
                      ? colors.cardBorder
                      : instaladoSim === false
                      ? '#f97316'
                      : colors.cardBorder,
                    borderWidth: 2,
                  }}
                  className="flex-1 py-3 rounded-xl"
                >
                  <View className="items-center gap-2">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: !visitadoSim
                          ? (theme === 'dark' ? '#374151' : '#e5e7eb')
                          : instaladoSim === false
                          ? '#f97316'
                          : (theme === 'dark' ? '#374151' : '#e5e7eb'),
                      }}
                    >
                      <Ionicons
                        name="close-circle"
                        size={24}
                        color={!visitadoSim ? '#9ca3af' : instaladoSim === false ? 'white' : '#9ca3af'}
                      />
                    </View>
                    <Text
                      style={{ 
                        color: !visitadoSim 
                          ? colors.cardTextSecondary 
                          : instaladoSim === false 
                          ? '#ea580c'
                          : colors.cardTextSecondary
                      }}
                      className="font-bold"
                    >
                      Não
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Card 3: Data */}
            <View
              style={{ 
                backgroundColor: colors.cardBackground, 
                borderColor: colors.cardBorder,
                opacity: instaladoSim === true ? 1 : 0.5
              }}
              className="rounded-2xl p-5 mb-4 shadow-sm border"
            >
              <View className="flex-row items-center mb-4">
                <View
                  style={{ 
                    backgroundColor: instaladoSim === true 
                      ? (theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe') 
                      : (theme === 'dark' ? '#374151' : '#f3f4f6')
                  }}
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                >
                  <Text
                    style={{ color: instaladoSim === true ? (theme === 'dark' ? '#60a5fa' : '#2563eb') : colors.cardTextSecondary }}
                    className="font-bold text-base"
                  >
                    3
                  </Text>
                </View>
                <View className="flex-1">
                  <Text style={{ color: instaladoSim === true ? colors.cardTextPrimary : colors.cardTextSecondary }} className="text-base font-bold">
                    Data da Instalação
                  </Text>
                  <Text style={{ color: colors.cardTextSecondary }} className="text-xs">
                    Quando foi realizada?
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={openDatePicker}
                disabled={instaladoSim !== true}
                style={{
                  backgroundColor: instaladoSim === true 
                    ? (theme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff')
                    : colors.searchInputBackground,
                  borderColor: instaladoSim === true 
                    ? (theme === 'dark' ? 'rgba(59, 130, 246, 0.4)' : '#bfdbfe')
                    : colors.cardBorder,
                  borderWidth: 2,
                }}
                className="rounded-xl p-2"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: instaladoSim === true ? '#3b82f6' : (theme === 'dark' ? '#374151' : '#e5e7eb'),
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
                        style={{ color: instaladoSim === true ? (theme === 'dark' ? '#60a5fa' : '#2563eb') : colors.cardTextSecondary }}
                        className="text-xs font-semibold"
                      >
                        Data selecionada
                      </Text>
                      <Text
                        style={{ color: instaladoSim === true ? colors.cardTextPrimary : colors.cardTextSecondary }}
                        className="text-sm font-bold"
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
                  {instaladoSim === true && <Ionicons name="chevron-forward" size={24} color="#3b82f6" />}
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
            <View 
              style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }} 
              className="rounded-2xl p-4 border mt-4"
            >
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
              <TouchableOpacity 
                onPress={onClose} 
                style={{ backgroundColor: colors.searchInputBackground }}
                className="py-4 rounded-xl"
              >
                <Text style={{ color: colors.cardTextPrimary }} className="font-semibold text-center text-base">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
