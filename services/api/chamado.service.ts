import { Chamado, ChamadoListResponse, ChamadoStatus } from '@/types/chamado';
import apiClient from './apiClient';

/**
 * Fetches a single page of chamados
 * @param page - Page number (1-indexed)
 * @param status - Filter by status: 'aberto', 'fechado', or 'todos'
 * @returns Paginated response with chamados (empty array if no records found)
 */
const fetchChamadoPage = async (
  page: number,
  status: ChamadoStatus = 'aberto'
): Promise<ChamadoListResponse> => {
  const response = await apiClient.get(
    `/api/chamado/listar/status=${status}&pagina=${page}`
  );
  
  // Handle "Registros nao encontrados" response (200 status, no data)
  if (response.data?.mensagem?.includes('Registros nao encontrados')) {
    return {
      total_registros: 0,
      consulta_atual: 0,
      pagina_atual: page,
      total_paginas: 0,
      chamados: [],
    };
  }
  
  return response.data;
};

/**
 * Fetches ALL chamados from all pages
 * @param status - Filter by status: 'aberto', 'fechado', or 'todos'
 * @returns Array of all chamados (empty array if no data)
 */
export const fetchAllChamados = async (status: ChamadoStatus = 'aberto'): Promise<Chamado[]> => {
  console.log(`🔍 [ChamadoService] Iniciando busca de chamados (status: ${status})...`);
  console.log('🌐 [ChamadoService] BaseURL atual:', apiClient.defaults.baseURL);
  
  try {
    const firstPage = await fetchChamadoPage(1, status);
    const { total_paginas, chamados } = firstPage;

    console.log(`📊 [ChamadoService] Total de páginas: ${total_paginas}, Chamados na página 1: ${chamados.length}`);

    // No data or only one page
    if (total_paginas <= 1) {
      console.log(`✅ [ChamadoService] Retornando ${chamados.length} chamados`);
      return chamados;
    }

    // Fetch remaining pages in parallel
    const remainingPages = Array.from({ length: total_paginas - 1 }, (_, i) => i + 2);
    console.log(`🚀 [ChamadoService] Buscando ${remainingPages.length} páginas restantes em paralelo...`);
    const remainingResults = await Promise.all(
      remainingPages.map((page) => fetchChamadoPage(page, status))
    );

    const allChamados = [...chamados, ...remainingResults.flatMap((r) => r.chamados)];
    console.log(`✅ [ChamadoService] Total de chamados carregados: ${allChamados.length}`);
    return allChamados;
  } catch (error) {
    console.error('❌ [ChamadoService] Erro ao buscar chamados:', error);
    throw error;
  }
};
