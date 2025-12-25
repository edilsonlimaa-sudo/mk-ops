import { Chamado, ChamadoListResponse, ChamadoStatus } from '@/types/chamado';
import apiClient from './apiClient';

/**
 * Fetches a single page of chamados
 * @param page - Page number (1-indexed)
 * @param status - Filter by status: 'aberto', 'fechado', or 'todos'
 * @param limit - Optional limit per page
 * @returns Paginated response with chamados (empty array if no records found)
 */
const fetchChamadoPage = async (
  page: number,
  status: ChamadoStatus = 'aberto',
  limit?: number
): Promise<ChamadoListResponse> => {
  const url = limit 
    ? `/api/chamado/listar/status=${status}&pagina=${page}&limite=${limit}`
    : `/api/chamado/listar/status=${status}&pagina=${page}`;
  
  const response = await apiClient.get(url);
  
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

/**
 * Fetches the most recent closed chamados using reverse pagination
 * 
 * Strategy:
 * 1. Fetch page 1 to discover total_paginas
 * 2. If only 1 page: return page 1 data
 * 3. If multiple pages: fetch and return LAST page (most recent records)
 * 
 * @param limit - Number of records per page (default: 50)
 * @returns Array of recent closed chamados (max 50, empty if no data)
 */
export const fetchRecentChamadosFechados = async (limit: number = 50): Promise<Chamado[]> => {
  console.log(`🔍 [ChamadoService] Iniciando busca de chamados fechados recentes...`);
  console.log(`⚙️ [ChamadoService] Limite por página: ${limit}`);
  
  try {
    // Step 1: Fetch first page to get metadata
    console.log('📄 [ChamadoService] Buscando página 1 para obter metadados...');
    const firstPage = await fetchChamadoPage(1, 'fechado', limit);
    const { total_paginas, chamados } = firstPage;

    console.log(`📊 [ChamadoService] Total de páginas: ${total_paginas}`);

    // No data or only one page
    if (total_paginas <= 1) {
      console.log(`✅ [ChamadoService] Retornando ${chamados.length} chamados (página única)`);
      return chamados;
    }

    // Step 2: Fetch LAST page (most recent records)
    console.log(`🚀 [ChamadoService] Buscando última página (${total_paginas})...`);
    const lastPage = await fetchChamadoPage(total_paginas, 'fechado', limit);
    console.log(`✅ [ChamadoService] Retornando ${lastPage.chamados.length} chamados da última página`);
    
    return lastPage.chamados;
  } catch (error) {
    console.error('❌ [ChamadoService] Erro ao buscar chamados fechados:', error);
    throw error;
  }
};

/**
 * Fetches a single chamado by UUID
 * @param uuid - Chamado UUID (uuid_suporte field)
 * @returns Single chamado object
 * @throws Error if chamado not found or invalid UUID
 */
export const fetchChamadoById = async (uuid: string): Promise<Chamado> => {
  console.log(`🔍 [ChamadoService] Buscando chamado por UUID: ${uuid}`);
  
  try {
    const response = await apiClient.get(`/api/chamado/show/${uuid}`);
    
    // API inconsistency: returns 200 with empty array when chamado not found
    if (Array.isArray(response.data) && response.data.length === 0) {
      console.warn(`⚠️ [ChamadoService] Chamado não encontrado: ${uuid}`);
      throw new Error('Chamado não encontrado');
    }
    
    // Validate that we got a chamado object
    if (!response.data || typeof response.data !== 'object' || !response.data.uuid_suporte) {
      console.warn(`⚠️ [ChamadoService] Resposta inválida para UUID: ${uuid}`, response.data);
      throw new Error('Resposta inválida da API');
    }
    
    console.log(`✅ [ChamadoService] Chamado encontrado: #${response.data.chamado}`);
    return response.data;
  } catch (error) {
    console.error(`❌ [ChamadoService] Erro ao buscar chamado ${uuid}:`, error);
    throw error;
  }
};
