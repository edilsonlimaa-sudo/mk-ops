import type { Cliente } from '@/services/api/cliente.service';
import { listarClientes } from '@/services/api/cliente.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';

export const useClientes = () => {
  const queryClient = useQueryClient();
  const [allPagesData, setAllPagesData] = useState<Cliente[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const hasLoadedAll = useRef(false);

  // Primeira página - descobre total_paginas
  const firstPageQuery = useQuery({
    queryKey: ['clientes', 1],
    queryFn: () => listarClientes(1, 500),
    staleTime: 1000 * 60 * 5,
  });

  // Quando primeira página carregar, dispara resto em paralelo
  useEffect(() => {
    const loadRemainingPagesInParallel = async () => {
      if (!firstPageQuery.data || hasLoadedAll.current) return;

      const totalPages = firstPageQuery.data.total_paginas;

      if (totalPages > 1) {
        setIsLoadingAll(true);
        hasLoadedAll.current = true;
        console.log(`🚀 Carregando páginas 2-${totalPages} em paralelo...`);

        try {
          // Dispara todas as páginas restantes em paralelo
          const promises = Array.from({ length: totalPages - 1 }, (_, i) =>
            queryClient.fetchQuery({
              queryKey: ['clientes', i + 2],
              queryFn: () => listarClientes(i + 2, 500),
              staleTime: 1000 * 60 * 5,
            })
          );

          const results = await Promise.all(promises);

          // Combina primeira página com as demais
          const allClientes = [
            ...firstPageQuery.data.clientes,
            ...results.flatMap((r) => r.clientes),
          ];

          setAllPagesData(allClientes);
          console.log(`✅ Todas as ${totalPages} páginas carregadas`);
        } catch (error) {
          console.error('❌ Erro ao carregar páginas 2+:', error);
          console.warn('⚠️ Usando apenas primeira página');
          // Preserva primeira página em vez de perder tudo
          setAllPagesData(firstPageQuery.data.clientes);
        } finally {
          setIsLoadingAll(false);
          setIsDataReady(true);
        }
      } else {
        // Só tem 1 página
        setAllPagesData(firstPageQuery.data.clientes);
        setIsDataReady(true);
      }
    };

    if (firstPageQuery.isSuccess && !firstPageQuery.isFetching) {
      loadRemainingPagesInParallel();
    }
  }, [firstPageQuery.data, firstPageQuery.isSuccess, firstPageQuery.isFetching, queryClient]);

  // Combina dados de todas as páginas
  const allClientes = useMemo(() => {
    if (allPagesData.length > 0) {
      return allPagesData;
    }
    // Enquanto carrega, retorna vazio para não causar blink
    return [];
  }, [allPagesData]);

  // Metadados
  const totalClientes = firstPageQuery.data?.total_registros ?? 0;
  const loadedClientes = allClientes.length;

  return {
    allClientes,
    totalClientes,
    loadedClientes,
    isLoadingAll,
    isLoading: firstPageQuery.isLoading || !isDataReady,
    isError: firstPageQuery.isError,
    error: firstPageQuery.error,
    refetch: async () => {
      hasLoadedAll.current = false;
      setIsDataReady(false);
      setAllPagesData([]);
      await firstPageQuery.refetch();
    },
    isRefetching: firstPageQuery.isRefetching,
  };
};
