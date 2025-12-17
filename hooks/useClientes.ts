import { listarClientes } from '@/services/api/cliente.service';
import { useInfiniteQuery } from '@tanstack/react-query';

export const useClientes = () => {
  return useInfiniteQuery({
    queryKey: ['clientes'],
    queryFn: ({ pageParam = 1 }) => listarClientes(pageParam),
    getNextPageParam: (lastPage) => {
      // Se ainda há mais páginas, retorna próxima página
      if (lastPage.pagina_atual < lastPage.total_paginas) {
        return lastPage.pagina_atual + 1;
      }
      return undefined; // Sem mais páginas
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
  });
};
