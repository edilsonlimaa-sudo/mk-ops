import { isInstalacao, ServicoAgenda } from '@/services/api/agenda.service';
import { fetchInstalacaoById } from '@/services/api/instalacao.service';
import { Instalacao } from '@/types/instalacao';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { agendaKeys } from '../agenda/keys';
import { historicoKeys } from '../historico/keys';
import { instalacaoKeys } from './keys';

/**
 * Hook to fetch a single instalacao by UUID
 * Uses initialData from cache for instant navigation
 * Searches in:
 * 1. ['agenda'] - Agenda unificada (open instalações)
 * 2. ['historico'] - Histórico unificado (completed instalações)
 * Falls back to API call if not found in cache (deep links, refreshes)
 */
export const useInstalacaoDetail = (uuid: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: instalacaoKeys.detail(uuid),
    queryFn: () => fetchInstalacaoById(uuid),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    initialData: () => {
      // 1. Check agenda cache (open instalações)
      const agendaItems = queryClient.getQueryData<ServicoAgenda[]>(agendaKeys.all);
      if (agendaItems) {
        const instalacaoAgenda = agendaItems.find((item): item is Instalacao => 
          isInstalacao(item) && item.uuid_solic === uuid
        );
        if (instalacaoAgenda) {
          console.log(`⚡ [useInstalacaoDetail] Cache hit! Found instalacao #${instalacaoAgenda.id} in agenda cache`);
          return instalacaoAgenda;
        }
      }

      // 2. Check historico cache (completed instalações)
      const historicoItems = queryClient.getQueryData<ServicoAgenda[]>(historicoKeys.all);
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
