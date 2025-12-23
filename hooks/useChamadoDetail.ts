import { isChamado, ServicoAgenda } from '@/services/api/agenda.service';
import { fetchChamadoById } from '@/services/api/chamado.service';
import { Chamado } from '@/types/chamado';
import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to fetch a single chamado by UUID
 * Uses initialData from active caches for instant navigation
 * Searches in:
 * - ['chamados', 'fechados'] - Aba Histórico  
 * - ['agenda'] - Aba Agenda (chamados + instalações)
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
      // 1. Check chamados fechados cache (aba Histórico)
      const chamadosFechados = queryClient.getQueryData<Chamado[]>(['chamados', 'fechados']);
      const chamadoFechado = chamadosFechados?.find((c) => c.uuid_suporte === uuid);
      if (chamadoFechado) {
        console.log(`⚡ [useChamadoDetail] Cache hit! Found chamado #${chamadoFechado.chamado} in histórico cache`);
        return chamadoFechado;
      }
      
      // 2. Check agenda cache (aba Agenda - contains both chamados and instalacoes)
      const agendaItems = queryClient.getQueryData<ServicoAgenda[]>(['agenda']);
      if (agendaItems) {
        const chamadoAgenda = agendaItems.find((item): item is Chamado => 
          isChamado(item) && item.uuid_suporte === uuid
        );
        
        if (chamadoAgenda) {
          console.log(`⚡ [useChamadoDetail] Cache hit! Found chamado #${chamadoAgenda.chamado} in agenda cache`);
          return chamadoAgenda;
        }
      }
      
      console.log(`⚠️ [useChamadoDetail] Cache miss for uuid ${uuid}, will fetch from API`);
      return undefined;
    },
    retry: 1,
  });
};
