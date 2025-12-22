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
  console.log('🔍 [ClientService] Iniciando busca de clientes...');
  
  try {
    const firstPage = await fetchClientPage(1);
    const { total_paginas, clientes } = firstPage;

    console.log(`📊 [ClientService] Total de páginas: ${total_paginas}, Clientes na página 1: ${clientes.length}`);

    // No data or only one page
    if (total_paginas <= 1) {
      console.log(`✅ [ClientService] Retornando ${clientes.length} clientes`);
      return clientes;
    }

    // Fetch remaining pages in parallel
    const remainingPages = Array.from({ length: total_paginas - 1 }, (_, i) => i + 2);
    console.log(`🚀 [ClientService] Buscando ${remainingPages.length} páginas restantes em paralelo...`);
    const remainingResults = await Promise.all(remainingPages.map(fetchClientPage));

    const allClients = [...clientes, ...remainingResults.flatMap((r) => r.clientes)];
    console.log(`✅ [ClientService] Total de clientes carregados: ${allClients.length}`);
    return allClients;
  } catch (error) {
    console.error('❌ [ClientService] Erro ao buscar clientes:', error);
    throw error;
  }
};
