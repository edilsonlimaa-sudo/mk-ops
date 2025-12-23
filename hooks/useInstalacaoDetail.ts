import { isInstalacao, ServicoAgenda } from '@/services/api/agenda.service';
import { fetchInstalacaoById } from '@/services/api/instalacao.service';
import { Instalacao } from '@/types/instalacao';
import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to fetch a single instalacao by UUID
 * Uses initialData from active caches for instant navigation
 * Searches in:
 * - ['historico'] - Histórico unificado (chamados + instalações concluídas)
 * - ['agenda'] - Aba Agenda (chamados + instalações)
 * Falls back to API call if not found in cache (deep links, refreshes)
 */
export const useInstalacaoDetail = (uuid: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['instalacao', uuid],
    queryFn: () => fetchInstalacaoById(uuid),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    initialData: () => {
      // 1. Check historico cache (if it exists - chamados fechados + instalações concluídas)
      const historicoItems = queryClient.getQueryData<ServicoAgenda[]>(['historico']);
      if (historicoItems) {
        const instalacaoHistorico = historicoItems.find((item): item is Instalacao => 
          isInstalacao(item) && item.uuid_solic === uuid
        );
        
        if (instalacaoHistorico) {
          console.log(`⚡ [useInstalacaoDetail] Cache hit! Found instalacao #${instalacaoHistorico.id} in historico cache`);
          return instalacaoHistorico;
        }
      }
      
      // 2. Check agenda cache (aba Agenda - contains both chamados and instalacoes)
      const agendaItems = queryClient.getQueryData<ServicoAgenda[]>(['agenda']);
      if (agendaItems) {
        const instalacaoAgenda = agendaItems.find((item): item is Instalacao => 
          isInstalacao(item) && item.uuid_solic === uuid
        );
        
        if (instalacaoAgenda) {
          console.log(`⚡ [useInstalacaoDetail] Cache hit! Found instalacao #${instalacaoAgenda.id} in agenda cache`);
          return instalacaoAgenda;
        }
      }
      
      console.log(`⚠️ [useInstalacaoDetail] Cache miss for uuid ${uuid}, will fetch from API`);
      return undefined;
    },
    // Force revalidation even with initialData (to fetch any additional fields from detail endpoint)
    initialDataUpdatedAt: 0,
    retry: 1,
  });
};
