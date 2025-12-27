import { useClientDetail } from '@/hooks/cliente';
import type { ClienteDetalhesParams } from '@/types/navigation';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClienteDetalhesScreen() {
  const { id } = useLocalSearchParams<ClienteDetalhesParams>();
  const { data: cliente, isLoading, error } = useClientDetail(id);

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
            <Text className="text-xs text-gray-500">#{cliente.codigo}</Text>
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
            {cliente.celular && <InfoRow label="Celular" value={cliente.celular} />}
            {cliente.fone && <InfoRow label="Telefone" value={cliente.fone} />}
            {cliente.email && <InfoRow label="Email" value={cliente.email} />}
          </View>

          {/* Endereço */}
          <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
            <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
              Endereço
            </Text>
            {cliente.endereco && (
              <InfoRow
                label="Endereço"
                value={`${cliente.endereco}${cliente.numero ? `, ${cliente.numero}` : ''}`}
              />
            )}
            {cliente.complemento && (
              <InfoRow label="Complemento" value={cliente.complemento} />
            )}
            {cliente.bairro && <InfoRow label="Bairro" value={cliente.bairro} />}
            {cliente.cidade && cliente.estado && (
              <InfoRow label="Cidade/Estado" value={`${cliente.cidade} - ${cliente.estado}`} />
            )}
            {cliente.cep && <InfoRow label="CEP" value={cliente.cep} />}
          </View>

          {/* Plano e Serviços */}
          <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
            <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
              Plano e Serviços
            </Text>
            {cliente.plano && <InfoRow label="Plano" value={cliente.plano} />}
            {cliente.login && <InfoRow label="Login" value={cliente.login} />}
            {cliente.senha && <InfoRow label="Senha" value={cliente.senha} />}
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
            {cliente.ssid && <InfoRow label="SSID (WiFi)" value={cliente.ssid} />}
            {cliente.ip && <InfoRow label="IP" value={cliente.ip} />}
            {cliente.mac && <InfoRow label="MAC Address" value={cliente.mac} />}
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
              <View className="py-2">
                <Text className="text-gray-600 text-sm mb-2">Localização GPS</Text>
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
                  className="bg-blue-500 rounded-lg py-2 px-4 items-center"
                >
                  <Text className="text-white font-semibold text-sm">
                    📍 Abrir no Google Maps
                  </Text>
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
          {cliente.obs && (
            <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
              <Text className="text-xs text-gray-500 uppercase font-semibold mb-2">
                Observações
              </Text>
              <Text className="text-gray-700">{cliente.obs}</Text>
            </View>
          )}
        </View>
      </ScrollView>
      </SafeAreaView>
    </>
  );
}

// Componente helper para exibir informações
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-gray-100">
      <Text className="text-gray-600 text-sm">{label}</Text>
      <Text className="text-gray-900 text-sm font-medium flex-1 text-right ml-4">
        {value}
      </Text>
    </View>
  );
}
