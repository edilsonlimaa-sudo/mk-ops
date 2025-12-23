import { useInstalacaoDetail } from '@/hooks/useInstalacaoDetail';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

export default function InstalacaoDetalhesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
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

  const statusColor = instalacao.instalado === 'sim' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
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
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-4 gap-4">
          {/* Status */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-500 text-xs mb-1">Status</Text>
                <View className={`${statusColor} px-3 py-1 rounded-full self-start`}>
                  <Text className={`${statusColor.split(' ')[1]} font-semibold text-sm`}>
                    {statusText}
                  </Text>
                </View>
              </View>
              {instalacao.termo && (
                <View>
                  <Text className="text-gray-500 text-xs mb-1 text-right">Termo</Text>
                  <Text className="text-gray-900 font-semibold">#{instalacao.termo}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Informações do Cliente */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-3">Informações do Cliente</Text>
            
            <View className="gap-3">
              <View>
                <Text className="text-gray-500 text-xs mb-1">Nome</Text>
                <Text className="text-gray-900 font-semibold">{instalacao.nome}</Text>
              </View>

              <View className="border-t border-gray-100 pt-3">
                <Text className="text-gray-500 text-xs mb-1">CPF</Text>
                <Text className="text-gray-900">{instalacao.cpf}</Text>
              </View>

              {instalacao.email && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">E-mail</Text>
                  <Text className="text-gray-900">{instalacao.email}</Text>
                </View>
              )}

              {instalacao.telefone && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Telefone</Text>
                  <Text className="text-gray-900">{instalacao.telefone}</Text>
                </View>
              )}

              {instalacao.celular && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Celular</Text>
                  <Text className="text-gray-900">{instalacao.celular}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Endereço de Instalação */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-3">Endereço de Instalação</Text>
            
            <View className="gap-3">
              <View>
                <Text className="text-gray-500 text-xs mb-1">Logradouro</Text>
                <Text className="text-gray-900">{instalacao.endereco}, {instalacao.numero}</Text>
              </View>

              {instalacao.complemento && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Complemento</Text>
                  <Text className="text-gray-900">{instalacao.complemento}</Text>
                </View>
              )}

              <View className="border-t border-gray-100 pt-3">
                <Text className="text-gray-500 text-xs mb-1">Bairro</Text>
                <Text className="text-gray-900">{instalacao.bairro}</Text>
              </View>

              <View className="border-t border-gray-100 pt-3">
                <Text className="text-gray-500 text-xs mb-1">Cidade/Estado</Text>
                <Text className="text-gray-900">{instalacao.cidade} - {instalacao.estado}</Text>
              </View>

              <View className="border-t border-gray-100 pt-3">
                <Text className="text-gray-500 text-xs mb-1">CEP</Text>
                <Text className="text-gray-900">{instalacao.cep}</Text>
              </View>
            </View>
          </View>

          {/* Plano e Serviço */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-3">Plano e Serviço</Text>
            
            <View className="gap-3">
              <View>
                <Text className="text-gray-500 text-xs mb-1">Plano Contratado</Text>
                <Text className="text-gray-900 font-semibold">{instalacao.plano}</Text>
              </View>

              {instalacao.valor && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Valor</Text>
                  <Text className="text-gray-900 font-medium">R$ {instalacao.valor}</Text>
                </View>
              )}

              <View className="border-t border-gray-100 pt-3">
                <Text className="text-gray-500 text-xs mb-1">Vencimento</Text>
                <Text className="text-gray-900">{instalacao.vencimento}</Text>
              </View>

              {instalacao.login && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Login de Acesso</Text>
                  <Text className="text-gray-900 font-mono">{instalacao.login}</Text>
                </View>
              )}

              <View className="border-t border-gray-100 pt-3">
                <Text className="text-gray-500 text-xs mb-1">Comodato</Text>
                <Text className="text-gray-900">{instalacao.comodato === 'sim' ? 'Sim' : 'Não'}</Text>
              </View>

              {instalacao.equipamento && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Equipamento</Text>
                  <Text className="text-gray-900">{instalacao.equipamento}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Técnico e Agendamento */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-3">Técnico e Agendamento</Text>
            
            <View className="gap-3">
              <View>
                <Text className="text-gray-500 text-xs mb-1">Técnico Responsável</Text>
                <Text className="text-gray-900 font-semibold">
                  {instalacao.tecnico || 'Não atribuído'}
                </Text>
              </View>

              {instalacao.visita && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Visita Agendada</Text>
                  <Text className="text-gray-900 font-medium">{formatarDataCompleta(instalacao.visita)}</Text>
                </View>
              )}

              <View className="border-t border-gray-100 pt-3">
                <Text className="text-gray-500 text-xs mb-1">Visitado</Text>
                <Text className="text-gray-900">{instalacao.visitado === 'sim' ? 'Sim' : 'Não'}</Text>
              </View>

              {instalacao.datainst && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Data da Instalação</Text>
                  <Text className="text-gray-900">{formatarDataCompleta(instalacao.datainst)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Informações Técnicas */}
          {(instalacao.ip || instalacao.mac || instalacao.coordenadas) && (
            <View className="bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-lg font-bold text-gray-900 mb-3">Informações Técnicas</Text>
              
              <View className="gap-3">
                {instalacao.ip && (
                  <View>
                    <Text className="text-gray-500 text-xs mb-1">IP</Text>
                    <Text className="text-gray-900 font-mono">{instalacao.ip}</Text>
                  </View>
                )}

                {instalacao.mac && (
                  <View className="border-t border-gray-100 pt-3">
                    <Text className="text-gray-500 text-xs mb-1">MAC Address</Text>
                    <Text className="text-gray-900 font-mono">{instalacao.mac}</Text>
                  </View>
                )}

                {instalacao.coordenadas && (
                  <View className="border-t border-gray-100 pt-3">
                    <Text className="text-gray-500 text-xs mb-1">Coordenadas GPS</Text>
                    <Text className="text-gray-900 font-mono">{instalacao.coordenadas}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Datas */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-3">Datas</Text>
            
            <View className="gap-3">
              <View>
                <Text className="text-gray-500 text-xs mb-1">Data de Processamento</Text>
                <Text className="text-gray-900">{formatarDataCompleta(instalacao.processamento)}</Text>
              </View>

              {instalacao.data_feito && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Concluído em</Text>
                  <Text className="text-gray-900">{formatarDataCompleta(instalacao.data_feito)}</Text>
                </View>
              )}

              {instalacao.nome_feito && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Concluído por</Text>
                  <Text className="text-gray-900">{instalacao.nome_feito}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Observações */}
          {instalacao.obs && (
            <View className="bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-lg font-bold text-gray-900 mb-3">Observações</Text>
              <Text className="text-gray-800 leading-5">{instalacao.obs}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}
