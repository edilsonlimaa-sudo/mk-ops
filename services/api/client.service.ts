import { Client, ClientListResponse } from '@/types/client';
import apiClient from './apiClient';

/**
 * Fetches a single page of clients
 * @param page - Page number (1-indexed)
 * @returns Paginated response with clients (empty array if no records found)
 */
const fetchClientPage = async (page: number): Promise<ClientListResponse> => {
  const response = await apiClient.get(
    `/api/cliente/listar/pagina=${page}`
  );
  
  // Handle "Registros nao encontrados" response (200 status, no data)
  if (response.data?.mensagem?.includes('Registros nao encontrados')) {
    return {
      total_registros: 0,
      consulta_atual: 0,
      pagina_atual: page,
      total_paginas: 0,
      clientes: [],
    };
  }
  
  return response.data;
};

/**
 * Fetches ALL clients from all pages
 * @returns Array of all clients (empty array if no data)
 */
export const fetchAllClients = async (): Promise<Client[]> => {
  const firstPage = await fetchClientPage(1);
  const { total_paginas, clientes } = firstPage;
  
  // No data or only one page
  if (total_paginas <= 1) {
    return clientes;
  }
  
  // Fetch remaining pages in parallel
  const remainingPages = Array.from({ length: total_paginas - 1 }, (_, i) => i + 2);
  const remainingResults = await Promise.all(remainingPages.map(fetchClientPage));
  
  return [...clientes, ...remainingResults.flatMap((r) => r.clientes)];
};

export const clientService = {
  fetchAllClients,
  fetchClientPage,
};
