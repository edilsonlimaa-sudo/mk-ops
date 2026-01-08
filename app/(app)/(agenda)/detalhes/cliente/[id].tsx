import { EditModal } from '@/components/instalacao/EditModal';
import { EditableInfoRow, InfoRow } from '@/components/instalacao/InfoRows';
import { useClientDetail, useUpdateClient } from '@/hooks/cliente';
import type { ClienteDetalhesParams } from '@/types/navigation';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function ClienteDetalhesScreen() {
  const { id } = useLocalSearchParams<ClienteDetalhesParams>();
  const { data: cliente, isLoading, error } = useClientDetail(id);
  const updateClientMutation = useUpdateClient();
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  // Estados para edição
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<'celular' | 'fone' | 'email' | 'endereco' | 'numero' | 'complemento' | 'bairro' | 'cidade' | 'estado' | 'cep' | 'obs' | null>(null);
  const [editValue, setEditValue] = useState('');

  const abrirEdicao = (field: typeof editField, value: string) => {
    setEditField(field);
    setEditValue(value);
    setEditModalVisible(true);
  };

  const getFieldLabel = () => {
    const labels: Record<string, string> = {
      celular: 'Celular',
      fone: 'Telefone',
      email: 'E-mail',
      endereco: 'Endereço',
      numero: 'Número',
      complemento: 'Complemento',
      bairro: 'Bairro',
      cidade: 'Cidade',
      estado: 'Estado',
      cep: 'CEP',
      obs: 'Observações',
    };
    return labels[editField || ''] || '';
  };

  const salvarEdicao = () => {
    if (!editField || !cliente) return;

    const payload = {
      uuid: cliente.uuid_cliente,
      [editField]: editValue,
    };

    updateClientMutation.mutate(payload, {
      onSuccess: () => {
        setEditModalVisible(false);
        Toast.show({
          type: 'success',
          text1: 'Alteração salva! ✅',
          position: 'top',
          visibilityTime: 2000,
          topOffset: 60,
        });
      },
      onError: (error) => {
        Toast.show({
          type: 'error',
          text1: 'Erro ao salvar',
          text2: error instanceof Error ? error.message : 'Tente novamente',
          position: 'top',
          topOffset: 60,
        });
      },
    });
  };

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

  const compartilharTexto = async (texto: string, titulo: string) => {
    try {
      await Share.share({
        message: texto,
        title: titulo,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const ligarParaCliente = async () => {
    const telefone = cliente?.celular || cliente?.fone;
    
    if (!telefone) {
      Alert.alert('Atenção', 'Nenhum número de telefone disponível para este cliente.');
      return;
    }

    // Remover caracteres não numéricos
    const numeroLimpo = telefone.replace(/\D/g, '');
    const url = `tel:${numeroLimpo}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o discador de telefone.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível realizar a ligação.');
      console.error('Erro ao ligar:', error);
    }
  };

  const navegarParaCliente = async () => {
    if (!cliente?.coordenadas || cliente.coordenadas === '-38.5748,-3.741162,0') {
      Alert.alert('Atenção', 'Coordenadas GPS não disponíveis para este cliente.');
      return;
    }

    try {
      // Parse coordinates
      const parts = cliente.coordenadas.split(',');
      
      if (parts.length < 2) {
        Alert.alert('Erro', 'Formato de coordenadas inválido');
        return;
      }

      const firstValue = parseFloat(parts[0]?.trim() || '');
      const secondValue = parseFloat(parts[1]?.trim() || '');
      
      if (isNaN(firstValue) || isNaN(secondValue) || !isFinite(firstValue) || !isFinite(secondValue)) {
        Alert.alert('Erro', 'Coordenadas inválidas');
        return;
      }

      if (Math.abs(firstValue) > 180 || Math.abs(secondValue) > 180) {
        Alert.alert('Erro', 'Coordenadas fora do intervalo válido');
        return;
      }
      
      const lat = Math.abs(firstValue) < Math.abs(secondValue) ? firstValue : secondValue;
      const lng = Math.abs(firstValue) < Math.abs(secondValue) ? secondValue : firstValue;
      
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o Google Maps');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o mapa');
      console.error('Erro ao abrir mapa:', error);
    }
  };

  const enviarWhatsApp = async () => {
    const celular = cliente?.celular;
    
    if (!celular) {
      Alert.alert('Atenção', 'Número de celular não disponível para este cliente.');
      return;
    }

    // Remover caracteres não numéricos
    const numeroLimpo = celular.replace(/\D/g, '');
    
    // Adicionar código do país (55 para Brasil) se não tiver
    const numeroCompleto = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;
    
    const url = `https://wa.me/${numeroCompleto}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o WhatsApp. Verifique se o app está instalado.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.');
      console.error('Erro ao abrir WhatsApp:', error);
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Cliente' }} />
        <SafeAreaView className="flex-1 bg-white justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-600 mt-4">Carregando cliente...</Text>
        </SafeAreaView>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: 'Erro' }} />
        <SafeAreaView className="flex-1 bg-white justify-center items-center p-6">
          <Text className="text-red-500 text-lg font-semibold mb-2">
            Erro ao carregar cliente
          </Text>
          <Text className="text-gray-600 text-center mb-4">
            {error.message}
          </Text>
        </SafeAreaView>
      </>
    );
  }

  if (!cliente) {
    return (
      <>
        <Stack.Screen options={{ title: 'Cliente' }} />
        <SafeAreaView className="flex-1 bg-white justify-center items-center p-6">
          <Text className="text-gray-500 text-lg">Cliente não encontrado</Text>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Detalhes do Cliente',
          headerBackTitle: 'Voltar',
        }} 
      />
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Status Badge */}
          <View className="flex-row justify-between items-center mb-4">
            <View
              className={`px-3 py-1.5 rounded-full ${
                cliente.bloqueado === 'sim' ? 'bg-red-500' : 'bg-green-500'
              }`}
            >
              <Text className="text-white font-semibold text-sm">
                {cliente.bloqueado === 'sim' ? '🚫 Bloqueado' : '✅ Ativo'}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              {/* Botões de ação rápida como ícones */}
              {(cliente.celular || cliente.fone) && (
                <TouchableOpacity
                  onPress={ligarParaCliente}
                  className="bg-green-500 p-2.5 rounded-full active:bg-green-600"
                >
                  <Ionicons name="call" size={18} color="white" />
                </TouchableOpacity>
              )}
              {cliente.celular && (
                <TouchableOpacity
                  onPress={enviarWhatsApp}
                  className="bg-emerald-500 p-2.5 rounded-full active:bg-emerald-600"
                >
                  <Ionicons name="logo-whatsapp" size={18} color="white" />
                </TouchableOpacity>
              )}
              {cliente.coordenadas && cliente.coordenadas !== '-38.5748,-3.741162,0' && (
                <TouchableOpacity
                  onPress={navegarParaCliente}
                  className="bg-blue-500 p-2.5 rounded-full active:bg-blue-600"
                >
                  <Ionicons name="location" size={18} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Informações Básicas */}
          <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
            <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
              Informações Básicas
            </Text>
            
            <View className="mb-3">
              <Text className="text-lg font-bold text-gray-900">{cliente.nome}</Text>
            </View>

            {cliente.cpf_cnpj && (
              <InfoRow label="CPF/CNPJ" value={cliente.cpf_cnpj} />
            )}
            {cliente.rg && <InfoRow label="RG" value={cliente.rg} />}
            {cliente.nascimento && (
              <InfoRow label="Nascimento" value={cliente.nascimento} />
            )}
            {cliente.cadastro && (
              <InfoRow label="Cadastrado em" value={cliente.cadastro} />
            )}
          </View>

          {/* Contato */}
          <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
            <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
              Contato
            </Text>
            
            {/* Celular com botão WhatsApp */}
            {cliente.celular && (
              <View className="border-b border-gray-100">
                <EditableInfoRow
                  label="Celular"
                  value={cliente.celular}
                  onEdit={() => abrirEdicao('celular', cliente.celular || '')}
                  editable={true}
                />
                {/* Botão WhatsApp abaixo */}
                <View className="flex-row justify-end pb-2 -mt-1">
                  <TouchableOpacity
                    onPress={enviarWhatsApp}
                    className="bg-emerald-50 px-3 py-1.5 rounded-lg active:bg-emerald-100 flex-row items-center gap-1"
                  >
                    <Ionicons name="logo-whatsapp" size={14} color="#10b981" />
                    <Text className="text-emerald-600 text-xs font-medium">WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {cliente.fone && (
              <EditableInfoRow
                label="Telefone"
                value={cliente.fone}
                onEdit={() => abrirEdicao('fone', cliente.fone || '')}
                editable={true}
              />
            )}
            {cliente.email && (
              <EditableInfoRow
                label="Email"
                value={cliente.email}
                onEdit={() => abrirEdicao('email', cliente.email || '')}
                editable={true}
              />
            )}
          </View>

          {/* Endereço */}
          <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
            <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
              Endereço
            </Text>
            {cliente.endereco && (
              <EditableInfoRow
                label="Endereço"
                value={cliente.endereco}
                onEdit={() => abrirEdicao('endereco', cliente.endereco || '')}
                editable={true}
              />
            )}
            {cliente.numero && (
              <EditableInfoRow
                label="Número"
                value={cliente.numero}
                onEdit={() => abrirEdicao('numero', cliente.numero || '')}
                editable={true}
              />
            )}
            {cliente.complemento && (
              <EditableInfoRow
                label="Complemento"
                value={cliente.complemento}
                onEdit={() => abrirEdicao('complemento', cliente.complemento || '')}
                editable={true}
              />
            )}
            {cliente.bairro && (
              <EditableInfoRow
                label="Bairro"
                value={cliente.bairro}
                onEdit={() => abrirEdicao('bairro', cliente.bairro || '')}
                editable={true}
              />
            )}
            {cliente.cidade && (
              <EditableInfoRow
                label="Cidade"
                value={cliente.cidade}
                onEdit={() => abrirEdicao('cidade', cliente.cidade || '')}
                editable={true}
              />
            )}
            {cliente.estado && (
              <EditableInfoRow
                label="Estado"
                value={cliente.estado}
                onEdit={() => abrirEdicao('estado', cliente.estado || '')}
                editable={true}
              />
            )}
            {cliente.cep && (
              <EditableInfoRow
                label="CEP"
                value={cliente.cep}
                onEdit={() => abrirEdicao('cep', cliente.cep || '')}
                editable={true}
              />
            )}
            
            {/* Ações inline discretas */}
            {cliente.endereco && (
              <View className="flex-row justify-end gap-2 mt-2">
                <TouchableOpacity
                  onPress={() => {
                    const enderecoCompleto = [
                      cliente.endereco && cliente.numero ? `${cliente.endereco}, ${cliente.numero}` : cliente.endereco,
                      cliente.complemento,
                      cliente.bairro,
                      cliente.cidade && cliente.estado ? `${cliente.cidade} - ${cliente.estado}` : null,
                      cliente.cep,
                    ]
                      .filter(Boolean)
                      .join(', ');
                    copiarParaClipboard(enderecoCompleto, 'Endereço');
                  }}
                  className="bg-blue-50 p-2 rounded-lg active:bg-blue-100 flex-row items-center gap-1"
                >
                  <Ionicons name="copy-outline" size={14} color="#3b82f6" />
                  <Text className="text-blue-600 text-xs font-medium">Copiar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const enderecoCompleto = [
                      cliente.endereco && cliente.numero ? `${cliente.endereco}, ${cliente.numero}` : cliente.endereco,
                      cliente.complemento,
                      cliente.bairro,
                      cliente.cidade && cliente.estado ? `${cliente.cidade} - ${cliente.estado}` : null,
                      cliente.cep,
                    ]
                      .filter(Boolean)
                      .join('\n');
                    compartilharTexto(enderecoCompleto, 'Endereço do Cliente');
                  }}
                  className="bg-green-50 p-2 rounded-lg active:bg-green-100 flex-row items-center gap-1"
                >
                  <Ionicons name="share-outline" size={14} color="#10b981" />
                  <Text className="text-green-600 text-xs font-medium">Compartilhar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Plano e Serviços */}
          <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
            <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
              Plano e Serviços
            </Text>
            {cliente.plano && <InfoRow label="Plano" value={cliente.plano} />}
            
            {/* Login com ação de copiar */}
            {cliente.login && (
              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-gray-600 text-sm">Login</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-gray-900 text-sm font-medium">{cliente.login}</Text>
                  <TouchableOpacity
                    onPress={() => copiarParaClipboard(cliente.login!, 'Login')}
                    className="bg-blue-50 p-2 rounded-lg active:bg-blue-100"
                  >
                    <Ionicons name="copy-outline" size={16} color="#3b82f6" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Senha com ação de copiar e toggle de visibilidade */}
            {cliente.senha && (
              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-gray-600 text-sm">Senha</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-gray-900 text-sm font-medium font-mono">
                    {senhaVisivel ? cliente.senha : '••••••••'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSenhaVisivel(!senhaVisivel)}
                    className="bg-gray-50 p-2 rounded-lg active:bg-gray-100"
                  >
                    <Ionicons 
                      name={senhaVisivel ? "eye-off-outline" : "eye-outline"} 
                      size={16} 
                      color="#6b7280" 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => copiarParaClipboard(cliente.senha!, 'Senha')}
                    className="bg-blue-50 p-2 rounded-lg active:bg-blue-100"
                  >
                    <Ionicons name="copy-outline" size={16} color="#3b82f6" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {cliente.venc && <InfoRow label="Vencimento" value={`Dia ${cliente.venc}`} />}
            {cliente.contrato && <InfoRow label="Contrato" value={cliente.contrato} />}
            {cliente.tipo && <InfoRow label="Tipo de Conexão" value={cliente.tipo.toUpperCase()} />}
            {cliente.status_corte && (
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600 text-sm">Status de Corte</Text>
                <View
                  className={`px-2 py-1 rounded ${
                    cliente.status_corte === 'full' ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      cliente.status_corte === 'full' ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {cliente.status_corte === 'full' ? '✓ Normal' : '⚠ ' + cliente.status_corte}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Informações Técnicas */}
          <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
            <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
              🔧 Informações Técnicas
            </Text>
            {cliente.equipamento && cliente.equipamento !== 'nenhum' && (
              <InfoRow label="Equipamento" value={cliente.equipamento} />
            )}
            {cliente.onu_ont && <InfoRow label="ONU/ONT" value={cliente.onu_ont} />}
            {cliente.porta_olt && <InfoRow label="Porta OLT" value={cliente.porta_olt} />}
            {cliente.porta_splitter && <InfoRow label="Porta Splitter" value={cliente.porta_splitter} />}
            {cliente.switch && cliente.switch !== 'nenhum' && (
              <InfoRow label="Switch" value={cliente.switch} />
            )}
            {cliente.armario_olt && <InfoRow label="Armário OLT" value={cliente.armario_olt} />}
            {cliente.caixa_herm && <InfoRow label="Caixa Hermética" value={cliente.caixa_herm} />}
            
            {/* SSID - removido pois o campo não contém o SSID real da rede WiFi */}
            {/* {cliente.ssid && (...)} */}

            {/* IP com ação de copiar */}
            {cliente.ip && (
              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-gray-600 text-sm">IP</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-gray-900 text-sm font-medium font-mono">{cliente.ip}</Text>
                  <TouchableOpacity
                    onPress={() => copiarParaClipboard(cliente.ip!, 'IP')}
                    className="bg-blue-50 p-2 rounded-lg active:bg-blue-100"
                  >
                    <Ionicons name="copy-outline" size={16} color="#3b82f6" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* MAC Address com ação de copiar */}
            {cliente.mac && (
              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-gray-600 text-sm">MAC Address</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-gray-900 text-sm font-medium font-mono">{cliente.mac}</Text>
                  <TouchableOpacity
                    onPress={() => copiarParaClipboard(cliente.mac!, 'MAC Address')}
                    className="bg-blue-50 p-2 rounded-lg active:bg-blue-100"
                  >
                    <Ionicons name="copy-outline" size={16} color="#3b82f6" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {cliente.comodato && cliente.comodato !== 'nao' && (
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600 text-sm">Comodato</Text>
                <View className="bg-blue-100 px-2 py-1 rounded">
                  <Text className="text-xs font-medium text-blue-700">
                    Equipamento em Comodato
                  </Text>
                </View>
              </View>
            )}
            {cliente.coordenadas && cliente.coordenadas !== '-38.5748,-3.741162,0' && (
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-600 text-sm">Localização GPS</Text>
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      // Validar se coordenadas existem
                      if (!cliente.coordenadas || typeof cliente.coordenadas !== 'string') {
                        Alert.alert('Erro', 'Coordenadas não disponíveis');
                        return;
                      }

                      // Parse coordinates
                      const parts = cliente.coordenadas.split(',');
                      
                      // Validar se temos pelo menos 2 partes
                      if (parts.length < 2) {
                        Alert.alert('Erro', 'Formato de coordenadas inválido');
                        return;
                      }

                      const firstValue = parseFloat(parts[0]?.trim() || '');
                      const secondValue = parseFloat(parts[1]?.trim() || '');
                      
                      // Validar se as coordenadas são números válidos e finitos
                      if (
                        isNaN(firstValue) || 
                        isNaN(secondValue) || 
                        !isFinite(firstValue) || 
                        !isFinite(secondValue)
                      ) {
                        Alert.alert('Erro', 'Coordenadas inválidas');
                        return;
                      }

                      // Validar se estão dentro de ranges geográficos válidos
                      if (
                        Math.abs(firstValue) > 180 || 
                        Math.abs(secondValue) > 180
                      ) {
                        Alert.alert('Erro', 'Coordenadas fora do intervalo válido');
                        return;
                      }
                      
                      // Google Maps espera: lat,lng (latitude, longitude)
                      // No Brasil: latitude é menor (entre -5 e -33), longitude é maior (entre -35 e -73)
                      // Detectar automaticamente: o valor com menor valor absoluto é a latitude
                      const lat = Math.abs(firstValue) < Math.abs(secondValue) ? firstValue : secondValue;
                      const lng = Math.abs(firstValue) < Math.abs(secondValue) ? secondValue : firstValue;
                      
                      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                      
                      const canOpen = await Linking.canOpenURL(url);
                      if (canOpen) {
                        await Linking.openURL(url);
                      } else {
                        Alert.alert('Erro', 'Não foi possível abrir o Google Maps');
                      }
                    } catch (error) {
                      Alert.alert('Erro', 'Não foi possível abrir o mapa');
                      console.error('Erro ao abrir mapa:', error);
                    }
                  }}
                  className="bg-blue-50 p-2 rounded-lg active:bg-blue-100 flex-row items-center gap-1"
                >
                  <Ionicons name="navigate-outline" size={14} color="#3b82f6" />
                  <Text className="text-blue-600 text-xs font-medium">Abrir Mapa</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Status Financeiro */}
          {(cliente.tit_abertos !== '0' || cliente.tit_vencidos !== '0') && (
            <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
              <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
                💰 Status Financeiro
              </Text>
              {cliente.tit_abertos !== '0' && (
                <InfoRow label="Títulos em Aberto" value={cliente.tit_abertos} />
              )}
              {cliente.tit_vencidos !== '0' && (
                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-gray-600 text-sm">Títulos Vencidos</Text>
                  <View className="bg-red-100 px-2 py-1 rounded">
                    <Text className="text-xs font-medium text-red-700">
                      ⚠ {cliente.tit_vencidos}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Observações */}
          <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs text-gray-500 uppercase font-semibold">
                Observações
              </Text>
              <TouchableOpacity
                onPress={() => abrirEdicao('obs', cliente?.obs || '')}
                className="bg-blue-50 px-2 py-1 rounded-lg active:bg-blue-100 flex-row items-center gap-1"
              >
                <Ionicons name="create-outline" size={14} color="#3b82f6" />
                <Text className="text-blue-600 text-xs font-medium">Editar</Text>
              </TouchableOpacity>
            </View>
            {cliente?.obs ? (
              <Text className="text-gray-700">{cliente.obs}</Text>
            ) : (
              <Text className="text-gray-400 italic">Nenhuma observação cadastrada</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal de Edição */}
      <EditModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={salvarEdicao}
        title={`Editar ${getFieldLabel()}`}
        value={editValue}
        onChange={setEditValue}
        placeholder={`Digite o ${getFieldLabel().toLowerCase()}`}
        isPending={updateClientMutation.isPending}
        multiline={editField === 'obs'}
      />
      </SafeAreaView>
    </>
  );
}


