import { useFuncionarios } from '@/hooks/funcionario';
import { useEditaInstalacao, useFechaInstalacao, useInstalacaoDetail } from '@/hooks/instalacao';
import { usePlanos } from '@/hooks/plano';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function InstalacaoDetalhesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [planoModalVisible, setPlanoModalVisible] = useState(false);
  const [funcionarioModalVisible, setFuncionarioModalVisible] = useState(false);
  const fechaInstalacaoMutation = useFechaInstalacao();
  const editaInstalacaoMutation = useEditaInstalacao();
  const { data: planos, isLoading: isLoadingPlanos } = usePlanos();
  const { data: funcionarios, isLoading: isLoadingFuncionarios } = useFuncionarios();

  // Estados para modais de edição
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<'visita' | 'tecnico' | 'obs' | 'plano' | 'email' | 'telefone' | 'celular' | 'endereco' | 'numero' | 'complemento' | 'bairro' | 'cidade' | 'estado' | 'cep' | 'valor' | 'vencimento' | 'login' | 'comodato' | 'equipamento' | 'ip' | 'mac' | 'coordenadas' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [comodatoModalVisible, setComodatoModalVisible] = useState(false);
  const [finalizacaoModalVisible, setFinalizacaoModalVisible] = useState(false);

  // Estados para finalização
  const [instaladoSim, setInstaladoSim] = useState(true);
  const [dataInstalacao, setDataInstalacao] = useState(new Date());
  const [valorInstalacao, setValorInstalacao] = useState('');

  // Estados para modal de seleção de contato
  const [contatoModalVisible, setContatoModalVisible] = useState(false);
  const [contatoOptions, setContatoOptions] = useState<Array<{ label: string; value: string; icon: string; action: () => void }>>([]);
  const [contatoModalTitle, setContatoModalTitle] = useState('');
  const [visitadoSim, setVisitadoSim] = useState(false);

  if (!id) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">ID da instalação não fornecido</Text>
      </View>
    );
  }

  const { data: instalacao, isLoading, error } = useInstalacaoDetail(id);

  // Pré-preencher valor da instalação quando abrir o modal de finalização
  useEffect(() => {
    if (finalizacaoModalVisible && instalacao?.valor) {
      setValorInstalacao(instalacao.valor);
    }
  }, [finalizacaoModalVisible, instalacao?.valor]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#0284c7" />
        <Text className="mt-4 text-gray-600">Carregando instalação...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-4">
        <Text className="text-red-600 text-lg font-semibold mb-2">Erro ao carregar instalação</Text>
        <Text className="text-gray-600 text-center">
          {error instanceof Error ? error.message : 'Erro desconhecido'}
        </Text>
      </View>
    );
  }

  if (!instalacao) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Instalação não encontrada</Text>
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
      comodato: 'Comodato',
      equipamento: 'Equipamento',
      ip: 'IP',
      mac: 'MAC Address',
      coordenadas: 'Coordenadas GPS',
    };
    return labels[editField || 'visita'];
  };

  // Formatar data para dd/MM/yyyy HH:mm
  const formatarDataCompleta = (dataStr: string | null) => {
    if (!dataStr) return 'Não informado';
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

  const formatarData = (dataStr: string | null) => {
    if (!dataStr) return 'Não informado';
    try {
      const data = new Date(dataStr.replace(' ', 'T'));
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dataStr;
    }
  };

  const formatarNome = (nome: string) => {
    if (!nome) return '';

    // Remove espaços extras e coloca em Title Case
    return nome
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  };

  return (
    <>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          title: `Instalação #${instalacao.id}`,
          headerBackTitle: 'Voltar',
          headerStyle: {
            backgroundColor: '#9333ea',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4">
            {/* HERO SECTION - Informações Críticas */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
              {/* Status Badge */}
              <View className="flex-row justify-between items-start mb-4">
                <View className={`${instalacao.status === 'aberto' ? 'bg-amber-400' : 'bg-green-400'} px-3 py-1.5 rounded-full`}>
                  <Text className={`${instalacao.status === 'aberto' ? 'text-amber-900' : 'text-green-900'} font-bold text-xs uppercase tracking-wide`}>
                    {instalacao.status === 'aberto' ? 'Aberto' : instalacao.status === 'concluido' ? 'Concluído' : instalacao.status}
                  </Text>
                </View>
                <Text className="text-gray-500 text-xs font-medium">#{instalacao.id}</Text>
              </View>

              {/* Cliente - Destaque Principal */}
              <TouchableOpacity
                onPress={() => router.push(`/detalhes/instalacao/cliente-info?id=${instalacao.uuid_solic}`)}
                className="mb-4 active:opacity-80"
              >
                <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Cliente</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-900 text-base font-bold flex-1" numberOfLines={2}>
                    {formatarNome(instalacao.nome)}
                  </Text>
                  <View className="bg-gray-100 p-2 rounded-full ml-2">
                    <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Informações Principais em Grid */}
              <View className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <View className="flex-row justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-gray-500 text-xs font-medium mb-1">Técnico</Text>
                    <Text className="text-gray-900 text-sm font-semibold" numberOfLines={1}>
                      {instalacao.tecnico || 'Não atribuído'}
                    </Text>
                  </View>
                  {instalacao.status === 'aberto' && (
                    <TouchableOpacity
                      onPress={() => abrirEdicao('tecnico', instalacao.tecnico || '')}
                      className="bg-purple-600 w-8 h-8 rounded-lg ml-2 items-center justify-center"
                    >
                      <Ionicons name="pencil" size={14} color="white" />
                    </TouchableOpacity>
                  )}
                </View>

                <View className="h-px bg-gray-200 my-2" />

                <View className="flex-row justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-gray-500 text-xs font-medium mb-1">Visita Agendada</Text>
                    <Text className="text-gray-900 text-sm font-semibold" numberOfLines={1}>
                      {instalacao.visita ? formatarDataCompleta(instalacao.visita) : 'Não agendada'}
                    </Text>
                  </View>
                  {instalacao.status === 'aberto' && (
                    <TouchableOpacity
                      onPress={() => abrirEdicao('visita', instalacao.visita || '')}
                      className="bg-purple-600 w-8 h-8 rounded-lg ml-2 items-center justify-center"
                    >
                      <Ionicons name="calendar-outline" size={14} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* AÇÕES RÁPIDAS - Cards Horizontais */}
            <View className="flex-row mb-4 gap-2">
              {/* Ligar */}
              {(instalacao.celular || instalacao.telefone) && (
                <TouchableOpacity
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
                      setContatoModalTitle('Selecionar Telefone');
                      setContatoOptions(
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
                            setContatoModalVisible(false);
                          },
                        }))
                      );
                      setContatoModalVisible(true);
                    }
                  }}
                  className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-green-100 active:scale-95"
                  style={{ transform: [{ scale: 1 }] }}
                >
                  <View className="items-center">
                    <View className="bg-green-500 w-10 h-10 rounded-full items-center justify-center mb-2">
                      <Ionicons name="call" size={18} color="white" />
                    </View>
                    <Text className="text-green-700 font-bold text-xs">Ligar</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* WhatsApp */}
              {(instalacao.celular || instalacao.telefone || instalacao.celular2) && (
                <TouchableOpacity
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
                      setContatoModalTitle('Selecionar Número para WhatsApp');
                      setContatoOptions(
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
                            setContatoModalVisible(false);
                          },
                        }))
                      );
                      setContatoModalVisible(true);
                    }
                  }}
                  className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-emerald-100 active:scale-95"
                  style={{ transform: [{ scale: 1 }] }}
                >
                  <View className="items-center">
                    <View className="bg-emerald-500 w-10 h-10 rounded-full items-center justify-center mb-2">
                      <Ionicons name="logo-whatsapp" size={18} color="white" />
                    </View>
                    <Text className="text-emerald-700 font-bold text-xs">WhatsApp</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Navegar */}
              {(instalacao.coordenadas || instalacao.endereco) && (
                <TouchableOpacity
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
                      setContatoModalTitle('Navegar para');
                      setContatoOptions([
                        {
                          label: 'Por Coordenadas GPS',
                          value: instalacao.coordenadas || '',
                          icon: 'navigate',
                          action: () => {
                            navegarPorCoordenadas();
                            setContatoModalVisible(false);
                          },
                        },
                        {
                          label: 'Por Endereço',
                          value: [instalacao.endereco, instalacao.numero, instalacao.bairro].filter(Boolean).join(', '),
                          icon: 'location',
                          action: () => {
                            navegarPorEndereco();
                            setContatoModalVisible(false);
                          },
                        },
                      ]);
                      setContatoModalVisible(true);
                    } else if (temCoordenadas) {
                      navegarPorCoordenadas();
                    } else if (temEndereco) {
                      navegarPorEndereco();
                    }
                  }}
                  className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-purple-100 active:scale-95"
                  style={{ transform: [{ scale: 1 }] }}
                >
                  <View className="items-center">
                    <View className="bg-purple-500 w-10 h-10 rounded-full items-center justify-center mb-2">
                      <Ionicons name="navigate" size={18} color="white" />
                    </View>
                    <Text className="text-purple-700 font-bold text-xs">Navegar</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* SEÇÃO TÉCNICA PRIORITÁRIA */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-md border border-purple-50">
              <View className="flex-row items-center mb-4">
                <View className="bg-purple-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="settings-outline" size={20} color="#9333ea" />
                </View>
                <Text className="text-base text-gray-900 font-bold flex-1">Configuração Técnica</Text>
              </View>

              {/* Plano - Destaque */}
              <TouchableOpacity
                onPress={() => instalacao.status === 'aberto' && setPlanoModalVisible(true)}
                disabled={instalacao.status !== 'aberto'}
                className="bg-purple-50 rounded-xl p-4 mb-4 border-2 border-purple-200"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-xs text-purple-600 font-bold uppercase tracking-wide mb-1">Plano Contratado</Text>
                    <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                      {instalacao.plano || 'Não informado'}
                    </Text>
                  </View>
                  {instalacao.status === 'aberto' && (
                    <View className="bg-purple-600 w-8 h-8 rounded-lg ml-2 items-center justify-center">
                      <Ionicons name="pencil" size={14} color="white" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Grid de Informações Técnicas */}
              <View className="gap-3">
                <View className="bg-gray-50 rounded-xl p-3">
                  <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Credenciais de Acesso</Text>

                  <EditableInfoRow
                    label="Login"
                    value={instalacao.login || 'Não configurado'}
                    onEdit={() => abrirEdicao('login', instalacao.login || '')}
                    editable={instalacao.status === 'aberto'}
                  />

                  {instalacao.senha && (
                    <View className="pt-2">
                      <InfoRow label="Senha" value="••••••••" />
                    </View>
                  )}
                </View>

                <View className="bg-gray-50 rounded-xl p-3">
                  <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Rede e Conectividade</Text>

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

                <View className="bg-gray-50 rounded-xl p-3">
                  <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Equipamento</Text>

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
            </View>

            {/* INFORMAÇÕES ADMINISTRATIVAS */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
              <View className="flex-row items-center mb-4">
                <View className="bg-purple-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="document-text-outline" size={20} color="#9333ea" />
                </View>
                <Text className="text-base text-gray-900 font-bold flex-1">Informações Administrativas</Text>
              </View>

              <View className="gap-2">
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
              </View>
            </View>

            {/* VALORES E TAXAS */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
              <View className="flex-row items-center mb-4">
                <View className="bg-green-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="cash-outline" size={20} color="#10b981" />
                </View>
                <Text className="text-base text-gray-900 font-bold flex-1">Valores e Taxas</Text>
              </View>

              <View className="gap-2">
                {instalacao.adesao && (
                  <View className="bg-green-50 rounded-xl p-3 mb-2">
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
              </View>
            </View>

            {/* DADOS DE FINALIZAÇÃO (somente se concluído) */}
            {instalacao.status === 'concluido' && (
              <View className="bg-gray-50 rounded-2xl p-5 mb-4 border-2 border-gray-200">
                <View className="flex-row items-center mb-4">
                  <View className="bg-gray-700 w-10 h-10 rounded-full items-center justify-center mr-3">
                    <Ionicons name="checkmark-done-outline" size={20} color="white" />
                  </View>
                  <Text className="text-base text-gray-900 font-bold flex-1">Finalização</Text>
                </View>

                <View className="gap-2">
                  {instalacao.instalado && (
                    <InfoRow label="Instalado" value={instalacao.instalado === 'sim' ? '✓ Sim' : '✗ Não'} />
                  )}

                  {instalacao.datainst && (
                    <InfoRow label="Data de Instalação" value={formatarDataCompleta(instalacao.datainst)} />
                  )}

                  {instalacao.valor && (
                    <InfoRow label="Valor Cobrado" value={`R$ ${instalacao.valor}`} />
                  )}

                  {instalacao.data_feito && (
                    <InfoRow label="Concluído em" value={formatarDataCompleta(instalacao.data_feito)} />
                  )}

                  {instalacao.nome_feito && (
                    <InfoRow label="Concluído por" value={instalacao.nome_feito} />
                  )}
                </View>
              </View>
            )}

            {/* OBSERVAÇÕES */}
            {(instalacao.status === 'aberto' || instalacao.obs) && (
              <TouchableOpacity
                onPress={() => abrirEdicao('obs', instalacao.obs || '')}
                disabled={instalacao.status !== 'aberto'}
                className="bg-white rounded-2xl p-5 mb-4 shadow-md"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-start flex-1">
                    <View className={`${instalacao.obs ? 'bg-amber-100' : 'bg-gray-100'} w-10 h-10 rounded-full items-center justify-center mr-3 mt-0.5`}>
                      <Ionicons
                        name={instalacao.obs ? "chatbox-ellipses-outline" : "add-circle-outline"}
                        size={20}
                        color={instalacao.obs ? "#f59e0b" : "#9ca3af"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
                        Observações
                      </Text>
                      <Text className={`text-sm leading-5 ${instalacao.obs ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                        {instalacao.obs || 'Toque para adicionar observações sobre esta instalação'}
                      </Text>
                    </View>
                  </View>
                  {instalacao.status === 'aberto' && (
                    <View className="ml-2 mt-1">
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color="#6b7280"
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
        <Modal
          visible={editModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-base font-bold text-gray-800">
                  Editar {getFieldLabel()}
                </Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <TextInput
                value={editValue}
                onChangeText={setEditValue}
                placeholder={`Digite ${getFieldLabel().toLowerCase()}`}
                multiline={editField === 'obs'}
                numberOfLines={editField === 'obs' ? 4 : 1}
                keyboardType={editField === 'email' ? 'email-address' : editField === 'telefone' || editField === 'celular' ? 'phone-pad' : 'default'}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-base text-gray-800 mb-4"
                style={editField === 'obs' ? { height: 100, textAlignVertical: 'top' } : {}}
                autoFocus
              />

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setEditModalVisible(false)}
                  className="flex-1 bg-gray-100 py-3 rounded-lg"
                >
                  <Text className="text-gray-700 font-semibold text-center">Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={salvarEdicao}
                  disabled={editaInstalacaoMutation.isPending}
                  className="flex-1 bg-purple-600 py-3 rounded-lg"
                >
                  {editaInstalacaoMutation.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-semibold text-center">Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* DateTimePicker para iOS */}
        {showDatePicker && Platform.OS === 'ios' && (
          <Modal
            visible={showDatePicker}
            animationType="fade"
            transparent
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View className="flex-1 bg-black/50 justify-end">
              <View className="bg-white rounded-t-3xl p-6">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-base font-bold text-gray-800">
                    Editar Data da Visita
                  </Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Ionicons name="close" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <DateTimePicker
                  value={selectedDate}
                  mode="datetime"
                  display="spinner"
                  onChange={(event, date) => {
                    if (date) {
                      setSelectedDate(date);
                    }
                  }}
                  locale="pt-BR"
                  minimumDate={new Date()}
                />

                <View className="flex-row gap-3 mt-4">
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    className="flex-1 bg-gray-100 py-3 rounded-lg"
                  >
                    <Text className="text-gray-700 font-semibold text-center">Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setShowDatePicker(false);
                      setEditField('visita');
                      salvarEdicao();
                    }}
                    disabled={editaInstalacaoMutation.isPending}
                    className="flex-1 bg-blue-600 py-3 rounded-lg"
                  >
                    {editaInstalacaoMutation.isPending ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-white font-semibold text-center">Salvar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Modal de Seleção de Plano */}
        <Modal
          visible={planoModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setPlanoModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-base font-bold text-gray-800">Selecionar Plano</Text>
                <TouchableOpacity onPress={() => setPlanoModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {isLoadingPlanos ? (
                <View className="py-8 items-center">
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text className="text-gray-500 mt-2">Carregando planos...</Text>
                </View>
              ) : !planos || planos.length === 0 ? (
                <View className="py-8 items-center">
                  <Ionicons name="alert-circle-outline" size={48} color="#9ca3af" />
                  <Text className="text-gray-500 mt-2">Nenhum plano disponível</Text>
                </View>
              ) : (
                <FlatList
                  data={planos}
                  keyExtractor={(item) => item.uuid_plano}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        if (!instalacao) return;

                        const dados = { plano: item.nome };
                        editaInstalacaoMutation.mutate(
                          { uuid: instalacao.uuid_solic, dados },
                          {
                            onSuccess: () => {
                              setPlanoModalVisible(false);
                              Toast.show({
                                type: 'success',
                                text1: 'Plano atualizado! ✅',
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
                      className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200 active:bg-gray-100"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-base font-bold text-gray-800 mb-1">
                            {item.nome}
                          </Text>
                          {item.descricao && (
                            <Text className="text-sm text-gray-600 mb-2">
                              {item.descricao}
                            </Text>
                          )}
                          <View className="flex-row items-center gap-4">
                            <View className="flex-row items-center">
                              <Ionicons name="arrow-down-circle" size={16} color="#10b981" />
                              <Text className="text-xs text-gray-600 ml-1">
                                {item.veldown} Mbps
                              </Text>
                            </View>
                            <View className="flex-row items-center">
                              <Ionicons name="arrow-up-circle" size={16} color="#3b82f6" />
                              <Text className="text-xs text-gray-600 ml-1">
                                {item.velup} Mbps
                              </Text>
                            </View>
                            <Text className="text-sm font-bold text-green-600">
                              R$ {item.valor}
                            </Text>
                          </View>
                        </View>
                        <Ionicons
                          name={instalacao?.plano === item.nome ? "checkmark-circle" : "chevron-forward"}
                          size={24}
                          color={instalacao?.plano === item.nome ? "#10b981" : "#9ca3af"}
                        />
                      </View>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={true}
                  ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
                />
              )}
            </View>
          </View>
        </Modal>

        {/* Modal de Seleção de Funcionário (Técnico) */}
        <Modal
          visible={funcionarioModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setFuncionarioModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-base font-bold text-gray-800">Selecionar Técnico</Text>
                <TouchableOpacity onPress={() => setFuncionarioModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {isLoadingFuncionarios ? (
                <View className="py-8 items-center">
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text className="text-gray-500 mt-2">Carregando funcionários...</Text>
                </View>
              ) : !funcionarios || funcionarios.length === 0 ? (
                <View className="py-8 items-center">
                  <Ionicons name="alert-circle-outline" size={48} color="#9ca3af" />
                  <Text className="text-gray-500 mt-2">Nenhum funcionário disponível</Text>
                </View>
              ) : (
                <FlatList
                  data={funcionarios}
                  keyExtractor={(item) => item.uuid_func}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        if (!instalacao) return;

                        const dados = { tecnico: item.nome };
                        editaInstalacaoMutation.mutate(
                          { uuid: instalacao.uuid_solic, dados },
                          {
                            onSuccess: () => {
                              setFuncionarioModalVisible(false);
                              Toast.show({
                                type: 'success',
                                text1: 'Técnico atualizado! ✅',
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
                      className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200 active:bg-gray-100"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-base font-bold text-gray-800 mb-1">
                            {item.nome}
                          </Text>
                          {item.cargo && (
                            <Text className="text-sm text-gray-600 mb-1">
                              {item.cargo}
                            </Text>
                          )}
                          <View className="flex-row items-center gap-4 flex-wrap">
                            {item.email && (
                              <View className="flex-row items-center">
                                <Ionicons name="mail-outline" size={14} color="#6b7280" />
                                <Text className="text-xs text-gray-600 ml-1">
                                  {item.email}
                                </Text>
                              </View>
                            )}
                            {item.celular && (
                              <View className="flex-row items-center">
                                <Ionicons name="call-outline" size={14} color="#6b7280" />
                                <Text className="text-xs text-gray-600 ml-1">
                                  {item.celular}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <Ionicons
                          name={instalacao?.tecnico === item.nome ? "checkmark-circle" : "chevron-forward"}
                          size={24}
                          color={instalacao?.tecnico === item.nome ? "#10b981" : "#9ca3af"}
                        />
                      </View>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={true}
                  ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
                />
              )}
            </View>
          </View>
        </Modal>

        {/* Modal de Seleção de Comodato */}
        <Modal
          visible={comodatoModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setComodatoModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-base font-bold text-gray-800">Comodato</Text>
                <TouchableOpacity onPress={() => setComodatoModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View className="gap-3">
                <TouchableOpacity
                  onPress={() => {
                    if (!instalacao) return;

                    const dados = { comodato: 'sim' };
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
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200 active:bg-gray-100"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="bg-green-100 w-10 h-10 rounded-full items-center justify-center">
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                      </View>
                      <View>
                        <Text className="text-base font-bold text-gray-800">Sim</Text>
                        <Text className="text-xs text-gray-600">Cliente possui equipamento em comodato</Text>
                      </View>
                    </View>
                    <Ionicons
                      name={instalacao?.comodato === 'sim' ? "checkmark-circle" : "chevron-forward"}
                      size={24}
                      color={instalacao?.comodato === 'sim' ? "#10b981" : "#9ca3af"}
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    if (!instalacao) return;

                    const dados = { comodato: 'nao' };
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
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200 active:bg-gray-100"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="bg-gray-100 w-10 h-10 rounded-full items-center justify-center">
                        <Ionicons name="close-circle" size={20} color="#6b7280" />
                      </View>
                      <View>
                        <Text className="text-base font-bold text-gray-800">Não</Text>
                        <Text className="text-xs text-gray-600">Cliente não possui equipamento em comodato</Text>
                      </View>
                    </View>
                    <Ionicons
                      name={instalacao?.comodato === 'nao' || !instalacao?.comodato ? "checkmark-circle" : "chevron-forward"}
                      size={24}
                      color={instalacao?.comodato === 'nao' || !instalacao?.comodato ? "#10b981" : "#9ca3af"}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal de Finalização */}
        <Modal
          visible={finalizacaoModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setFinalizacaoModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-base font-bold text-gray-900">Finalizar Instalação</Text>
                <TouchableOpacity onPress={() => setFinalizacaoModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView className="mb-4" style={{ maxHeight: 400 }}>
                {/* 1. Cliente foi visitado? */}
                <View className="mb-5">
                  <Text className="text-sm font-semibold text-gray-700 mb-3">Cliente foi visitado?</Text>
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => setVisitadoSim(true)}
                      className={`flex-1 p-4 rounded-lg border-2 ${visitadoSim ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <View className="items-center">
                        <Ionicons
                          name="checkmark-circle"
                          size={32}
                          color={visitadoSim ? "#3b82f6" : "#9ca3af"}
                        />
                        <Text className={`mt-2 font-semibold ${visitadoSim ? 'text-blue-700' : 'text-gray-600'}`}>
                          Sim
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setVisitadoSim(false)}
                      className={`flex-1 p-4 rounded-lg border-2 ${!visitadoSim ? 'bg-gray-50 border-gray-500' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <View className="items-center">
                        <Ionicons
                          name="close-circle"
                          size={32}
                          color={!visitadoSim ? "#6b7280" : "#9ca3af"}
                        />
                        <Text className={`mt-2 font-semibold ${!visitadoSim ? 'text-gray-700' : 'text-gray-600'}`}>
                          Não
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 2. Instalação realizada? - Só aparece se visitado=sim */}
                {visitadoSim && (
                  <View className="mb-5">
                    <Text className="text-sm font-semibold text-gray-700 mb-3">Instalação foi realizada?</Text>
                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        onPress={() => setInstaladoSim(true)}
                        className={`flex-1 p-4 rounded-lg border-2 ${instaladoSim ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <View className="items-center">
                          <Ionicons
                            name="checkmark-circle"
                            size={32}
                            color={instaladoSim ? "#10b981" : "#9ca3af"}
                          />
                          <Text className={`mt-2 font-semibold ${instaladoSim ? 'text-green-700' : 'text-gray-600'}`}>
                            Sim
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setInstaladoSim(false)}
                        className={`flex-1 p-4 rounded-lg border-2 ${!instaladoSim ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <View className="items-center">
                          <Ionicons
                            name="close-circle"
                            size={32}
                            color={!instaladoSim ? "#ef4444" : "#9ca3af"}
                          />
                          <Text className={`mt-2 font-semibold ${!instaladoSim ? 'text-red-700' : 'text-gray-600'}`}>
                            Não
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* 3. Data da Instalação - Só aparece se visitado=sim E instalado=sim */}
                {visitadoSim && instaladoSim && (
                  <View className="mb-5">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Data da Instalação</Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (Platform.OS === 'android') {
                          DateTimePickerAndroid.open({
                            value: dataInstalacao,
                            onChange: (event, selectedDate) => {
                              if (selectedDate) setDataInstalacao(selectedDate);
                            },
                            mode: 'date',
                            is24Hour: true,
                          });
                        } else {
                          setShowDatePicker(true);
                        }
                      }}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                          <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                          <Text className="text-gray-900 font-medium">
                            {dataInstalacao.toLocaleDateString('pt-BR')}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 4. Valor - Só aparece se visitado=sim E instalado=sim */}
                {visitadoSim && instaladoSim && (
                  <View className="mb-3">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Valor da Instalação (opcional)</Text>
                    <TextInput
                      value={valorInstalacao}
                      onChangeText={setValorInstalacao}
                      placeholder="R$ 0,00"
                      keyboardType="numeric"
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-900"
                    />
                  </View>
                )}
              </ScrollView>

              {/* Botões */}
              <View className="gap-3">
                <TouchableOpacity
                  onPress={() => {
                    // Lógica consistente: se não visitou, nada mais aconteceu
                    let dados: any = {
                      visitado: visitadoSim ? 'sim' : 'nao',
                    };

                    // Se não visitou, claramente não instalou e não tem dados
                    if (!visitadoSim) {
                      dados.instalado = 'nao';
                      dados.datainst = undefined;
                      dados.valor = undefined;
                    }
                    // Se visitou, verifica se instalou
                    else {
                      dados.instalado = instaladoSim ? 'sim' : 'nao';

                      // Se não instalou, não tem data nem valor
                      if (!instaladoSim) {
                        dados.datainst = undefined;
                        dados.valor = undefined;
                      }
                      // Se instalou, inclui data e valor
                      else {
                        dados.datainst = dataInstalacao.toISOString().split('T')[0];
                        dados.valor = valorInstalacao || undefined;
                      }
                    }

                    // Único dispatch: edita os dados e depois fecha
                    editaInstalacaoMutation.mutate(
                      { uuid: instalacao!.uuid_solic, dados },
                      {
                        onSuccess: () => {
                          // Depois fecha a instalação
                          fechaInstalacaoMutation.mutate(instalacao!.uuid_solic, {
                            onSuccess: () => {
                              setFinalizacaoModalVisible(false);
                              router.back();
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
                  }}
                  disabled={fechaInstalacaoMutation.isPending || editaInstalacaoMutation.isPending}
                  className="bg-green-600 py-4 rounded-lg"
                >
                  {(fechaInstalacaoMutation.isPending || editaInstalacaoMutation.isPending) ? (
                    <View className="flex-row items-center justify-center gap-2">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white font-bold text-center">Finalizando...</Text>
                    </View>
                  ) : (
                    <Text className="text-white font-bold text-center">Finalizar Instalação</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setFinalizacaoModalVisible(false)}
                  className="bg-gray-100 py-4 rounded-lg"
                >
                  <Text className="text-gray-700 font-semibold text-center">Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal de Seleção de Contato */}
        <Modal
          visible={contatoModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setContatoModalVisible(false)}
        >
          <Pressable
            className="flex-1 bg-black/50 justify-end"
            onPress={() => setContatoModalVisible(false)}
          >
            <Pressable
              className="bg-white rounded-t-3xl p-6 pb-8"
              onPress={(e) => e.stopPropagation()}
            >
              <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />

              <Text className="text-base font-bold text-gray-900 mb-4">
                {contatoModalTitle}
              </Text>

              <View className="gap-3">
                {contatoOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={option.action}
                    className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl active:bg-gray-100"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className={`w-10 h-10 rounded-full items-center justify-center ${option.icon === 'call' ? 'bg-green-100' : 'bg-emerald-100'
                        }`}>
                        <Ionicons
                          name={option.icon as any}
                          size={20}
                          color={option.icon === 'call' ? '#10b981' : '#059669'}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-600 text-xs">{option.label}</Text>
                        <Text className="text-gray-900 font-semibold">{option.value}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => setContatoModalVisible(false)}
                className="mt-6 bg-gray-100 p-4 rounded-xl active:bg-gray-200"
              >
                <Text className="text-center font-semibold text-gray-700">Cancelar</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
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

// Componente para campos editáveis
function EditableInfoRow({
  label,
  value,
  onEdit,
  editable = true,
  labelStyle,
  valueStyle
}: {
  label: string;
  value: string;
  onEdit: () => void;
  editable?: boolean;
  labelStyle?: string;
  valueStyle?: string;
}) {
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

  if (!editable) {
    return <InfoRow label={label} value={value} />;
  }

  if (labelStyle && valueStyle) {
    // Modo customizado para o Plano
    return (
      <TouchableOpacity
        onPress={onEdit}
        onLongPress={copiarValor}
        delayLongPress={500}
        className="mb-4"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className={labelStyle}>{label}</Text>
            <Text className={valueStyle}>{value}</Text>
          </View>
          <Ionicons name="create-outline" size={18} color="#6b7280" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Pressable
      onLongPress={copiarValor}
      delayLongPress={500}
      className="flex-row justify-between items-center py-2 border-b border-gray-100"
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? '#f3f4f6' : 'transparent',
        }
      ]}
    >
      <Text className="text-gray-600 text-sm">{label}</Text>
      <TouchableOpacity
        onPress={onEdit}
        className="flex-row items-center gap-2 flex-1 justify-end ml-4"
      >
        <Text className="text-gray-900 text-sm font-medium text-right flex-1">
          {value}
        </Text>
        <Ionicons name="create-outline" size={16} color="#6b7280" />
      </TouchableOpacity>
    </Pressable>
  );
}