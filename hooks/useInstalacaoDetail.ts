import { isInstalacao, ServicoAgenda } from '@/services/api/agenda.service';
import { fetchInstalacaoById } from '@/services/api/instalacao.service';
import { Instalacao } from '@/types/instalacao';
import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to fetch a single instalacao by UUID
 * Uses initialData from historico cache for instant navigation
 * Searches in:
 * - ['historico'] - Histórico unificado (only completed instalações)
 * Falls back to API call if not found in cache (deep links, refreshes)
 * Note: Does not search agenda cache since agenda only contains open instalações
 */
export const useInstalacaoDetail = (uuid: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['instalacao', uuid],
    queryFn: () => fetchInstalacaoById(uuid),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    initialData: () => {
      // Check historico cache (aba Histórico - completed instalações only)
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
      
      console.log(`⚠️ [useInstalacaoDetail] Cache miss for uuid ${uuid}, will fetch from API`);
      return undefined;
    },
    // Force revalidation even with initialData (to fetch any additional fields from detail endpoint)
    initialDataUpdatedAt: 0,
    retry: 1,
  });
};
