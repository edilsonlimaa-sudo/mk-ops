import { listarTodosClientes } from '@/services/api/cliente.service';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export const useClientes = () => {
  const [loadedClientes, setLoadedClientes] = useState(0);

  // Carrega todos os clientes de uma vez
  const clientesQuery = useQuery({
    queryKey: ['clientes', 'all'],
    queryFn: () => listarTodosClientes(
      500,
      (loaded, total) => setLoadedClientes(loaded)
    ),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    allClientes: clientesQuery.data?.clientes ?? [],
    totalClientes: clientesQuery.data?.total ?? 0,
    loadedClientes: loadedClientes,
    isLoadingAll: clientesQuery.isFetching,
    isLoading: clientesQuery.isLoading,
    isError: clientesQuery.isError,
    error: clientesQuery.error,
    refetch: clientesQuery.refetch,
    isRefetching: clientesQuery.isRefetching,
  };
};
