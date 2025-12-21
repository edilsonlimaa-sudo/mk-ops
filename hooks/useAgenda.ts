import { fetchAgenda, ServicoAgenda } from '@/services/api/agenda.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Query key factory for agenda
 */
export const agendaQueryKeys = {
  all: ['agenda'] as const,
};

/**
 * Hook to fetch and cache unified agenda (chamados + instalacoes)
 * 
 * Features:
 * - Automatic caching in memory
 * - 5min stale time (agenda changes frequently)
 * - Manual refetch available via refetch()
 * - Loading and error states
 * - Returns chamados and instalacoes sorted by visita date
 * 
 * @returns React Query result with unified agenda data
 */
export const useAgenda = () => {
  return useQuery<ServicoAgenda[], Error>({
    queryKey: agendaQueryKeys.all,
    queryFn: () => fetchAgenda(),
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
      queryClient.invalidateQueries({ queryKey: agendaQueryKeys.all }),
    refetch: () =>
      queryClient.refetchQueries({ queryKey: agendaQueryKeys.all }),
    clear: () =>
      queryClient.removeQueries({ queryKey: agendaQueryKeys.all }),
  };
};
