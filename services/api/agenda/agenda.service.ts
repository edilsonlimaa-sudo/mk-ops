import { ServicoAgenda } from '@/types/agenda';
import { Instalacao } from '@/types/instalacao';
import { compareVisita, isChamado } from '@/utils/agenda';
import { fetchAllChamados, fetchRecentChamadosFechados } from '../chamado/chamado.service';
import { fetchAllInstalacoes, fetchRecentInstalacoesConcluidadas } from '../instalacao/instalacao.service';

// Re-export utilities for backward compatibility
export type { ServicoAgenda } from '@/types/agenda';
export { compareVisita, isChamado, isInstalacao } from '@/utils/agenda';

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
 * Fetches and combines ALL chamados and instalacoes (open + closed)
 * Returns a unified timeline sorted by visita date
 * 
 * This is the complete timeline view that includes:
 * - Open chamados and instalacoes (pending work)
 * - Closed chamados and completed instalacoes (historical)
 * 
 * @returns Array of all chamados and instalacoes sorted by visita date
 */
export const fetchAgendaCompleta = async (): Promise<ServicoAgenda[]> => {
  console.log('🗓️ [AgendaService] Iniciando busca de agenda COMPLETA (abertos + fechados)...');
  
  try {
    // Fetch all in parallel for better performance
    const [chamadosAbertos, chamadosFechados, instalacoesAbertas, instalacoesConcluidas] = await Promise.all([
      fetchAllChamados('aberto'),
      fetchRecentChamadosFechados(100), // últimos 100 fechados
      fetchAllInstalacoes('aberto'),
      fetchRecentInstalacoesConcluidadas(100), // últimas 100 concluídas
    ]);

    console.log(`📊 [AgendaService] Chamados: ${chamadosAbertos.length} abertos + ${chamadosFechados.length} fechados`);
    console.log(`📊 [AgendaService] Instalações: ${instalacoesAbertas.length} abertas + ${instalacoesConcluidas.length} concluídas`);

    // Combine all
    const todosServicos: ServicoAgenda[] = [
      ...chamadosAbertos,
      ...chamadosFechados,
      ...instalacoesAbertas,
      ...instalacoesConcluidas,
    ];

    // Sort by visita date
    todosServicos.sort((a, b) => compareVisita(a.visita, b.visita));

    console.log(`✅ [AgendaService] Agenda completa: ${todosServicos.length} itens`);
    return todosServicos;
  } catch (error) {
    console.error('❌ [AgendaService] Erro ao buscar agenda completa:', error);
    throw error;
  }
};

/**
 * Fetches the most recent historical records (closed chamados + completed instalações)
 * using reverse pagination for optimal performance
 * 
 * Delegates to chamado.service and instalacao.service for data fetching.
 * This service only orchestrates and combines the results.
 * 
 * @returns Array of recent historical records (max ~100, empty if no data)
 */
export const fetchRecentHistorico = async (): Promise<ServicoAgenda[]> => {
  console.log('📜 [AgendaService] Iniciando busca OTIMIZADA de histórico recente...');
  
  try {
    // Delegate to services - fetch last page of both in parallel
    const [chamados, instalacoes] = await Promise.all([
      fetchRecentChamadosFechados(50),
      fetchRecentInstalacoesConcluidadas(50),
    ]);

    console.log(`📊 [AgendaService] Chamados: ${chamados.length}, Instalações: ${instalacoes.length}`);

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
