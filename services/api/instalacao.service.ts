import { Instalacao, InstalacaoListResponse, InstalacaoStatus } from '@/types/instalacao';
import apiClient from './apiClient';

/**
 * Fetches a single page of instalacoes
 * @param page - Page number (1-indexed)
 * @param status - Filter by status: 'aberto', 'concluido', or 'todos'
 * @param limit - Optional limit per page
 * @returns Paginated response with instalacoes (empty array if no records found)
 */
const fetchInstalacaoPage = async (
  page: number,
  status: InstalacaoStatus = 'aberto',
  limit?: number
): Promise<InstalacaoListResponse> => {
  const url = limit 
    ? `/api/instalacao/listar/status=${status}&pagina=${page}&limite=${limit}`
    : `/api/instalacao/listar/status=${status}&pagina=${page}`;
  
  const response = await apiClient.get(url);
  
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

/**
 * Fetches the most recent completed instalacoes using reverse pagination
 * 
 * Strategy:
 * 1. Fetch page 1 to discover total_paginas
 * 2. If only 1 page: return page 1 data
 * 3. If multiple pages: fetch and return LAST page (most recent records)
 * 
 * @param limit - Number of records per page (default: 50)
 * @returns Array of recent completed instalacoes (max 50, empty if no data)
 */
export const fetchRecentInstalacoesConcluidadas = async (limit: number = 50): Promise<Instalacao[]> => {
  console.log(`🔍 [InstalacaoService] Iniciando busca de instalações concluídas recentes...`);
  console.log(`⚙️ [InstalacaoService] Limite por página: ${limit}`);
  
  try {
    // Step 1: Fetch first page to get metadata
    console.log('📄 [InstalacaoService] Buscando página 1 para obter metadados...');
    const firstPage = await fetchInstalacaoPage(1, 'concluido', limit);
    const { total_paginas, instalacoes } = firstPage;

    console.log(`📊 [InstalacaoService] Total de páginas: ${total_paginas}`);

    // No data or only one page
    if (total_paginas <= 1) {
      console.log(`✅ [InstalacaoService] Retornando ${instalacoes.length} instalações (página única)`);
      return instalacoes;
    }

    // Step 2: Fetch LAST page (most recent records)
    console.log(`🚀 [InstalacaoService] Buscando última página (${total_paginas})...`);
    const lastPage = await fetchInstalacaoPage(total_paginas, 'concluido', limit);
    console.log(`✅ [InstalacaoService] Retornando ${lastPage.instalacoes.length} instalações da última página`);
    
    return lastPage.instalacoes;
  } catch (error) {
    console.error('❌ [InstalacaoService] Erro ao buscar instalações concluídas:', error);
    throw error;
  }
};

/**
 * Fetches a single instalacao by UUID
 * @param uuid - The uuid_solic of the instalacao
 * @returns Instalacao object with complete details
 * @throws Error if instalacao is not found or API returns invalid data
 */
export const fetchInstalacaoById = async (uuid: string): Promise<Instalacao> => {
  console.log(`🔍 [InstalacaoService] Fetching instalacao by uuid_solic: ${uuid}`);
  
  try {
    const response = await apiClient.get(`/api/instalacao/show/${uuid}`);
    
    // Handle API inconsistency: 200 status with empty array means "not found"
    if (Array.isArray(response.data) && response.data.length === 0) {
      console.error(`❌ [InstalacaoService] Instalação não encontrada (API retornou array vazio)`);
      throw new Error('Instalação não encontrada');
    }
    
    const instalacao = response.data;
    
    // Validate that we got a valid instalacao object
    if (!instalacao || typeof instalacao !== 'object' || !instalacao.uuid_solic) {
      console.error(`❌ [InstalacaoService] Resposta inválida da API:`, instalacao);
      throw new Error('Dados da instalação inválidos');
    }
    
    console.log(`✅ [InstalacaoService] Instalação #${instalacao.id} carregada com sucesso`);
    return instalacao;
  } catch (error) {
    console.error(`❌ [InstalacaoService] Erro ao buscar instalação ${uuid}:`, error);
    throw error;
  }
};
