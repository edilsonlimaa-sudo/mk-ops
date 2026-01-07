import { fetchAgendaCompleta, ServicoAgenda } from '@/services/api/agenda';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { agendaKeys } from './keys';

/**
 * Hook to fetch and cache unified agenda (chamados + instalacoes)
 * Includes both open AND closed items for a complete timeline view
 * 
 * Features:
 * - Automatic caching in memory
 * - 5min stale time (agenda changes frequently)
 * - Manual refetch available via refetch()
 * - Loading and error states
 * - Returns all chamados and instalacoes sorted by visita date
 * 
 * @returns React Query result with unified agenda data
 */
export const useAgenda = () => {
  return useQuery<ServicoAgenda[], Error>({
    queryKey: agendaKeys.all,
    queryFn: () => fetchAgendaCompleta(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (memory only)
    persister: undefined, // Disable persistence
  });
};

/**
 * Hook to manually invalidate and refetch agenda
 * Useful for pull-to-refresh or after closing a chamado/instalacao
 */
export const useInvalidateAgenda = () => {
  const queryClient = useQueryClient();

  return {
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: agendaKeys.all }),
    refetch: () =>
      queryClient.refetchQueries({ queryKey: agendaKeys.all }),
    clear: () =>
      queryClient.removeQueries({ queryKey: agendaKeys.all }),
  };
};
