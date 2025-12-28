import { ClientSearchModal } from '@/components/ClientSearchModal';
import { useFechaInstalacao, useInstalacaoDetail } from '@/hooks/instalacao';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function InstalacaoDetalhesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const fechaInstalacaoMutation = useFechaInstalacao();

  if (!id) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">ID da instalação não fornecido</Text>
      </View>
    );
  }

  const { data: instalacao, isLoading, error } = useInstalacaoDetail(id);

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

  const statusColor = instalacao.instalado === 'sim' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
  const statusText = instalacao.instalado === 'sim' ? 'Instalado' : 'Pendente';

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

  return (
    <>
      <Stack.Screen
        options={{
          title: `Instalação #${instalacao.id}`,
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
                <Text className="text-gray-400 text-xs">#{instalacao.id}</Text>
              </View>

              {/* Cliente */}
              <TouchableOpacity
                onPress={() => setSearchModalVisible(true)}
                className="active:opacity-70 mb-4"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-gray-500 text-xs mb-1">CLIENTE</Text>
                    <Text className="text-gray-900 text-xl font-bold mb-1">{instalacao.nome}</Text>
                    {instalacao.cpf && (
                      <Text className="text-gray-500 text-sm">{instalacao.cpf}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </TouchableOpacity>

              {/* Plano */}
              <View className="mb-4">
                <Text className="text-gray-500 text-xs mb-1">PLANO</Text>
                <Text className="text-gray-900 text-base font-medium">
                  {instalacao.plano}
                </Text>
              </View>

              {/* Visita Agendada - Destaque */}
              {instalacao.visita && (
                <View className="mb-4 pb-4 border-b border-gray-100">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-orange-600 text-xs font-semibold mb-1">VISITA AGENDADA</Text>
                      <Text className="text-gray-900 font-bold">
                        {formatarDataCompleta(instalacao.visita)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Informações de Conclusão - Destaque quando instalado */}
              {instalacao.instalado === 'sim' && instalacao.data_feito && (
                <View className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                  <View className="gap-2">
                    <View>
                      <Text className="text-gray-500 text-xs mb-0.5">Data de Conclusão</Text>
                      <Text className="text-gray-900 font-bold">{formatarDataCompleta(instalacao.data_feito)}</Text>
                    </View>
                    {instalacao.nome_feito && (
                      <View className="mt-2 pt-2 border-t border-gray-200">
                        <Text className="text-gray-500 text-xs mb-0.5">Concluído por</Text>
                        <Text className="text-gray-900 font-medium">{instalacao.nome_feito}</Text>
                      </View>
                    )}
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
                      {statusText}
                    </Text>
                  </View>
                </View>

                {instalacao.termo && (
                  <InfoRow label="Termo" value={`#${instalacao.termo}`} />
                )}

                <InfoRow 
                  label="Processado em" 
                  value={formatarDataCompleta(instalacao.processamento)} 
                />

                {instalacao.tecnico && (
                  <InfoRow label="Técnico" value={instalacao.tecnico} />
                )}

                {instalacao.datainst && (
                  <InfoRow label="Data de Instalação" value={formatarDataCompleta(instalacao.datainst)} />
                )}

                {instalacao.visitado && (
                  <InfoRow label="Visitado" value={instalacao.visitado === 'sim' ? 'Sim' : 'Não'} />
                )}
              </View>
            </View>

            {/* Contato */}
            <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
              <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">Contato</Text>
              
              <View className="gap-3">
                {instalacao.email && (
                  <InfoRow label="E-mail" value={instalacao.email} />
                )}

                {instalacao.telefone && (
                  <InfoRow label="Telefone" value={instalacao.telefone} />
                )}

                {instalacao.celular && (
                  <InfoRow label="Celular" value={instalacao.celular} />
                )}
              </View>
            </View>

            {/* Endereço */}
            <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
              <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">Endereço de Instalação</Text>
              
              <View className="gap-3">
                <InfoRow 
                  label="Logradouro" 
                  value={`${instalacao.endereco}, ${instalacao.numero}`} 
                />

                {instalacao.complemento && (
                  <InfoRow label="Complemento" value={instalacao.complemento} />
                )}

                <InfoRow label="Bairro" value={instalacao.bairro} />

                <InfoRow 
                  label="Cidade/Estado" 
                  value={`${instalacao.cidade} - ${instalacao.estado}`} 
                />

                <InfoRow label="CEP" value={instalacao.cep} />
              </View>
            </View>

            {/* Plano e Serviço */}
            <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
              <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">Plano e Serviço</Text>
              
              <View className="gap-3">
                {instalacao.valor && (
                  <InfoRow label="Valor" value={`R$ ${instalacao.valor}`} />
                )}

                <InfoRow label="Vencimento" value={instalacao.vencimento} />

                {instalacao.login && (
                  <InfoRow label="Login de Acesso" value={instalacao.login} />
                )}

                <InfoRow 
                  label="Comodato" 
                  value={instalacao.comodato === 'sim' ? 'Sim' : 'Não'} 
                />

                {instalacao.equipamento && (
                  <InfoRow label="Equipamento" value={instalacao.equipamento} />
                )}
              </View>
            </View>

            {/* Informações Técnicas */}
            {(instalacao.ip || instalacao.mac || instalacao.coordenadas) && (
              <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">Informações Técnicas</Text>

                <View className="gap-3">
                  {instalacao.ip && (
                    <InfoRow label="IP" value={instalacao.ip} />
                  )}

                  {instalacao.mac && (
                    <InfoRow label="MAC Address" value={instalacao.mac} />
                  )}

                  {instalacao.coordenadas && (
                    <InfoRow label="Coordenadas GPS" value={instalacao.coordenadas} />
                  )}
                </View>
              </View>
            )}

            {/* Observações */}
            {instalacao.obs && (
              <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                <Text className="text-xs text-gray-500 uppercase font-semibold mb-2">
                  Observações
                </Text>
                <Text className="text-gray-800 leading-5">{instalacao.obs}</Text>
              </View>
            )}

            {/* Botão de Ação */}
            {instalacao.status === 'aberto' && (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Concluir Instalação',
                    'Tem certeza que deseja concluir esta instalação?',
                    [
                      {
                        text: 'Cancelar',
                        style: 'cancel',
                      },
                      {
                        text: 'Concluir',
                        style: 'default',
                        onPress: () => {
                          fechaInstalacaoMutation.mutate(instalacao.uuid_solic, {
                            onSuccess: () => {
                              router.back();
                              setTimeout(() => {
                                Toast.show({
                                  type: 'success',
                                  text1: 'Instalação concluída com sucesso! ✅',
                                  text2: 'Você pode vê-la na aba Histórico',
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
                disabled={fechaInstalacaoMutation.isPending}
                className="bg-green-600 py-3.5 rounded-lg shadow-sm active:opacity-90"
              >
                {fechaInstalacaoMutation.isPending ? (
                  <View className="flex-row items-center justify-center gap-2">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-semibold text-center">Concluindo...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-semibold text-center">Concluir Instalação</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Client Search Modal */}
        <ClientSearchModal
          visible={searchModalVisible}
          onClose={() => setSearchModalVisible(false)}
          initialSearchQuery={instalacao?.nome || ''}
        />
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