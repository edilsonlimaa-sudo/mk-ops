import { Client } from '@/types/client';
import { createContext, useContext } from 'react';

interface ClienteContextType {
  cliente: Client;
}

export const ClienteContext = createContext<ClienteContextType | null>(null);

export function useClienteContext() {
  const context = useContext(ClienteContext);
  if (!context) {
    throw new Error('useClienteContext must be used within ClienteContext.Provider');
  }
  return context;
}
