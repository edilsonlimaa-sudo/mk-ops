import { ServicoAgenda } from '@/types/agenda';
import { Chamado } from '@/types/chamado';
import { Instalacao } from '@/types/instalacao';

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
 * Compares two visita dates for sorting
 * Null dates are placed at the end
 * @param a - First date string or null
 * @param b - Second date string or null
 * @returns Comparison result for Array.sort()
 */
export const compareVisita = (a: string | null, b: string | null): number => {
  // Items without visita go to the end
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  
  // Parse dates and compare
  const dateA = new Date(a.replace(' ', 'T'));
  const dateB = new Date(b.replace(' ', 'T'));
  
  return dateA.getTime() - dateB.getTime();
};
