import { useChamadoDetail } from '@/hooks/useChamadoDetail';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

export default function ChamadoDetalhesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  if (!id) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">ID do chamado não fornecido</Text>
      </View>
    );
  }

  const { data: chamado, isLoading, error } = useChamadoDetail(id);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#0284c7" />
        <Text className="mt-4 text-gray-600">Carregando chamado...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-4">
        <Text className="text-red-600 text-lg font-semibold mb-2">Erro ao carregar chamado</Text>
        <Text className="text-gray-600 text-center">
          {error instanceof Error ? error.message : 'Erro desconhecido'}
        </Text>
      </View>
    );
  }

  if (!chamado) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Chamado não encontrado</Text>
      </View>
    );
  }

  const statusColor = chamado.status === 'Aberto' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  const prioridadeColor = 
    chamado.prioridade === 'Alta' ? 'bg-red-100 text-red-800' :
    chamado.prioridade === 'Média' ? 'bg-yellow-100 text-yellow-800' :
    'bg-blue-100 text-blue-800';

  return (
    <>
      <Stack.Screen
        options={{
          title: `Chamado #${chamado.chamado}`,
          headerBackTitle: 'Voltar',
        }}
      />
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-4 gap-4">
          {/* Status e Prioridade */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-500 text-xs mb-1">Status</Text>
                <View className={`${statusColor} px-3 py-1 rounded-full self-start`}>
                  <Text className={`${statusColor.split(' ')[1]} font-semibold text-sm`}>
                    {chamado.status}
                  </Text>
                </View>
              </View>
              <View>
                <Text className="text-gray-500 text-xs mb-1 text-right">Prioridade</Text>
                <View className={`${prioridadeColor} px-3 py-1 rounded-full`}>
                  <Text className={`${prioridadeColor.split(' ')[1]} font-semibold text-sm`}>
                    {chamado.prioridade}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Informações do Chamado */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-3">Informações do Chamado</Text>
            
            <View className="gap-3">
              <View>
                <Text className="text-gray-500 text-xs mb-1">Número do Chamado</Text>
                <Text className="text-gray-900 font-semibold">#{chamado.chamado}</Text>
              </View>

              <View className="border-t border-gray-100 pt-3">
                <Text className="text-gray-500 text-xs mb-1">Assunto</Text>
                <Text className="text-gray-900 font-medium">{chamado.assunto || 'Não informado'}</Text>
              </View>

              {chamado.reply && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Problema Reportado</Text>
                  <Text className="text-gray-900">{chamado.reply}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Informações do Cliente */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-3">Cliente</Text>
            
            <View className="gap-3">
              <View>
                <Text className="text-gray-500 text-xs mb-1">Nome</Text>
                <Text className="text-gray-900 font-semibold">{chamado.nome || 'Não informado'}</Text>
              </View>

              {chamado.login && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Login/CPF</Text>
                  <Text className="text-gray-900">{chamado.login}</Text>
                </View>
              )}

              {chamado.email && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">E-mail</Text>
                  <Text className="text-gray-900">{chamado.email}</Text>
                </View>
              )}

              {chamado.ramal && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Ramal</Text>
                  <Text className="text-gray-900">{chamado.ramal}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Atendimento */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-3">Atendimento</Text>
            
            <View className="gap-3">
              <View>
                <Text className="text-gray-500 text-xs mb-1">Atendente Responsável</Text>
                <Text className="text-gray-900 font-semibold">
                  {chamado.atendente || 'Não atribuído'}
                </Text>
              </View>

              {chamado.tecnico && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">ID do Técnico</Text>
                  <Text className="text-gray-900">{chamado.tecnico}</Text>
                </View>
              )}

              {chamado.visita && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Visita Agendada</Text>
                  <Text className="text-gray-900 font-medium">{chamado.visita}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Datas */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-3">Datas</Text>
            
            <View className="gap-3">
              <View>
                <Text className="text-gray-500 text-xs mb-1">Data de Abertura</Text>
                <Text className="text-gray-900">{chamado.abertura}</Text>
              </View>

              {chamado.fechamento && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Data de Fechamento</Text>
                  <Text className="text-gray-900">{chamado.fechamento}</Text>
                </View>
              )}

              {chamado.motivo_fechar && (
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-xs mb-1">Motivo do Fechamento</Text>
                  <Text className="text-gray-900">{chamado.motivo_fechar}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
