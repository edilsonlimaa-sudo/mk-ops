import { fetchAllChamados } from '@/services/api/chamado.service';
import { Chamado, ChamadoStatus } from '@/types/chamado';
import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Query key factory for chamados
 */
export const chamadosQueryKeys = {
  all: ['chamados'] as const,
  lists: () => [...chamadosQueryKeys.all, 'list'] as const,
  list: (status: ChamadoStatus) => [...chamadosQueryKeys.lists(), status] as const,
};

/**
 * Hook to fetch and cache chamados filtered by status
 * 
 * Features:
 * - Automatic caching in memory
 * - 5min stale time (data stays fresh for 5 minutes)
 * - Manual refetch available via refetch()
 * - Loading and error states
 * - Filter by status: 'aberto', 'fechado', or 'todos'
 * 
 * @param status - Filter chamados by status (default: 'aberto')
 * @returns React Query result with chamados data
 */
export const useChamados = (status: ChamadoStatus = 'aberto') => {
  return useQuery<Chamado[], Error>({
    queryKey: chamadosQueryKeys.list(status),
    queryFn: () => fetchAllChamados(status),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (memory only)
    persister: undefined, // Disable persistence
  });
};

/**
 * Hook to manually invalidate and refetch chamados
 * Useful for pull-to-refresh or after mutations
 */
export const useInvalidateChamados = () => {
  const queryClient = useQueryClient();

  return {
    invalidate: (status?: ChamadoStatus) =>
      status
        ? queryClient.invalidateQueries({ queryKey: chamadosQueryKeys.list(status) })
        : queryClient.invalidateQueries({ queryKey: chamadosQueryKeys.all }),
    refetch: (status?: ChamadoStatus) =>
      status
        ? queryClient.refetchQueries({ queryKey: chamadosQueryKeys.list(status) })
        : queryClient.refetchQueries({ queryKey: chamadosQueryKeys.all }),
    clear: (status?: ChamadoStatus) =>
      status
        ? queryClient.removeQueries({ queryKey: chamadosQueryKeys.list(status) })
        : queryClient.removeQueries({ queryKey: chamadosQueryKeys.all }),
  };
};
