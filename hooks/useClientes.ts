import { listarClientes } from '@/services/api/cliente.service';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

export const useClientes = () => {
  const queryClient = useQueryClient();
  
  // 1. Busca primeira página para descobrir total
  const firstPageQuery = useQuery({
    queryKey: ['clientes', 1],
    queryFn: () => listarClientes(1, 500),
    staleTime: 1000 * 60 * 5,
  });

  const totalPages = firstPageQuery.data?.total_paginas ?? 1;

  // 2. Busca páginas restantes em paralelo (cada uma com cache próprio)
  const remainingPagesQueries = useQueries({
    queries: Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
      queryKey: ['clientes', i + 2],
      queryFn: () => listarClientes(i + 2, 500),
      staleTime: 1000 * 60 * 5,
      enabled: !!firstPageQuery.data && totalPages > 1,
    })),
  });

  // 3. Verifica se alguma página 2+ falhou
  const isErrorInRemainingPages = remainingPagesQueries.some(q => q.isError);
  const firstRemainingError = remainingPagesQueries.find(q => q.isError)?.error;

  // 4. Combina todos os resultados (só se TODAS tiverem sucesso)
  const allClientes = useMemo(() => {
    if (!firstPageQuery.data) return [];
    
    // Se alguma página 2+ falhou, não retorna dados parciais
    if (isErrorInRemainingPages) return [];
    
    // Verifica se todas as páginas terminaram de carregar
    const allPagesLoaded = remainingPagesQueries.every(q => q.data);
    if (!allPagesLoaded && remainingPagesQueries.length > 0) return [];
    
    const remainingClientes = remainingPagesQueries
      .filter(q => q.data)
      .flatMap(q => q.data!.clientes || []);
    
    return [
      ...firstPageQuery.data.clientes,
      ...remainingClientes,
    ];
  }, [firstPageQuery.data, remainingPagesQueries, isErrorInRemainingPages]);

  // 5. Estados de loading
  const isLoadingRemainingPages = remainingPagesQueries.some(q => q.isLoading);
  const isRefetchingRemainingPages = remainingPagesQueries.some(q => q.isRefetching);

  return {
    allClientes,
    totalClientes: firstPageQuery.data?.total_registros ?? 0,
    loadedClientes: allClientes.length,
    isLoadingAll: isLoadingRemainingPages,
    isLoading: firstPageQuery.isLoading || isLoadingRemainingPages,
    isError: firstPageQuery.isError || isErrorInRemainingPages,
    error: firstPageQuery.error || firstRemainingError,
    refetch: async () => {
      // Pull-to-refresh ou retry em sucesso: recarrega TODAS
      await firstPageQuery.refetch();
      await Promise.all(remainingPagesQueries.map(q => q.refetch()));
    },
    retryFailed: async () => {
      // Retry seletivo: apenas queries com erro
      const refetchPromises = [];
      
      if (firstPageQuery.isError) {
        refetchPromises.push(firstPageQuery.refetch());
      }
      
      remainingPagesQueries.forEach(q => {
        if (q.isError) {
          refetchPromises.push(q.refetch());
        }
      });
      
      await Promise.all(refetchPromises);
    },
    isRefetching: firstPageQuery.isRefetching || isRefetchingRemainingPages,
  };
};
