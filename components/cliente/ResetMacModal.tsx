import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import type { UseMutationResult } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Modal,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ResetMacModalProps {
  visible: boolean;
  onClose: () => void;
  clienteNome: string;
  macAtual: string | null;
  updateClientMutation: UseMutationResult<any, Error, any, unknown>;
  clienteUuid: string;
  onSuccess: () => void;
}

export function ResetMacModal({
  visible,
  onClose,
  clienteNome,
  macAtual,
  updateClientMutation,
  clienteUuid,
  onSuccess,
}: ResetMacModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [comoFuncionaExpanded, setComoFuncionaExpanded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animação de entrada
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      fadeAnim.setValue(0);
    }
  }, [visible, scaleAnim, fadeAnim]);

  useEffect(() => {
    if (!visible) {
      setComoFuncionaExpanded(false);
    }
  }, [visible]);

  const handleResetar = () => {
    updateClientMutation.mutate(
      { uuid: clienteUuid, mac: null },
      {
        onSuccess: () => {
          onClose();
          onSuccess();
          setTimeout(() => {
            Toast.show({
              type: 'success',
              text1: '🔄 MAC resetado com sucesso!',
              text2: 'Puxe para baixo para ver o novo MAC detectado',
              position: 'top',
              visibilityTime: 5000,
              topOffset: 60,
            });
          }, 300);
        },
        onError: (error) => {
          Toast.show({
            type: 'error',
            text1: 'Erro ao resetar MAC',
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
      <View className="flex-1" style={{ backgroundColor: colors.screenBackground }}>
        {/* Header */}
        <View 
          className="px-6 pt-14 pb-8"
          style={{ backgroundColor: colors.headerBackground, borderBottomWidth: 1, borderBottomColor: colors.headerBorder }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text 
                className="text-xl font-bold mb-1"
                style={{ color: colors.headerText }}
              >
                Reset de MAC Address
              </Text>
              <Text 
                className="text-sm"
                style={{ color: colors.cardTextSecondary }}
              >
                Detectar novo dispositivo
              </Text>
            </View>
            <TouchableOpacity 
              onPress={onClose} 
              className="p-2 rounded-full"
              style={{ backgroundColor: colors.filterPillInactive }}
              disabled={updateClientMutation.isPending}
            >
              <Ionicons name="close" size={24} color={colors.cardTextSecondary} />
            </TouchableOpacity>
          </View>

          {/* Ícone Central */}
          <Animated.View 
            style={{ 
              transform: [{ scale: scaleAnim }], 
              opacity: fadeAnim,
              alignItems: 'center',
            }}
          >
            <View 
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.filterPillInactive }}
            >
              <View 
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.cardBackground }}
              >
                <Ionicons name="wifi" size={32} color={colors.tabBarActiveTint} />
              </View>
            </View>
          </Animated.View>
        </View>

        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator
          persistentScrollbar={Platform.OS === 'android'}
          contentContainerStyle={{
            paddingBottom: Math.max(120 + insets.bottom + 24, 160),
          }}
        >
          <View className="px-6 py-6">
            {/* Informações do Cliente */}
            <View 
              className="rounded-2xl p-5 mb-4"
              style={{ backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.cardBorder }}
            >
              <View className="flex-row items-center mb-3">
                <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="person" size={20} color="#2563eb" />
                </View>
                <Text 
                  className="text-base font-bold"
                  style={{ color: colors.cardTextPrimary }}
                >
                  Cliente
                </Text>
              </View>
              <Text 
                className="text-base mb-3"
                style={{ color: colors.cardTextPrimary }}
              >
                {clienteNome}
              </Text>
              
              {macAtual && (
                <View 
                  className="rounded-xl p-3"
                  style={{ backgroundColor: colors.searchInputBackground }}
                >
                  <Text 
                    className="text-xs font-semibold mb-1"
                    style={{ color: colors.cardTextSecondary }}
                  >
                    MAC Atual
                  </Text>
                  <Text 
                    className="font-mono text-sm"
                    style={{ color: colors.cardTextPrimary }}
                  >
                    {macAtual}
                  </Text>
                </View>
              )}
            </View>

            {/* Como funciona — expansível: menos altura inicial + convite explícito a ver o passo a passo */}
            <View
              className="rounded-2xl mb-4 overflow-hidden"
              style={{ backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.cardBorder }}
            >
              <TouchableOpacity
                onPress={() => setComoFuncionaExpanded((v) => !v)}
                activeOpacity={0.75}
                className="flex-row items-center p-5"
                accessibilityRole="button"
                accessibilityState={{ expanded: comoFuncionaExpanded }}
                accessibilityLabel={
                  comoFuncionaExpanded
                    ? 'Recolher explicação de como funciona o reset de MAC'
                    : 'Expandir explicação de como funciona o reset de MAC'
                }
              >
                <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="information-circle" size={20} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold" style={{ color: colors.cardTextPrimary }}>
                    Como funciona?
                  </Text>
                  <Text className="text-xs mt-1" style={{ color: colors.cardTextSecondary }}>
                    {comoFuncionaExpanded
                      ? 'Toque para recolher'
                      : 'Toque para ver os 3 passos do reset e a detecção automática'}
                  </Text>
                </View>
                <Ionicons
                  name={comoFuncionaExpanded ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color={colors.cardTextSecondary}
                />
              </TouchableOpacity>

              {comoFuncionaExpanded ? (
                <View className="px-5 pt-5 pb-5 gap-4 border-t" style={{ borderTopColor: colors.cardBorder }}>
                  <View className="flex-row items-start gap-3">
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center mt-0.5"
                      style={{ backgroundColor: colors.tabBarActiveTint }}
                    >
                      <Text className="text-white text-xs font-bold">1</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold mb-1" style={{ color: colors.cardTextPrimary }}>
                        App limpa o MAC
                      </Text>
                      <Text className="text-sm" style={{ color: colors.cardTextSecondary }}>
                        O aplicativo vai resetar o campo MAC no banco de dados do MK-Auth
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start gap-3">
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center mt-0.5"
                      style={{ backgroundColor: colors.tabBarActiveTint }}
                    >
                      <Text className="text-white text-xs font-bold">2</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold mb-1" style={{ color: colors.cardTextPrimary }}>
                        Automação detecta
                      </Text>
                      <Text className="text-sm" style={{ color: colors.cardTextSecondary }}>
                        Em alguns segundos, a automação do MK-Auth vai detectar automaticamente o novo MAC na rede
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start gap-3">
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center mt-0.5"
                      style={{ backgroundColor: colors.tabBarActiveTint }}
                    >
                      <Text className="text-white text-xs font-bold">3</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold mb-1" style={{ color: colors.cardTextPrimary }}>
                        Você atualiza a tela
                      </Text>
                      <Text className="text-sm" style={{ color: colors.cardTextSecondary }}>
                        Puxe para baixo para atualizar e ver o novo MAC detectado
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}
            </View>

            {/* Dica Importante */}
            <View className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <View className="flex-row items-start gap-2">
                <Ionicons name="warning" size={20} color="#f59e0b" />
                <View className="flex-1">
                  <Text className="text-sm font-bold text-amber-900 mb-1">
                    ⏱️ Aguarde alguns segundos
                  </Text>
                  <Text className="text-sm text-amber-900">
                    A detecção automática pode levar de 5 a 30 segundos. Depois desse tempo, 
                    puxe a tela para baixo para ver o novo MAC.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Botões de Ação */}
        <View 
          className="absolute bottom-0 left-0 right-0 px-6 pt-4"
          style={{
            backgroundColor: colors.cardBackground,
            borderTopWidth: 1,
            borderTopColor: colors.cardBorder,
            paddingBottom: Math.max(insets.bottom + 16, 28),
          }}
        >
          <TouchableOpacity
            onPress={handleResetar}
            disabled={updateClientMutation.isPending}
            className={`${
              updateClientMutation.isPending ? 'bg-blue-400' : 'bg-blue-600'
            } rounded-xl py-4 mb-3 items-center justify-center flex-row`}
            style={{ minHeight: 56 }}
          >
            {updateClientMutation.isPending ? (
              <>
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-bold text-base ml-2">Resetando...</Text>
              </>
            ) : (
              <>
                <Ionicons name="refresh" size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">Resetar MAC Address</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            disabled={updateClientMutation.isPending}
            className="py-3 items-center"
          >
            <Text 
              className="font-semibold"
              style={{ color: colors.cardTextSecondary }}
            >
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
