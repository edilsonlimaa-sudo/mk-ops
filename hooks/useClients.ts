import { listAllClients } from '@/services/api/cliente.service';
import { useQuery } from '@tanstack/react-query';

export const useClients = () => {
  const { 
    data, 
    isLoading, 
    isFetching, 
    isRefetching, 
    isSuccess,
    isError, 
    error, 
    status,
    dataUpdatedAt,
    refetch 
  } = useQuery({
    queryKey: ['clients'],
    queryFn: listAllClients,
  });

  return {
    clientes: data || [],
    isLoading,
    isFetching,
    isRefetching,
    isSuccess,
    isError,
    error,
    status,
    dataUpdatedAt,
    refetch,
  };
};
