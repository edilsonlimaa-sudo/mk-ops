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

/**
 * Encontra o header visível no offset Y usando busca binária O(log n)
 * 
 * @param offsetY - Offset vertical do scroll
 * @param itemLayouts - Array pré-calculado de layouts {offset, length, index}
 * @param flatData - Array de itens da FlatList
 * @param headerHeight - Altura do header (para tolerância)
 * @returns dateKey do header encontrado ou null
 */
export function findHeaderAtOffset(
  offsetY: number,
  itemLayouts: Array<{ offset: number; length: number; index: number }>,
  flatData: Array<{ type: string; dateKey?: string }>,
  headerHeight: number = 40
): string | null {
  // Adiciona tolerância para detectar o header correto
  // Quando scrollamos para um header, queremos que ele seja detectado
  const adjustedOffset = offsetY + headerHeight / 2;

  // Busca binária para encontrar o item no offset atual
  let left = 0;
  let right = itemLayouts.length - 1;
  let foundIndex = 0;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const layout = itemLayouts[mid];

    if (layout.offset <= adjustedOffset) {
      foundIndex = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  // Se encontrou um item, verifica se é header ou busca o header anterior
  const item = flatData[foundIndex];
  
  if (item?.type === 'header' && item.dateKey) {
    return item.dateKey;
  }
  
  // Busca o header anterior
  let headerIndex = foundIndex - 1;
  while (headerIndex >= 0 && flatData[headerIndex]?.type !== 'header') {
    headerIndex--;
  }
  
  if (headerIndex >= 0) {
    const header = flatData[headerIndex];
    if (header?.type === 'header' && header.dateKey) {
      return header.dateKey;
    }
  }
  
  return null;
}

