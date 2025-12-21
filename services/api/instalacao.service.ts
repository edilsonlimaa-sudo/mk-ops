import { Instalacao, InstalacaoListResponse, InstalacaoStatus } from '@/types/instalacao';
import apiClient from './apiClient';

/**
 * Fetches a single page of instalacoes
 * @param page - Page number (1-indexed)
 * @param status - Filter by status: 'aberto', 'concluido', or 'todos'
 * @returns Paginated response with instalacoes (empty array if no records found)
 */
const fetchInstalacaoPage = async (
  page: number,
  status: InstalacaoStatus = 'aberto'
): Promise<InstalacaoListResponse> => {
  const response = await apiClient.get(
    `/api/instalacao/listar/status=${status}&pagina=${page}`
  );
  
  // Handle "Registros nao encontrados" response (200 status, no data)
  if (response.data?.mensagem?.includes('Registros nao encontrados')) {
    return {
      total_registros: 0,
      consulta_atual: 0,
      pagina_atual: page,
      total_paginas: 0,
      instalacoes: [],
    };
  }
  
  return response.data;
};

/**
 * Fetches ALL instalacoes from all pages
 * @param status - Filter by status: 'aberto', 'concluido', or 'todos'
 * @returns Array of all instalacoes (empty array if no data)
 */
export const fetchAllInstalacoes = async (status: InstalacaoStatus = 'aberto'): Promise<Instalacao[]> => {
  console.log(`🔍 [InstalacaoService] Iniciando busca de instalações (status: ${status})...`);
  console.log('🌐 [InstalacaoService] BaseURL atual:', apiClient.defaults.baseURL);
  
  try {
    const firstPage = await fetchInstalacaoPage(1, status);
    const { total_paginas, instalacoes } = firstPage;

    console.log(`📊 [InstalacaoService] Total de páginas: ${total_paginas}, Instalações na página 1: ${instalacoes.length}`);

    // No data or only one page
    if (total_paginas <= 1) {
      console.log(`✅ [InstalacaoService] Retornando ${instalacoes.length} instalações`);
      return instalacoes;
    }

    // Fetch remaining pages in parallel
    const remainingPages = Array.from({ length: total_paginas - 1 }, (_, i) => i + 2);
    console.log(`🚀 [InstalacaoService] Buscando ${remainingPages.length} páginas restantes em paralelo...`);
    const remainingResults = await Promise.all(
      remainingPages.map((page) => fetchInstalacaoPage(page, status))
    );

    const allInstalacoes = [...instalacoes, ...remainingResults.flatMap((r) => r.instalacoes)];
    console.log(`✅ [InstalacaoService] Total de instalações carregadas: ${allInstalacoes.length}`);
    return allInstalacoes;
  } catch (error) {
    console.error('❌ [InstalacaoService] Erro ao buscar instalações:', error);
    throw error;
  }
};
