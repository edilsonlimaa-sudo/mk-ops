import { Chamado, ChamadoListResponse } from '@/types/chamado';
import apiClient from './apiClient';

/**
 * Page size limit for closed chamados (optimized for performance)
 */
const CLOSED_CHAMADOS_LIMIT = 50;

/**
 * Fetches a single page of closed chamados with custom limit
 * @param page - Page number (1-indexed)
 * @param limit - Number of records per page (default: 50)
 * @returns Paginated response with chamados (empty array if no records found)
 */
const fetchChamadoFechadoPage = async (
  page: number,
  limit: number = CLOSED_CHAMADOS_LIMIT
): Promise<ChamadoListResponse> => {
  const response = await apiClient.get(
    `/api/chamado/listar/status=fechado&pagina=${page}&limite=${limit}`
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
 * Fetches the most recent closed chamados using reverse pagination
 * 
 * Strategy:
 * 1. Fetch page 1 to discover total_paginas
 * 2. Fetch last page (most recent closed chamados)
 * 3. Return only the last page data (max 50 records)
 * 
 * This approach optimizes performance by:
 * - Using only 2 API requests
 * - Fetching most recent records first (reverse chronological)
 * - Limiting to 50 records (sufficient for mobile viewing)
 * 
 * @returns Array of recent closed chamados (max 50, empty if no data)
 */
export const fetchRecentChamadosFechados = async (): Promise<Chamado[]> => {
  console.log(`🔍 [ChamadoFechadoService] Iniciando busca de chamados fechados recentes...`);
  console.log(`⚙️ [ChamadoFechadoService] Limite por página: ${CLOSED_CHAMADOS_LIMIT}`);
  console.log('🌐 [ChamadoFechadoService] BaseURL atual:', apiClient.defaults.baseURL);
  
  try {
    // Step 1: Fetch first page to get metadata (total_paginas)
    console.log('📄 [ChamadoFechadoService] Buscando página 1 para obter metadados...');
    const firstPage = await fetchChamadoFechadoPage(1);
    const { total_paginas } = firstPage;

    console.log(`📊 [ChamadoFechadoService] Total de páginas disponíveis: ${total_paginas}`);

    // No data or only one page
    if (total_paginas <= 1) {
      console.log(`✅ [ChamadoFechadoService] Retornando ${firstPage.chamados.length} chamados (única página)`);
      return firstPage.chamados;
    }

    // Step 2: Fetch LAST page (most recent records)
    console.log(`🚀 [ChamadoFechadoService] Buscando última página (${total_paginas}) com os registros mais recentes...`);
    const lastPage = await fetchChamadoFechadoPage(total_paginas);

    console.log(`✅ [ChamadoFechadoService] Total de chamados fechados carregados: ${lastPage.chamados.length}`);
    return lastPage.chamados;
  } catch (error) {
    console.error('❌ [ChamadoFechadoService] Erro ao buscar chamados fechados:', error);
    throw error;
  }
};
