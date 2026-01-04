import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import type { UseMutationResult } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Keyboard,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

interface FechaChamadoModalProps {
  visible: boolean;
  onClose: () => void;
  numeroChamado: string;
  onSuccess: () => void;
  fechaChamadoMutation: UseMutationResult<
    any,
    Error,
    { numeroChamado: string; motivo: string },
    unknown
  >;
}

const MOTIVOS_PADRAO = [
  'Ativação concluída',
  'Manutenção concluída',
  'Equipamento retirado',
  'Instalação concluída',
  'Pagamento realizado',
  'Troca realizada',
  'Mudança realizada',
  'Transferência realizada',
  'Normalizado',
  'Concluído',
  'Outro (digitar)',
];

export function FechaChamadoModal({
  visible,
  onClose,
  numeroChamado,
  onSuccess,
  fechaChamadoMutation,
}: FechaChamadoModalProps) {
  const { colors } = useTheme();
  const motivoInputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [motivoSelecionado, setMotivoSelecionado] = useState<string>('');
  const [motivoCustomizado, setMotivoCustomizado] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isOutro = motivoSelecionado === 'Outro (digitar)';
  const motivo = isOutro ? motivoCustomizado : motivoSelecionado;

  // Animar aparecimento do campo customizado
  useEffect(() => {
    if (isOutro) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [isOutro, fadeAnim]);

  // Reset estados quando o modal fechar
  useEffect(() => {
    if (!visible) {
      setMotivoSelecionado('');
      setMotivoCustomizado('');
      Keyboard.dismiss();
    }
  }, [visible]);

  const handleSelecionarMotivo = (motivo: string) => {
    setMotivoSelecionado(motivo);
    // Scroll suave para o final após seleção
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleFechar = () => {
    if (!motivo.trim()) {
      Alert.alert('Atenção', 'Por favor, informe um motivo para o fechamento.');
      return;
    }

    fechaChamadoMutation.mutate(
      {
        numeroChamado,
        motivo: motivo.trim(),
      },
      {
        onSuccess: () => {
          onClose();
          onSuccess();
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
        onError: (error) => {
          Toast.show({
            type: 'error',
            text1: 'Erro ao fechar chamado',
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
                Fechar Chamado
              </Text>
              <Text 
                className="text-sm"
                style={{ color: colors.cardTextSecondary }}
              >
                Informe o motivo para finalizar
              </Text>
            </View>
            <TouchableOpacity 
              onPress={onClose} 
              className="p-2 rounded-full"
              style={{ backgroundColor: colors.filterPillInactive }}
            >
              <Ionicons name="close" size={24} color={colors.cardTextSecondary} />
            </TouchableOpacity>
          </View>

          {/* Ícone Central */}
          <View className="items-center">
            <View 
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.filterPillInactive }}
            >
              <View 
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.cardBackground }}
              >
                <Ionicons name="checkmark-done-circle" size={32} color={colors.tabBarActiveTint} />
              </View>
            </View>
          </View>
        </View>

        <ScrollView 
          ref={scrollRef}
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 py-6 pb-8">
            {/* Dicas */}
            <View className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
              <View className="flex-row items-start gap-2 mb-3">
                <Ionicons name="bulb" size={20} color="#2563eb" />
                <Text className="flex-1 text-sm font-bold text-blue-900">
                  Dicas para um bom motivo:
                </Text>
              </View>
              <View className="gap-2">
                <View className="flex-row items-start gap-2">
                  <Text className="text-blue-600 font-bold">•</Text>
                  <Text className="flex-1 text-sm text-blue-900">
                    Descreva o problema encontrado
                  </Text>
                </View>
                <View className="flex-row items-start gap-2">
                  <Text className="text-blue-600 font-bold">•</Text>
                  <Text className="flex-1 text-sm text-blue-900">
                    Informe a solução aplicada
                  </Text>
                </View>
                <View className="flex-row items-start gap-2">
                  <Text className="text-blue-600 font-bold">•</Text>
                  <Text className="flex-1 text-sm text-blue-900">
                    Registre orientações dadas ao cliente
                  </Text>
                </View>
              </View>
            </View>

            {/* Card de Motivo */}
            <View 
              className="rounded-2xl p-5 mb-4"
              style={{ backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.cardBorder }}
            >
              <View className="flex-row items-center mb-4">
                <View className="bg-sky-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="chatbox-ellipses" size={20} color="#0284c7" />
                </View>
                <View className="flex-1">
                  <Text 
                    className="text-base font-bold"
                    style={{ color: colors.cardTextPrimary }}
                  >
                    Motivo do Fechamento
                  </Text>
                  <Text 
                    className="text-xs"
                    style={{ color: colors.cardTextSecondary }}
                  >
                    Chamado #{numeroChamado}
                  </Text>
                </View>
              </View>

              {/* Lista de Motivos Padrão - Grid 2 Colunas */}
              <View className="mb-4">
                <Text 
                  className="text-sm font-semibold mb-3"
                  style={{ color: colors.cardTextPrimary }}
                >
                  Selecione um motivo:
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {MOTIVOS_PADRAO.map((motivoItem) => (
                    <TouchableOpacity
                      key={motivoItem}
                      onPress={() => handleSelecionarMotivo(motivoItem)}
                      disabled={fechaChamadoMutation.isPending}
                      style={{ 
                        width: '48.5%',
                        backgroundColor: motivoSelecionado === motivoItem 
                          ? colors.tabBarActiveTint 
                          : colors.searchInputBackground 
                      }}
                      className="p-3 rounded-lg items-center justify-center min-h-[50px]"
                    >
                      <Text
                        numberOfLines={2}
                        className="text-xs font-semibold text-center"
                        style={{ 
                          color: motivoSelecionado === motivoItem 
                            ? '#ffffff' 
                            : colors.cardTextPrimary 
                        }}
                      >
                        {motivoItem}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Campo de texto customizado - só aparece se "Outro" for selecionado */}
              {isOutro && (
                <Animated.View
                  style={{
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, 0],
                        }),
                      },
                    ],
                    backgroundColor: colors.searchInputBackground,
                    borderWidth: 2,
                    borderColor: colors.cardBorder,
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}
                >
                  <TextInput
                    ref={motivoInputRef}
                    className="p-4 min-h-[140px]"
                    style={{ color: colors.cardTextPrimary }}
                    placeholder="Digite o motivo do fechamento..."
                    placeholderTextColor={colors.cardTextSecondary}
                    multiline
                    textAlignVertical="top"
                    value={motivoCustomizado}
                    onChangeText={setMotivoCustomizado}
                    editable={!fechaChamadoMutation.isPending}
                  />
                </Animated.View>
              )}

              {/* Contador de caracteres */}
              <View className="flex-row justify-between items-center mt-2 px-1">
                <Text className="text-xs" style={{ color: colors.cardTextSecondary }}>
                  {motivo.length > 0 ? `${motivo.length} caracteres` : 'Selecione um motivo acima'}
                </Text>
                {motivo.length > 0 && (
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="checkmark-circle" size={14} color={colors.tabBarActiveTint} />
                    <Text className="text-xs font-semibold" style={{ color: colors.tabBarActiveTint }}>Pronto!</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Botões dentro do ScrollView - não sobem com teclado */}
            <View 
              className="rounded-2xl p-4"
              style={{ backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.cardBorder }}
            >
              {/* Botão Principal - Fechar Chamado */}
              <TouchableOpacity
                onPress={handleFechar}
                disabled={fechaChamadoMutation.isPending}
                className="bg-green-600 py-4 rounded-2xl mb-3"
              >
                {fechaChamadoMutation.isPending ? (
                  <View className="flex-row items-center justify-center gap-2">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-bold text-base">Fechando...</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center justify-center gap-2">
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text className="text-white font-bold text-base">Confirmar e Fechar</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Botão Secundário - Cancelar */}
              <TouchableOpacity 
                onPress={onClose} 
                className="py-4 rounded-xl"
                style={{ backgroundColor: colors.filterPillInactive }}
              >
                <Text 
                  className="font-semibold text-center text-base"
                  style={{ color: colors.cardTextSecondary }}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
