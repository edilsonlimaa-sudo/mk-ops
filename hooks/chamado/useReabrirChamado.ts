import { ServicoAgenda } from '@/services/api/agenda';
import { reabrirChamado } from '@/services/api/chamado/chamado.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agendaKeys } from '../agenda/keys';
import { historicoKeys } from '../historico/keys';
import { chamadoKeys } from './keys';

/**
 * Hook para reabrir um chamado fechado
 * OTIMIZADO: Move item entre caches programaticamente (zero refetch)
 */
export const useReabrirChamado = () => {
  const queryClient = useQueryClient();
  
  // 🎭 Mock mode - desabilite para usar a API real
  const MOCK_MODE = false;

  return useMutation({
    mutationFn: async (numeroChamado: string) => {
      if (MOCK_MODE) {
        console.log(`🎭 [MOCK] Simulando reabertura do chamado ${numeroChamado}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`✅ [MOCK] Chamado ${numeroChamado} reaberto com sucesso`);
        return { chamado: numeroChamado, status: 'aberto' };
      }

      return reabrirChamado(numeroChamado);
    },
    
    onSuccess: (result, numeroChamado) => {
      console.log(`🚀 [useReabrirChamado] Aplicando updates programáticos para chamado ${numeroChamado}`);
      
      try {
        // 1. REMOVE do HISTÓRICO cache
        const historicoData = queryClient.getQueryData<ServicoAgenda[]>(historicoKeys.all);
        if (historicoData) {
          const chamadoParaReabrir = historicoData.find(item =>
            'chamado' in item && item.chamado === numeroChamado
          );

          if (chamadoParaReabrir) {
            console.log(`📋 Removendo chamado ${numeroChamado} do histórico`);
            const historicoAtualizado = historicoData.filter(item =>
              !('chamado' in item && item.chamado === numeroChamado)
            );
            queryClient.setQueryData<ServicoAgenda[]>(historicoKeys.all, historicoAtualizado);

            // 2. ADICIONA na AGENDA cache
            console.log(`📅 Adicionando chamado ${numeroChamado} na agenda`);
            const agendaData = queryClient.getQueryData<ServicoAgenda[]>(agendaKeys.all) || [];
            
            // 🔧 FIX: Usar dados do detail cache (que tem updates mais recentes)
            const uuid = 'uuid_suporte' in chamadoParaReabrir ? chamadoParaReabrir.uuid_suporte : '';
            const detailKey = chamadoKeys.detail(uuid);
            const detailData = queryClient.getQueryData(detailKey);
            
            const chamadoReaberto = {
              ...chamadoParaReabrir,
              // Merge com dados atualizados do detail se disponível
              ...(detailData ? detailData : {}),
              status: 'aberto',
              fechamento: null,
              motivo_fechar: null,
              // Merge com dados retornados pela API se disponíveis
              ...(result && typeof result === 'object' ? result : {}),
            };

            const agendaAtualizada = [chamadoReaberto, ...agendaData];
            queryClient.setQueryData<ServicoAgenda[]>(agendaKeys.all, agendaAtualizada);

            // 3. ATUALIZA cache de DETALHES se existir  
            if (detailData) {
              console.log(`🔍 Atualizando cache de detalhes para chamado ${numeroChamado}`);
              queryClient.setQueryData(detailKey, {
                ...detailData,
                status: 'aberto',
                fechamento: null,
                motivo_fechar: null,
                ...(result && typeof result === 'object' ? result : {}),
              });
            }

            console.log(`✅ [useReabrirChamado] Updates programáticos concluídos - ZERO refetch!`);
          } else {
            console.warn(`⚠️ Chamado ${numeroChamado} não encontrado no histórico cache`);
          }
        } else {
          console.warn(`⚠️ Histórico cache vazio ou não disponível`);
        }
      } catch (error) {
        console.error(`❌ [useReabrirChamado] Erro nos updates programáticos:`, error);

        // 🚨 FALLBACK: Se algo der errado, volta pro método antigo
        console.log(`🔄 Aplicando fallback - invalidação tradicional`);
        queryClient.invalidateQueries({ queryKey: historicoKeys.all });
        queryClient.invalidateQueries({ queryKey: agendaKeys.all });
        queryClient.invalidateQueries({ queryKey: chamadoKeys.all });
      }
    },
    
    onError: (error, numeroChamado) => {
      console.error(`❌ [useReabrirChamado] Erro ao reabrir chamado ${numeroChamado}:`, error);
    },
  });
};
