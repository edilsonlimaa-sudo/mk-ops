import { Chamado, ChamadoListResponse } from '@/types/chamado';
import { Instalacao, InstalacaoListResponse } from '@/types/instalacao';
import apiClient from './apiClient';
import { fetchAllChamados } from './chamado.service';
import { fetchAllInstalacoes } from './instalacao.service';

/**
 * Page size limit for historical data (optimized for performance)
 */
const HISTORICO_LIMIT = 50;

/**
 * Union type representing all service types in the agenda
 */
export type ServicoAgenda = Chamado | Instalacao;

/**
 * Compares two visita dates for sorting
 * Null dates are placed at the end
 * @param a - First date string or null
 * @param b - Second date string or null
 * @returns Comparison result for Array.sort()
 */
const compareVisita = (a: string | null, b: string | null): number => {
  // Items without visita go to the end
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  
  // Parse dates and compare
  const dateA = new Date(a.replace(' ', 'T'));
  const dateB = new Date(b.replace(' ', 'T'));
  
  return dateA.getTime() - dateB.getTime();
};

/**
 * Type guard to check if item is a Chamado
 */
export const isChamado = (item: ServicoAgenda): item is Chamado => {
  return 'chamado' in item;
};

/**
 * Type guard to check if item is an Instalacao
 */
export const isInstalacao = (item: ServicoAgenda): item is Instalacao => {
  return 'termo' in item;
};

/**
 * Fetches and combines all open chamados and instalacoes
 * Returns a unified agenda sorted by visita date
 * 
 * @returns Array of chamados and instalacoes sorted by visita date
 */
export const fetchAgenda = async (): Promise<ServicoAgenda[]> => {
  console.log('🗓️ [AgendaService] Iniciando busca de agenda unificada...');
  
  try {
    // Fetch both in parallel for better performance
    const [chamados, instalacoes] = await Promise.all([
      fetchAllChamados('aberto'),
      fetchAllInstalacoes('aberto'),
    ]);

    console.log(`📊 [AgendaService] Chamados abertos: ${chamados.length}, Instalações abertas: ${instalacoes.length}`);

    // Combine and sort by visita date
    const agenda: ServicoAgenda[] = [...chamados, ...instalacoes].sort((a, b) =>
      compareVisita(a.visita, b.visita)
    );

    console.log(`✅ [AgendaService] Agenda unificada: ${agenda.length} itens`);
    return agenda;
  } catch (error) {
    console.error('❌ [AgendaService] Erro ao buscar agenda:', error);
    throw error;
  }
};

/**
 * Fetches and combines all closed/completed chamados and instalacoes
 * Returns a unified history sorted by closing date (most recent first)
 * 
 * @returns Array of closed chamados and completed instalacoes
 */
export const fetchHistorico = async (): Promise<ServicoAgenda[]> => {
  console.log('📜 [AgendaService] Iniciando busca de histórico unificado...');
  
  try {
    // Fetch both in parallel
    const [chamados, instalacoes] = await Promise.all([
      fetchAllChamados('fechado'),
      fetchAllInstalacoes('concluido'),
    ]);

    console.log(`📊 [AgendaService] Chamados fechados: ${chamados.length}, Instalações concluídas: ${instalacoes.length}`);

    // Combine and sort by closing date (most recent first)
    const historico: ServicoAgenda[] = [...chamados, ...instalacoes].sort((a, b) => {
      const dateA = isChamado(a) ? a.fechamento : (a as Instalacao).datainst;
      const dateB = isChamado(b) ? b.fechamento : (b as Instalacao).datainst;
      
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      // Most recent first (reverse chronological)
      return new Date(dateB.replace(' ', 'T')).getTime() - new Date(dateA.replace(' ', 'T')).getTime();
    });

    console.log(`✅ [AgendaService] Histórico unificado: ${historico.length} itens`);
    return historico;
  } catch (error) {
    console.error('❌ [AgendaService] Erro ao buscar histórico:', error);
    throw error;
  }
};

/**
 * Fetches a single page of closed chamados with custom limit
 * @param page - Page number (1-indexed)
 * @param limit - Number of records per page (default: 50)
 * @returns Paginated response
 */
