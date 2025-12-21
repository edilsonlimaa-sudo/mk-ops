import { Chamado } from '@/types/chamado';
import { Instalacao } from '@/types/instalacao';
import { fetchAllChamados } from './chamado.service';
import { fetchAllInstalacoes } from './instalacao.service';

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
