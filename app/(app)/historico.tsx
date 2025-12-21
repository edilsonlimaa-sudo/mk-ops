import { Chamado } from '@/types/chamado';
import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FiltroFechado = 'hoje' | 'ontem' | 'ultimos_7_dias';

export default function HistoricoScreen() {
  const [filtroFechado, setFiltroFechado] = useState<FiltroFechado>('hoje');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data para chamados fechados (temporário - depois integramos com o service)
  const chamadosFechados: Chamado[] = [
    { 
      id: '1', uuid_suporte: 'mock-1', uuid: 'mock-1',
      chamado: '12345', nome: 'João Silva', ramal: null, 
      assunto: 'Instalação concluída', fechamento: '2025-12-20 14:30:00', 
      motivo_fechar: 'Serviço executado', prioridade: 'alta', 
      atendente: 'Carlos Tech', abertura: '2025-12-20 08:00:00', 
      visita: null, email: 'joao@email.com', status: 'fechado',
      login: '12345678900', reply: '', tecnico: null, login_atend: null
    },
    { 
      id: '2', uuid_suporte: 'mock-2', uuid: 'mock-2',
      chamado: '12346', nome: 'Maria Santos', ramal: 'Ramal 101', 
      assunto: 'Manutenção preventiva', fechamento: '2025-12-20 11:15:00', 
      motivo_fechar: 'Concluído', prioridade: 'media', 
      atendente: 'Ana Silva', abertura: '2025-12-20 07:00:00', 
      visita: null, email: 'maria@email.com', status: 'fechado',
      login: '98765432100', reply: '', tecnico: null, login_atend: null
    },
    { 
      id: '3', uuid_suporte: 'mock-3', uuid: 'mock-3',
      chamado: '12347', nome: 'Pedro Costa', ramal: null, 
      assunto: 'Troca de equipamento', fechamento: '2025-12-19 16:45:00', 
      motivo_fechar: 'Equipamento substituído', prioridade: 'alta', 
      atendente: 'Carlos Tech', abertura: '2025-12-19 09:00:00', 
      visita: null, email: 'pedro@email.com', status: 'fechado',
      login: '11122233344', reply: '', tecnico: null, login_atend: null
    },
  ];

  const filtros = [
    { key: 'hoje' as const, label: 'Hoje', emoji: '📅', count: chamadosFechados.length },
    { key: 'ontem' as const, label: 'Ontem', emoji: '🕐', count: 0 },
    { key: 'ultimos_7_dias' as const, label: 'Últimos 7 dias', emoji: '📆', count: 0 },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Aqui virá a lógica de refresh quando integrar com o service
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatarDataHora = (dataStr: string | null) => {
    if (!dataStr) return null;
    
    try {
      const data = new Date(dataStr.replace(' ', 'T'));
      if (isNaN(data.getTime())) return null;
      
      const dataFormatada = data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
      const horaFormatada = data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      
      return { data: dataFormatada, hora: horaFormatada, completo: `${dataFormatada} às ${horaFormatada}` };
    } catch {
      return null;
    }
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
        {/* Header */}
        <View className="bg-white px-4 py-4 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900 mb-1">Histórico</Text>
          <Text className="text-gray-500 text-sm mb-3">
            {chamadosFechados.length} chamados concluídos
          </Text>

          {/* Filtros */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {filtros.map((filtro) => (
              <TouchableOpacity
                key={filtro.key}
                onPress={() => setFiltroFechado(filtro.key)}
                className={`flex-row items-center px-3 py-2 rounded-full ${
                  filtroFechado === filtro.key ? 'bg-green-600' : 'bg-gray-100'
                }`}
              >
                <Text className="text-sm mr-1">{filtro.emoji}</Text>
                <Text
                  className={`text-sm font-semibold ${
                    filtroFechado === filtro.key ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {filtro.label}
                </Text>
                {filtro.count > 0 && (
                  <View
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full ${
                      filtroFechado === filtro.key ? 'bg-white/30' : 'bg-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        filtroFechado === filtro.key ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {filtro.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Lista */}
        <FlatList
          data={chamadosFechados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View className="justify-center items-center py-12">
              <Text className="text-gray-500 text-center">
                Nenhum chamado concluído encontrado
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const dataFechamento = item.fechamento ? formatarDataHora(item.fechamento) : null;

            return (
              <View className="bg-white rounded-lg p-3 mb-2 shadow-sm border-l-4 border-green-500">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-2">
                  <View
                    className={`px-2 py-0.5 rounded ${
                      item.prioridade === 'alta'
                        ? 'bg-red-500'
                        : item.prioridade === 'media'
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                  >
                    <Text className="text-xs font-bold text-white">
                      {item.prioridade?.toUpperCase() || 'NORMAL'}
                    </Text>
                  </View>
                  <Text className="text-xs font-mono text-gray-500">
                    #{item.chamado}
                  </Text>
                </View>

                {/* Cliente */}
                <View className="mb-2">
                  <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                    {item.nome || 'Cliente não identificado'}
                  </Text>
                  {item.ramal && (
                    <Text className="text-xs text-gray-500" numberOfLines={1}>
                      {item.ramal}
                    </Text>
                  )}
                </View>

                {/* Assunto */}
                <Text className="text-sm text-gray-700 mb-2" numberOfLines={2}>
                  {item.assunto || 'Sem assunto'}
                </Text>

                {/* Motivo fechamento */}
                {item.motivo_fechar && (
                  <View className="bg-green-50 px-2 py-1 rounded mb-2">
                    <Text className="text-xs text-green-700">
                      ✓ {item.motivo_fechar}
                    </Text>
                  </View>
                )}

                {/* Footer */}
                <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
                  <Text className="text-xs text-gray-500">
                    Fechado: {dataFechamento?.completo || 'Data não disponível'}
                  </Text>
                  <Text className="text-xs text-gray-600" numberOfLines={1}>
                    {item.atendente || 'Não atribuído'}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      </SafeAreaView>
    </View>
  );
}
