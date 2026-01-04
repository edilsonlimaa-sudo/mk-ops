import { Client } from '@/types/client';
import { createContext, useContext } from 'react';

interface ClienteContextType {
  cliente: Client;
  openEditModal: (field: string, value: string, label: string, multiline?: boolean) => void;
  refetch: () => Promise<any>;
  isFetching: boolean;
}

export const ClienteContext = createContext<ClienteContextType | null>(null);

export function useClienteContext() {
  const context = useContext(ClienteContext);
  if (!context) {
    // Em produção, retornar um objeto seguro ao invés de lançar erro
    if (process.env.NODE_ENV === 'production') {
      console.error('useClienteContext usado fora do Provider');
      return {
        cliente: {} as Client,
        openEditModal: () => {},
        refetch: async () => {},
        isFetching: false,
      };
    }
    throw new Error('useClienteContext must be used within ClienteContext.Provider');
  }
  return context;
}
