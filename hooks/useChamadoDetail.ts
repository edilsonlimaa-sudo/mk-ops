import { isChamado, ServicoAgenda } from '@/services/api/agenda.service';
import { fetchChamadoById } from '@/services/api/chamado.service';
import { Chamado } from '@/types/chamado';
import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to fetch a single chamado by UUID
 * Uses initialData from historico cache for instant navigation
 * Searches in:
 * - ['historico'] - Histórico unificado (only closed chamados)
 * Falls back to API call if not found in cache (deep links, refreshes)
 * Note: Does not search agenda cache since agenda only contains open chamados
 */
export const useChamadoDetail = (uuid: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['chamado', uuid],
    queryFn: () => fetchChamadoById(uuid),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    initialData: () => {
      // Check historico cache (aba Histórico - closed chamados only)
      const historicoItems = queryClient.getQueryData<ServicoAgenda[]>(['historico']);
      if (historicoItems) {
        const chamadoHistorico = historicoItems.find((item): item is Chamado => 
          isChamado(item) && item.uuid_suporte === uuid
        );
        
        if (chamadoHistorico) {
          console.log(`⚡ [useChamadoDetail] Cache hit! Found chamado #${chamadoHistorico.chamado} in historico cache`);
          return chamadoHistorico;
        }
      }
      
      console.log(`⚠️ [useChamadoDetail] Cache miss for uuid ${uuid}, will fetch from API`);
      return undefined;
    },
    // Force revalidation even with initialData (to fetch relatos from API)
    initialDataUpdatedAt: 0,
    retry: 1,
  });
};
