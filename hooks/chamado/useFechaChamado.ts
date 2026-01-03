import { ServicoAgenda } from '@/services/api/agenda';
import { fecharChamado } from '@/services/api/chamado';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agendaKeys } from '../agenda/keys';
import { historicoKeys } from '../historico/keys';
import { chamadoKeys } from './keys';

// 🎭 MOCK MODE - Ative para testar sem chamar API
const MOCK_MODE = true;

/**
 * Hook para fechar um chamado aberto
 * OTIMIZADO: Move item entre caches programaticamente (zero refetch)
 */
export const useFechaChamado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ numeroChamado, motivo }: { numeroChamado: string; motivo: string }) => {
      if (MOCK_MODE) {
        // 🎭 Mock: simula fechamento sem chamar API
        console.log(`🎭 [MOCK] Simulando fechamento do chamado ${numeroChamado}`);
        console.log(`🎭 [MOCK] Motivo: ${motivo}`);
        
        // Simula latência de rede (500ms)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log(`✅ [MOCK] Chamado ${numeroChamado} fechado com sucesso (simulado)`);
        return { chamado: numeroChamado, status: 'fechado', motivo_fechar: motivo };
      }
      
      // Modo real: chama API
      return fecharChamado(numeroChamado, motivo);
    },
    onSuccess: (result, { numeroChamado, motivo }) => {
      console.log(`🚀 [useFechaChamado] Aplicando updates programáticos para chamado ${numeroChamado}`);

      try {
        // 1. REMOVE da AGENDA cache
        const agendaData = queryClient.getQueryData<ServicoAgenda[]>(agendaKeys.all);
        if (agendaData) {
          const chamadoParaFechar = agendaData.find(item =>
            'chamado' in item && item.chamado === numeroChamado
          );

          if (chamadoParaFechar) {
            console.log(`📋 Removendo chamado ${numeroChamado} da agenda`);
            const agendaAtualizada = agendaData.filter(item =>
              !('chamado' in item && item.chamado === numeroChamado)
            );
            queryClient.setQueryData<ServicoAgenda[]>(agendaKeys.all, agendaAtualizada);

            // 2. ADICIONA no HISTÓRICO cache
            console.log(`📚 Adicionando chamado ${numeroChamado} no histórico`);
            const historicoData = queryClient.getQueryData<ServicoAgenda[]>(historicoKeys.all) || [];
            
            // 🔧 FIX: Usar dados do detail cache (que tem updates mais recentes)
            const uuid = 'uuid_suporte' in chamadoParaFechar ? chamadoParaFechar.uuid_suporte : '';
            const detailKey = chamadoKeys.detail(uuid);
            const detailData = queryClient.getQueryData(detailKey);
            
            const chamadoFechado = {
              ...chamadoParaFechar,
              // Merge com dados atualizados do detail se disponível
              ...(detailData ? detailData : {}),
              status: 'fechado',
              fechamento: new Date().toISOString().replace('T', ' ').substring(0, 19),
              motivo_fechar: motivo,
              // Merge com dados retornados pela API se disponíveis
              ...(result && typeof result === 'object' ? result : {}),
            };

            const historicoAtualizado = [chamadoFechado, ...historicoData];
            queryClient.setQueryData<ServicoAgenda[]>(historicoKeys.all, historicoAtualizado);

            // 3. ATUALIZA cache de DETALHES se existir  
            if (detailData) {
              console.log(`🔍 Atualizando cache de detalhes para chamado ${numeroChamado}`);
              queryClient.setQueryData(detailKey, {
                ...detailData,
                status: 'fechado',
                fechamento: new Date().toISOString().replace('T', ' ').substring(0, 19),
                motivo_fechar: motivo,
                ...(result && typeof result === 'object' ? result : {}),
              });
            }

            console.log(`✅ [useFechaChamado] Updates programáticos concluídos - ZERO refetch!`);
          } else {
            console.warn(`⚠️ Chamado ${numeroChamado} não encontrado na agenda cache`);
          }
        } else {
          console.warn(`⚠️ Agenda cache vazio ou não disponível`);
        }
      } catch (error) {
        console.error(`❌ [useFechaChamado] Erro nos updates programáticos:`, error);

        // 🚨 FALLBACK: Se algo der errado, volta pro método antigo
        console.log(`🔄 Aplicando fallback - invalidação tradicional`);
        queryClient.invalidateQueries({ queryKey: agendaKeys.all });
        queryClient.invalidateQueries({ queryKey: historicoKeys.all });
        queryClient.invalidateQueries({ queryKey: chamadoKeys.all });
      }
    },
    onError: (error) => {
      console.error('❌ [useFechaChamado] Erro ao fechar chamado:', error);
    },
  });
};