const fetchChamadoFechadoPage = async (
  page: number,
  limit: number = HISTORICO_LIMIT
): Promise<ChamadoListResponse> => {
  const response = await apiClient.get(
    `/api/chamado/listar/status=fechado&pagina=${page}&limite=${limit}`
  );
  
  // Handle "Registros nao encontrados" response
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
 * Fetches a single page of completed instalações with custom limit
 * @param page - Page number (1-indexed)
 * @param limit - Number of records per page (default: 50)
 * @returns Paginated response
 */
const fetchInstalacaoConcluidaPage = async (
  page: number,
  limit: number = HISTORICO_LIMIT
): Promise<InstalacaoListResponse> => {
  const response = await apiClient.get(
    `/api/instalacao/listar/status=concluido&pagina=${page}&limite=${limit}`
  );
  
  // Handle "Registros nao encontrados" response
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
 * Fetches the most recent historical records (closed chamados + completed instalações)
 * using reverse pagination for optimal performance
 * 
 * Strategy:
 * 1. Fetch page 1 of both chamados and instalações to discover total_paginas
 * 2. Fetch LAST page of both (most recent records in reverse chronological order)
 * 3. Combine and sort by closing/completion date (most recent first)
 * 4. Return combined array (max ~100 records total)
 * 
 * This approach optimizes performance by:
 * - Using only 4 API requests (2 per entity type)
 * - Fetching most recent records first
 * - Limiting to ~100 total records (sufficient for mobile viewing)
 * 
 * @returns Array of recent historical records (max ~100, empty if no data)
 */
export const fetchRecentHistorico = async (): Promise<ServicoAgenda[]> => {
  console.log('📜 [AgendaService] Iniciando busca OTIMIZADA de histórico recente...');
  console.log(`⚙️ [AgendaService] Limite por página: ${HISTORICO_LIMIT}`);
  
  try {
    // Step 1: Fetch first page of both to get metadata (parallel)
    console.log('📄 [AgendaService] Buscando páginas 1 para obter metadados...');
    const [firstPageChamados, firstPageInstalacoes] = await Promise.all([
      fetchChamadoFechadoPage(1),
      fetchInstalacaoConcluidaPage(1),
    ]);

    const totalPaginasChamados = firstPageChamados.total_paginas;
    const totalPaginasInstalacoes = firstPageInstalacoes.total_paginas;

    console.log(`📊 [AgendaService] Chamados: ${totalPaginasChamados} páginas, Instalações: ${totalPaginasInstalacoes} páginas`);

    // Collect chamados (first or last page)
    let chamados: Chamado[] = [];
    if (totalPaginasChamados <= 1) {
      console.log(`✅ [AgendaService] Chamados: usando página única (${firstPageChamados.chamados.length} registros)`);
      chamados = firstPageChamados.chamados;
    } else {
      console.log(`🚀 [AgendaService] Chamados: buscando última página (${totalPaginasChamados})...`);
      const lastPageChamados = await fetchChamadoFechadoPage(totalPaginasChamados);
      chamados = lastPageChamados.chamados;
      console.log(`✅ [AgendaService] Chamados: ${chamados.length} registros da última página`);
    }

    // Collect instalações (first or last page)
    let instalacoes: Instalacao[] = [];
    if (totalPaginasInstalacoes <= 1) {
      console.log(`✅ [AgendaService] Instalações: usando página única (${firstPageInstalacoes.instalacoes.length} registros)`);
      instalacoes = firstPageInstalacoes.instalacoes;
    } else {
      console.log(`🚀 [AgendaService] Instalações: buscando última página (${totalPaginasInstalacoes})...`);
      const lastPageInstalacoes = await fetchInstalacaoConcluidaPage(totalPaginasInstalacoes);
      instalacoes = lastPageInstalacoes.instalacoes;
      console.log(`✅ [AgendaService] Instalações: ${instalacoes.length} registros da última página`);
    }

    // Combine and sort by closing date (most recent first)
    const historico: ServicoAgenda[] = [...chamados, ...instalacoes].sort((a, b) => {
      const dateA = isChamado(a) ? a.fechamento : (a as Instalacao).datainst;
      const dateB = isChamado(b) ? b.fechamento : (b as Instalacao).datainst;
      
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      // Most recent first (reverse chronological)
      return new Date(dateB.replace(' ', 'T')).getTime() - new Date(dateA.replace(' ', 'T')).getTime();
    });

    console.log(`✅ [AgendaService] Histórico recente: ${historico.length} itens (${chamados.length} chamados + ${instalacoes.length} instalações)`);
    return historico;
  } catch (error) {
    console.error('❌ [AgendaService] Erro ao buscar histórico recente:', error);
    throw error;
  }
};
