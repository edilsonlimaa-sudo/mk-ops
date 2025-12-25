import { isChamado, ServicoAgenda } from '@/services/api/agenda.service';
import { fetchChamadoById } from '@/services/api/chamado.service';
import { Chamado } from '@/types/chamado';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { agendaQueryKeys } from './useAgenda';
import { historicoQueryKeys } from './useHistorico';

/**
 * Hook to fetch a single chamado by UUID
 * Uses initialData from cache for instant navigation
 * Searches in:
 * 1. ['agenda'] - Agenda unificada (chamados + instalações)
 * 2. ['historico'] - Histórico unificado (closed chamados)
 * Falls back to API call if not found in cache (deep links, refreshes)
 */
export const useChamadoDetail = (uuid: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['chamado', uuid],
    queryFn: () => fetchChamadoById(uuid),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    initialData: () => {
      // 1. Check agenda cache (chamados + instalações)
      const agendaItems = queryClient.getQueryData<ServicoAgenda[]>(agendaQueryKeys.all);
      if (agendaItems) {
        const chamadoAgenda = agendaItems.find((item): item is Chamado => 
          isChamado(item) && item.uuid_suporte === uuid
        );
        if (chamadoAgenda) {
          console.log(`⚡ [useChamadoDetail] Cache hit! Found chamado #${chamadoAgenda.chamado} in agenda cache`);
          return chamadoAgenda;
        }
      }

      // 2. Check historico cache (closed chamados)
      const historicoItems = queryClient.getQueryData<ServicoAgenda[]>(historicoQueryKeys.all);
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
