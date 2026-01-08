import { EditModal } from '@/components/instalacao/EditModal';
import { EditableInfoRow, InfoRow } from '@/components/instalacao/InfoRows';
import {
    ComodatoModal,
    DatePickerModal,
    FuncionarioSelectionModal,
    PlanoSelectionModal,
    QuickActionModal,
} from '@/components/instalacao/modals';
import { FinalizacaoModal } from '@/components/instalacao/modals/FinalizacaoModal';
import { Badge } from '@/components/ui/badge';
import { InfoSection } from '@/components/ui/info-section';
import { QuickActionButton } from '@/components/ui/quick-action-button';
import { useTheme } from '@/contexts/ThemeContext';
import { useFuncionarios } from '@/hooks/funcionario';
import { useEditaInstalacao, useFechaInstalacao, useInstalacaoDetail } from '@/hooks/instalacao';
import { usePlanos } from '@/hooks/plano';
import { formatarDataCompleta, formatarNome } from '@/utils/instalacao';
import { Ionicons } from '@expo/vector-icons';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function InstalacaoDetalhesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [planoModalVisible, setPlanoModalVisible] = useState(false);
  const [funcionarioModalVisible, setFuncionarioModalVisible] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const fechaInstalacaoMutation = useFechaInstalacao();
  const editaInstalacaoMutation = useEditaInstalacao();
  const { data: planos, isLoading: isLoadingPlanos } = usePlanos();
  const { data: funcionarios, isLoading: isLoadingFuncionarios } = useFuncionarios();

  // Estados para modais de edição
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<'visita' | 'tecnico' | 'obs' | 'plano' | 'email' | 'telefone' | 'celular' | 'endereco' | 'numero' | 'complemento' | 'bairro' | 'cidade' | 'estado' | 'cep' | 'valor' | 'vencimento' | 'login' | 'senha' | 'comodato' | 'equipamento' | 'ip' | 'mac' | 'coordenadas' | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Ref para ScrollView principal da tela
  const mainScrollRef = useRef<ScrollView>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [comodatoModalVisible, setComodatoModalVisible] = useState(false);
  const [finalizacaoModalVisible, setFinalizacaoModalVisible] = useState(false);

  // Estados para modal de ações rápidas
  const [quickActionModalVisible, setQuickActionModalVisible] = useState(false);
  const [quickActionOptions, setQuickActionOptions] = useState<Array<{ label: string; value: string; icon: string; action: () => void }>>([]);
  const [quickActionModalTitle, setQuickActionModalTitle] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  if (!id) {
    return (
      <View style={{ backgroundColor: colors.screenBackground }} className="flex-1 items-center justify-center">
        <Text style={{ color: colors.cardTextSecondary }}>ID da instalação não fornecido</Text>
      </View>
    );
  }

  const { data: instalacao, isLoading, error } = useInstalacaoDetail(id);

  if (isLoading) {
    return (
      <View style={{ backgroundColor: colors.screenBackground }} className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ color: colors.cardTextSecondary }} className="mt-4">Carregando instalação...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ backgroundColor: colors.screenBackground }} className="flex-1 items-center justify-center p-4">
        <Text className="text-red-600 text-lg font-semibold mb-2">Erro ao carregar instalação</Text>
        <Text style={{ color: colors.cardTextSecondary }} className="text-center">
          {error instanceof Error ? error.message : 'Erro desconhecido'}
        </Text>
      </View>
    );
  }

  if (!instalacao) {
    return (
      <View style={{ backgroundColor: colors.screenBackground }} className="flex-1 items-center justify-center">
        <Text style={{ color: colors.cardTextSecondary }}>Instalação não encontrada</Text>
      </View>
    );
  }

  // Funções para edição
  const abrirEdicao = (field: typeof editField, currentValue: string) => {
    if (instalacao.status !== 'aberto') {
      Toast.show({
        type: 'error',
        text1: 'Instalação já concluída',
        text2: 'Não é possível editar instalações concluídas',
        position: 'top',
        topOffset: 60,
      });
      return;
    }

    setEditField(field);

    if (field === 'visita') {
      // Parse data da visita
      let date: Date;
      try {
        date = currentValue ? new Date(currentValue.replace(' ', 'T')) : new Date();
      } catch {
        date = new Date();
      }
      setSelectedDate(date);

      // Android: usar API imperativa
      if (Platform.OS === 'android') {
        DateTimePickerAndroid.open({
          value: date,
          mode: 'date',
          minimumDate: new Date(),
          onChange: (event, selectedDate) => {
            if (event.type === 'set' && selectedDate) {
              // Primeiro escolhe data, depois hora
              DateTimePickerAndroid.open({
                value: selectedDate,
                mode: 'time',
                onChange: (timeEvent, selectedTime) => {
                  if (timeEvent.type === 'set' && selectedTime) {
                    setSelectedDate(selectedTime);
                    setEditField('visita');
                    // Salvar
                    const year = selectedTime.getFullYear();
                    const month = String(selectedTime.getMonth() + 1).padStart(2, '0');
                    const day = String(selectedTime.getDate()).padStart(2, '0');
                    const hours = String(selectedTime.getHours()).padStart(2, '0');
                    const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
                    const dados = { visita: `${year}-${month}-${day} ${hours}:${minutes}:00` };

                    editaInstalacaoMutation.mutate(
                      { uuid: instalacao.uuid_solic, dados },
                      {
                        onSuccess: () => {
                          Toast.show({
                            type: 'success',
                            text1: 'Instalação atualizada! ✅',
                            position: 'top',
                            topOffset: 60,
                          });
                        },
                        onError: (error) => {
                          Toast.show({
                            type: 'error',
                            text1: 'Erro ao atualizar',
                            text2: error instanceof Error ? error.message : 'Tente novamente',
                            position: 'top',
                            topOffset: 60,
                          });
                        },
                      }
                    );
                  }
                },
              });
            }
          },
        });
      } else {
        // iOS: usar modal
        setShowDatePicker(true);
      }
    } else if (field === 'plano') {
      // Abrir modal de seleção de planos
      setPlanoModalVisible(true);
    } else if (field === 'tecnico') {
      // Abrir modal de seleção de funcionários
      setFuncionarioModalVisible(true);
    } else if (field === 'comodato') {
      // Abrir modal de seleção Sim/Não
      setComodatoModalVisible(true);
    } else {
      setEditValue(currentValue || '');
      setEditModalVisible(true);
    }
  };

  const salvarEdicao = () => {
    if (!editField || !instalacao) return;

    const dados: any = {};

    if (editField === 'visita') {
      // Formato: YYYY-MM-DD HH:MM:SS
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const hours = String(selectedDate.getHours()).padStart(2, '0');
      const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
      dados.visita = `${year}-${month}-${day} ${hours}:${minutes}:00`;
    } else {
      dados[editField] = editValue;
    }

    editaInstalacaoMutation.mutate(
      { uuid: instalacao.uuid_solic, dados },
      {
        onSuccess: () => {
          setEditModalVisible(false);
          setEditField(null);
          Toast.show({
            type: 'success',
            text1: 'Instalação atualizada! ✅',
            position: 'top',
            topOffset: 60,
          });
        },
        onError: (error) => {
          Toast.show({
            type: 'error',
            text1: 'Erro ao atualizar',
            text2: error instanceof Error ? error.message : 'Tente novamente',
            position: 'top',
            topOffset: 60,
          });
        },
      }
    );
  };

  const getFieldLabel = () => {
    const labels = {
      visita: 'Data da Visita',
      tecnico: 'Técnico',
      obs: 'Observações',
      plano: 'Plano',
      email: 'E-mail',
      telefone: 'Telefone',
      celular: 'Celular',
      endereco: 'Endereço',
      numero: 'Número',
      complemento: 'Complemento',
      bairro: 'Bairro',
      cidade: 'Cidade',
      estado: 'Estado',
      cep: 'CEP',
      valor: 'Taxa de Ativação',
      vencimento: 'Vencimento',
      login: 'Login de Acesso',
      senha: 'Senha de Acesso',
      comodato: 'Comodato',
      equipamento: 'Equipamento',
      ip: 'IP',
      mac: 'MAC Address',
      coordenadas: 'Coordenadas GPS',
    };
    return labels[editField || 'visita'];
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: `Instalação #${instalacao.id}`,
        }}
      />
      <SafeAreaView style={{ backgroundColor: colors.screenBackground }} className="flex-1" edges={['bottom']}>
        <ScrollView ref={mainScrollRef} className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4">
            {/* HERO SECTION - Informações Críticas */}
            <View 
              style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }} 
              className="rounded-2xl p-5 mb-4 shadow-sm border"
            >
              {/* Status Badge */}
              <View className="flex-row justify-between items-start mb-4">
                <Badge 
                  label={instalacao.status === 'aberto' ? 'Aberto' : instalacao.status === 'concluido' ? 'Concluído' : instalacao.status}
                  color={instalacao.status === 'aberto' ? 'orange' : 'green'}
                  variant="solid"
                />
                <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-medium">#{instalacao.id}</Text>
              </View>

              {/* Cliente - Destaque Principal */}
              <TouchableOpacity
                onPress={() => router.push(`/detalhes/instalacao/cliente-info?id=${instalacao.uuid_solic}`)}
                className="mb-4 active:opacity-80"
              >
                <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-semibold uppercase tracking-wide mb-1">Cliente</Text>
                <View className="flex-row items-center justify-between">
                  <Text style={{ color: colors.cardTextPrimary }} className="text-base font-bold flex-1" numberOfLines={2}>
                    {formatarNome(instalacao.nome)}
                  </Text>
                  <View 
                    style={{ backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6' }} 
                    className="p-2 rounded-full ml-2"
                  >
                    <Ionicons name="chevron-forward" size={20} color={colors.cardTextSecondary} />
                  </View>
                </View>
              </TouchableOpacity>

              {/* DADOS DE FINALIZAÇÃO (somente se concluído) */}
              {instalacao.status === 'concluido' && (
                <View 
                  style={{ backgroundColor: colors.searchInputBackground, borderColor: '#16a34a' }} 
                  className="rounded-xl p-4 mb-4 border-l-4"
                >
                  <View className="flex-row items-center mb-3">
                    <View className="bg-green-600 w-8 h-8 rounded-full items-center justify-center mr-3">
                      <Ionicons name="checkmark-done-outline" size={16} color="white" />
                    </View>
                    <Text style={{ color: colors.cardTextPrimary }} className="font-bold text-sm flex-1">Finalização</Text>
                  </View>

                  <View className="gap-2">
                    {instalacao.visitado && (
                      <InfoRow label="Visitado" value={instalacao.visitado === 'sim' ? '✓ Sim' : '✗ Não'} />
                    )}

                    {instalacao.tecnico && (
                      <InfoRow label="Técnico Responsável" value={instalacao.tecnico} />
                    )}

                    {instalacao.instalado && (
                      <InfoRow label="Instalado" value={instalacao.instalado === 'sim' ? '✓ Sim' : '✗ Não'} />
                    )}

                    {/* Só mostra data de instalação se foi instalado */}
                    {instalacao.instalado === 'sim' && instalacao.datainst && (
                      <InfoRow label="Data de Instalação" value={formatarDataCompleta(instalacao.datainst)} />
                    )}

                    {instalacao.data_feito && (
                      <InfoRow label="Data de Fechamento" value={formatarDataCompleta(instalacao.data_feito)} />
                    )}

                    {/* Só mostra taxa de adesão se foi instalado */}
                    {instalacao.instalado === 'sim' && instalacao.valor && (
                      <InfoRow label="Taxa de Adesão" value={`R$ ${instalacao.valor}`} />
                    )}

                    {instalacao.nome_feito && (
                      <InfoRow label="Concluído por" value={instalacao.nome_feito} />
                    )}
                  </View>
                </View>
              )}

              {/* Informações Principais em Grid - apenas se aberto */}
              {instalacao.status === 'aberto' && (
                <View 
                  style={{ backgroundColor: colors.searchInputBackground, borderColor: colors.cardBorder }} 
                  className="rounded-xl p-3 border"
                >
                  <TouchableOpacity
                    onPress={() => abrirEdicao('tecnico', instalacao.tecnico || '')}
                    disabled={instalacao.status !== 'aberto'}
                    className="flex-row items-center justify-between mb-2 active:opacity-80 rounded-lg px-2 py-1"
                  >
                    <View className="flex-1 justify-center">
                      <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-medium">Técnico</Text>
                      <Text style={{ color: colors.cardTextPrimary }} className="text-sm font-semibold" numberOfLines={1}>
                        {instalacao.tecnico || 'Não atribuído'}
                      </Text>
                    </View>
                    {instalacao.status === 'aberto' && (
                      <View className="bg-blue-600 w-8 h-8 rounded-lg ml-2 items-center justify-center">
                        <Ionicons name="pencil" size={14} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>

                  <View style={{ backgroundColor: colors.infoRowBorder }} className="h-px my-2" />

                  <TouchableOpacity
                    onPress={() => abrirEdicao('visita', instalacao.visita || '')}
                    disabled={instalacao.status !== 'aberto'}
                    className="flex-row items-center justify-between mb-2 active:opacity-80 rounded-lg px-2 py-1"
                  >
                    <View className="flex-1 justify-center">
                      <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-medium">Visita Agendada</Text>
                      <Text style={{ color: colors.cardTextPrimary }} className="text-sm font-semibold" numberOfLines={1}>
                        {instalacao.visita ? formatarDataCompleta(instalacao.visita) : 'Não agendada'}
                      </Text>
                    </View>
                    {instalacao.status === 'aberto' && (
                      <View className="bg-blue-600 w-8 h-8 rounded-lg ml-2 items-center justify-center">
                        <Ionicons name="calendar-outline" size={14} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* AÇÕES RÁPIDAS - Cards Horizontais */}
            <View className="flex-row mb-4 gap-2">
              {/* Ligar */}
              {(instalacao.celular || instalacao.telefone) && (
                <QuickActionButton
                  icon="call"
                  label="Ligar"
                  color="green"
                  onPress={() => {
                    const telefones = [
                      instalacao.celular && { label: 'Celular', numero: instalacao.celular },
                      instalacao.telefone && { label: 'Telefone', numero: instalacao.telefone },
                      instalacao.celular2 && { label: 'Celular 2', numero: instalacao.celular2 },
                    ].filter(Boolean) as Array<{ label: string; numero: string }>;

                    if (telefones.length === 1) {
                      const numeroLimpo = telefones[0].numero.replace(/\D/g, '');
                      const url = `tel:${numeroLimpo}`;
                      Linking.openURL(url).catch(() => {
                        Toast.show({
                          type: 'error',
                          text1: 'Erro ao ligar',
                          position: 'top',
                          topOffset: 60,
                        });
                      });
                    } else {
                      setQuickActionModalTitle('Selecionar Telefone');
                      setQuickActionOptions(
                        telefones.map(t => ({
                          label: t.label,
                          value: t.numero,
                          icon: 'call',
                          action: () => {
                            const numeroLimpo = t.numero.replace(/\D/g, '');
                            const url = `tel:${numeroLimpo}`;
                            Linking.openURL(url).catch(() => {
                              Toast.show({
                                type: 'error',
                                text1: 'Erro ao ligar',
                                position: 'top',
                                topOffset: 60,
                              });
                            });
                            setQuickActionModalVisible(false);
                          },
                        }))
                      );
                      setQuickActionModalVisible(true);
                    }
                  }}
                />
              )}

              {/* WhatsApp */}
              {(instalacao.celular || instalacao.telefone || instalacao.celular2) && (
                <QuickActionButton
                  icon="logo-whatsapp"
                  label="WhatsApp"
                  color="emerald"
                  onPress={() => {
                    const celulares = [
                      instalacao.celular && { label: 'Celular', numero: instalacao.celular },
                      instalacao.telefone && { label: 'Telefone', numero: instalacao.telefone },
                      instalacao.celular2 && { label: 'Celular 2', numero: instalacao.celular2 },
                    ].filter(Boolean) as Array<{ label: string; numero: string }>;

                    if (celulares.length === 1) {
                      const numeroLimpo = celulares[0].numero.replace(/\D/g, '');
                      const numeroCompleto = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;
                      const url = `https://wa.me/${numeroCompleto}`;
                      Linking.openURL(url).catch(() => {
                        Toast.show({
                          type: 'error',
                          text1: 'Erro ao abrir WhatsApp',
                          position: 'top',
                          topOffset: 60,
                        });
                      });
                    } else {
                      setQuickActionModalTitle('Selecionar Número para WhatsApp');
                      setQuickActionOptions(
                        celulares.map(c => ({
                          label: c.label,
                          value: c.numero,
                          icon: 'logo-whatsapp',
                          action: () => {
                            const numeroLimpo = c.numero.replace(/\D/g, '');
                            const numeroCompleto = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;
                            const url = `https://wa.me/${numeroCompleto}`;
                            Linking.openURL(url).catch(() => {
                              Toast.show({
                                type: 'error',
                                text1: 'Erro ao abrir WhatsApp',
                                position: 'top',
                                topOffset: 60,
                              });
                            });
                            setQuickActionModalVisible(false);
                          },
                        }))
                      );
                      setQuickActionModalVisible(true);
                    }
                  }}
                />
              )}

              {/* Navegar */}
              {(instalacao.coordenadas || instalacao.endereco) && (
                <QuickActionButton
                  icon="navigate"
                  label="Navegar"
                  color="purple"
                  onPress={() => {
                    const temCoordenadas = instalacao.coordenadas && instalacao.coordenadas !== '-38.5748,-3.741162,0';
                    const temEndereco = instalacao.endereco;

                    const navegarPorCoordenadas = () => {
                      try {
                        const parts = instalacao.coordenadas!.split(',');
                        if (parts.length < 2) {
                          Toast.show({
                            type: 'error',
                            text1: 'Coordenadas inválidas',
                            position: 'top',
                            topOffset: 60,
                          });
                          return;
                        }

                        const firstValue = parseFloat(parts[0]?.trim() || '');
                        const secondValue = parseFloat(parts[1]?.trim() || '');

                        if (isNaN(firstValue) || isNaN(secondValue)) {
                          Toast.show({
                            type: 'error',
                            text1: 'Coordenadas inválidas',
                            position: 'top',
                            topOffset: 60,
                          });
                          return;
                        }

                        const lat = Math.abs(firstValue) < Math.abs(secondValue) ? firstValue : secondValue;
                        const lng = Math.abs(firstValue) < Math.abs(secondValue) ? secondValue : firstValue;

                        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                        Linking.openURL(url).catch(() => {
                          Toast.show({
                            type: 'error',
                            text1: 'Erro ao abrir mapa',
                            position: 'top',
                            topOffset: 60,
                          });
                        });
                      } catch (error) {
                        Toast.show({
                          type: 'error',
                          text1: 'Erro ao abrir mapa',
                          position: 'top',
                          topOffset: 60,
                        });
                      }
                    };

                    const navegarPorEndereco = () => {
                      const enderecoCompleto = [
                        instalacao.endereco,
                        instalacao.numero,
                        instalacao.bairro,
                        instalacao.cidade,
                        instalacao.estado,
                      ]
                        .filter(Boolean)
                        .join(', ');

                      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`;
                      Linking.openURL(url).catch(() => {
                        Toast.show({
                          type: 'error',
                          text1: 'Erro ao abrir mapa',
                          position: 'top',
                          topOffset: 60,
                        });
                      });
                    };

                    if (temCoordenadas && temEndereco) {
                      setQuickActionModalTitle('Navegar para');
                      setQuickActionOptions([
                        {
                          label: 'Por Coordenadas GPS',
                          value: instalacao.coordenadas || '',
                          icon: 'navigate',
                          action: () => {
                            navegarPorCoordenadas();
                            setQuickActionModalVisible(false);
                          },
                        },
                        {
                          label: 'Por Endereço',
                          value: [instalacao.endereco, instalacao.numero, instalacao.bairro].filter(Boolean).join(', '),
                          icon: 'location',
                          action: () => {
                            navegarPorEndereco();
                            setQuickActionModalVisible(false);
                          },
                        },
                      ]);
                      setQuickActionModalVisible(true);
                    } else if (temCoordenadas) {
                      navegarPorCoordenadas();
                    } else if (temEndereco) {
                      navegarPorEndereco();
                    }
                  }}
                />
              )}
            </View>

            {/* SEÇÃO TÉCNICA PRIORITÁRIA */}
            <InfoSection title="Configuração Técnica" icon="settings-outline" color="blue" noContentWrapper>
              {/* Plano - Destaque */}
              <TouchableOpacity
                onPress={() => instalacao.status === 'aberto' && setPlanoModalVisible(true)}
                disabled={instalacao.status !== 'aberto'}
                style={{ 
                  backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
                  borderColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.4)' : '#bfdbfe'
                }}
                className="rounded-xl p-4 mb-4 border-2"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text 
                      style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }} 
                      className="text-xs font-bold uppercase tracking-wide mb-1"
                    >
                      Plano Contratado
                    </Text>
                    <Text style={{ color: colors.cardTextPrimary }} className="text-base font-bold" numberOfLines={1}>
                      {instalacao.plano || 'Não informado'}
                    </Text>
                  </View>
                  {instalacao.status === 'aberto' && (
                    <View className="bg-blue-600 w-8 h-8 rounded-lg ml-2 items-center justify-center">
                      <Ionicons name="pencil" size={14} color="white" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Grid de Informações Técnicas */}
              <View className="gap-3">
                <View 
                  style={{ backgroundColor: colors.searchInputBackground, borderColor: colors.cardBorder }} 
                  className="rounded-xl p-3 border"
                >
                  <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-semibold uppercase tracking-wide mb-2">Credenciais de Acesso</Text>

                  <EditableInfoRow
                    label="Login"
                    value={instalacao.login || 'Não configurado'}
                    onEdit={() => abrirEdicao('login', instalacao.login || '')}
                    editable={instalacao.status === 'aberto'}
                  />

                  {instalacao.senha && (
                    <View className="pt-2">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <EditableInfoRow
                            label="Senha"
                            value={senhaVisivel ? instalacao.senha : '••••••••'}
                            onEdit={() => abrirEdicao('senha', instalacao.senha || '')}
                            editable={instalacao.status === 'aberto'}
                          />
                        </View>
                        <TouchableOpacity
                          onPress={() => setSenhaVisivel(!senhaVisivel)}
                          style={{ backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6' }}
                          className="ml-3 p-2 rounded-lg"
                        >
                          <Ionicons 
                            name={senhaVisivel ? "eye-off" : "eye"} 
                            size={16} 
                            color={colors.cardTextSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>

                <View 
                  style={{ backgroundColor: colors.searchInputBackground, borderColor: colors.cardBorder }} 
                  className="rounded-xl p-3 border"
                >
                  <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-semibold uppercase tracking-wide mb-2">Rede e Conectividade</Text>

                  <EditableInfoRow
                    label="IP"
                    value={instalacao.ip || 'Não configurado'}
                    onEdit={() => abrirEdicao('ip', instalacao.ip || '')}
                    editable={instalacao.status === 'aberto'}
                  />

                  <View className="pt-2">
                    <EditableInfoRow
                      label="MAC Address"
                      value={instalacao.mac || 'Não configurado'}
                      onEdit={() => abrirEdicao('mac', instalacao.mac || '')}
                      editable={instalacao.status === 'aberto'}
                    />
                  </View>

                  {instalacao.ramal && (
                    <View className="pt-2">
                      <InfoRow label="Ramal" value={instalacao.ramal} />
                    </View>
                  )}

                  {instalacao.pool6 && (
                    <View className="pt-2">
                      <InfoRow label="IPv6 Pool" value={instalacao.pool6} />
                    </View>
                  )}
                </View>

                <View 
                  style={{ backgroundColor: colors.searchInputBackground, borderColor: colors.cardBorder }} 
                  className="rounded-xl p-3 border"
                >
                  <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-semibold uppercase tracking-wide mb-2">Equipamento</Text>

                  <EditableInfoRow
                    label="Comodato"
                    value={instalacao.comodato === 'sim' ? '✓ Sim' : '✗ Não'}
                    onEdit={() => abrirEdicao('comodato', instalacao.comodato || '')}
                    editable={instalacao.status === 'aberto'}
                  />

                  <View className="pt-2">
                    <EditableInfoRow
                      label="Modelo"
                      value={instalacao.equipamento || 'Não especificado'}
                      onEdit={() => abrirEdicao('equipamento', instalacao.equipamento || '')}
                      editable={instalacao.status === 'aberto'}
                    />
                  </View>
                </View>
              </View>
            </InfoSection>

            {/* INFORMAÇÕES ADMINISTRATIVAS */}
            <InfoSection title="Informações Administrativas" icon="document-text-outline" color="blue">
              {instalacao.termo && (
                <InfoRow label="Termo" value={`#${instalacao.termo}`} />
              )}

              <InfoRow
                label="Processado em"
                value={formatarDataCompleta(instalacao.processamento)}
              />

              {instalacao.login_atend && (
                <InfoRow label="Atendente" value={instalacao.login_atend} />
              )}

              {instalacao.disp && (
                <InfoRow label="Disponibilidade" value={instalacao.disp === 'sim' ? 'Sim' : 'Não'} />
              )}

              {instalacao.visitado && (
                <InfoRow label="Visitado" value={instalacao.visitado === 'sim' ? 'Sim' : 'Não'} />
              )}

              {instalacao.datainst && (
                <InfoRow label="Data de Instalação" value={formatarDataCompleta(instalacao.datainst)} />
              )}
            </InfoSection>

            {/* VALORES E TAXAS */}
            <InfoSection title="Valores e Taxas" icon="cash-outline" color="green" noContentWrapper>
              {instalacao.adesao && (
                <View className="bg-green-50 rounded-xl p-3 mb-3 border border-green-200">
                  <Text className="text-xs text-green-600 font-semibold mb-1">Taxa de Adesão</Text>
                  <Text className="text-base font-bold text-green-700">R$ {instalacao.adesao}</Text>
                </View>
              )}

              <EditableInfoRow
                label="Taxa de Ativação"
                value={instalacao.valor ? `R$ ${instalacao.valor}` : 'Não informado'}
                onEdit={() => abrirEdicao('valor', instalacao.valor || '')}
                editable={instalacao.status === 'aberto'}
              />
            </InfoSection>

            {/* OBSERVAÇÕES */}
            {(instalacao.status === 'aberto' || instalacao.obs) && (
              <TouchableOpacity
                onPress={() => abrirEdicao('obs', instalacao.obs || '')}
                disabled={instalacao.status !== 'aberto'}
                style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }}
                className="rounded-2xl p-5 mb-4 shadow-md border"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-start flex-1">
                    <View 
                      style={{ backgroundColor: instalacao.obs ? '#fef3c7' : colors.searchInputBackground }} 
                      className="w-10 h-10 rounded-full items-center justify-center mr-3 mt-0.5"
                    >
                      <Ionicons
                        name={instalacao.obs ? "chatbox-ellipses-outline" : "add-circle-outline"}
                        size={20}
                        color={instalacao.obs ? "#f59e0b" : colors.cardTextSecondary}
                      />
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-semibold uppercase tracking-wide mb-2">
                        Observações
                      </Text>
                      <Text 
                        style={{ color: instalacao.obs ? colors.cardTextPrimary : colors.cardTextSecondary }} 
                        className={`text-sm leading-5 ${!instalacao.obs && 'italic'}`}
                      >
                        {instalacao.obs || 'Toque para adicionar observações sobre esta instalação'}
                      </Text>
                    </View>
                  </View>
                  {instalacao.status === 'aberto' && (
                    <View className="ml-2 mt-1">
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color={colors.cardTextSecondary}
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}

            {/* BOTÃO DE CONCLUSÃO */}
            {instalacao.status === 'aberto' && (
              <TouchableOpacity
                onPress={() => setFinalizacaoModalVisible(true)}
                disabled={fechaInstalacaoMutation.isPending}
                className="bg-green-600 py-4 rounded-2xl shadow-lg mb-6"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text className="text-white font-bold text-base ml-2">Concluir Instalação</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Modal de Edição de Texto */}
        <EditModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          title={`Editar ${getFieldLabel()}`}
          value={editValue}
          onChange={setEditValue}
          onSave={salvarEdicao}
          placeholder={`Digite ${getFieldLabel().toLowerCase()}`}
          multiline={editField === 'obs'}
          keyboardType={editField === 'email' ? 'email-address' : editField === 'telefone' || editField === 'celular' ? 'phone-pad' : 'default'}
          secureTextEntry={editField === 'senha'}
          isPending={editaInstalacaoMutation.isPending}
          saveButtonColor="bg-blue-600"
        />

        {/* DateTimePicker para iOS */}
        <DatePickerModal
          visible={showDatePicker && Platform.OS === 'ios'}
          value={selectedDate}
          onChange={setSelectedDate}
          onSave={() => {
            setShowDatePicker(false);
            setEditField('visita');
            salvarEdicao();
          }}
          onClose={() => setShowDatePicker(false)}
          isPending={editaInstalacaoMutation.isPending}
        />

        {/* Modal de Seleção de Plano */}
        <PlanoSelectionModal
          visible={planoModalVisible}
          planos={planos}
          isLoading={isLoadingPlanos}
          currentPlano={instalacao?.plano || null}
          updatingItemId={updatingItemId}
          onSelect={(plano) => {
            if (!instalacao) return;
            setUpdatingItemId(plano.uuid_plano);
            const dados = { plano: plano.nome };
            editaInstalacaoMutation.mutate(
              { uuid: instalacao.uuid_solic, dados },
              {
                onSuccess: () => {
                  setUpdatingItemId(null);
                  setPlanoModalVisible(false);
                  Toast.show({
                    type: 'success',
                    text1: 'Plano atualizado! ✅',
                    position: 'top',
                    topOffset: 60,
                  });
                },
                onError: (error) => {
                  setUpdatingItemId(null);
                  Toast.show({
                    type: 'error',
                    text1: 'Erro ao atualizar',
                    text2: error instanceof Error ? error.message : 'Tente novamente',
                    position: 'top',
                    topOffset: 60,
                  });
                },
              }
            );
          }}
          onClose={() => setPlanoModalVisible(false)}
        />

        {/* Modal de Seleção de Funcionário (Técnico) */}
        <FuncionarioSelectionModal
          visible={funcionarioModalVisible}
          funcionarios={funcionarios}
          isLoading={isLoadingFuncionarios}
          currentTecnico={instalacao?.tecnico || null}
          updatingItemId={updatingItemId}
          onSelect={(funcionario) => {
            if (!instalacao) return;
            setUpdatingItemId(funcionario.uuid_func);
            const dados = { tecnico: funcionario.nome };
            editaInstalacaoMutation.mutate(
              { uuid: instalacao.uuid_solic, dados },
              {
                onSuccess: () => {
                  setUpdatingItemId(null);
                  setFuncionarioModalVisible(false);
                  Toast.show({
                    type: 'success',
                    text1: 'Técnico atualizado! ✅',
                    position: 'top',
                    topOffset: 60,
                  });
                },
                onError: (error) => {
                  setUpdatingItemId(null);
                  Toast.show({
                    type: 'error',
                    text1: 'Erro ao atualizar',
                    text2: error instanceof Error ? error.message : 'Tente novamente',
                    position: 'top',
                    topOffset: 60,
                  });
                },
              }
            );
          }}
          onClose={() => setFuncionarioModalVisible(false)}
        />

        {/* Modal de Seleção de Comodato */}
        <ComodatoModal
          visible={comodatoModalVisible}
          currentValue={instalacao?.comodato || null}
          onSelect={(value) => {
            if (!instalacao) return;
            const dados = { comodato: value };
            editaInstalacaoMutation.mutate(
              { uuid: instalacao.uuid_solic, dados },
              {
                onSuccess: () => {
                  setComodatoModalVisible(false);
                  Toast.show({
                    type: 'success',
                    text1: 'Comodato atualizado! ✅',
                    position: 'top',
                    topOffset: 60,
                  });
                },
                onError: (error) => {
                  Toast.show({
                    type: 'error',
                    text1: 'Erro ao atualizar',
                    text2: error instanceof Error ? error.message : 'Tente novamente',
                    position: 'top',
                    topOffset: 60,
                  });
                },
              }
            );
          }}
          onClose={() => setComodatoModalVisible(false)}
          isPending={editaInstalacaoMutation.isPending}
        />

        {/* Modal de Finalização */}
        <FinalizacaoModal
          visible={finalizacaoModalVisible}
          onClose={() => setFinalizacaoModalVisible(false)}
          instalacao={instalacao}
          onSuccess={() => {
            setTimeout(() => {
              mainScrollRef.current?.scrollTo({ y: 0, animated: true });
            }, 100);
          }}
          fechaInstalacaoMutation={fechaInstalacaoMutation}
          editaInstalacaoMutation={editaInstalacaoMutation}
        />

        {/* Modal de Ações Rápidas */}
        <QuickActionModal
          visible={quickActionModalVisible}
          title={quickActionModalTitle}
          options={quickActionOptions}
          onClose={() => setQuickActionModalVisible(false)}
        />
      </SafeAreaView>
    </>
  );
}