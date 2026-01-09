import { generateCalendarDays } from '@/utils/agenda';
import { useMemo } from 'react';

interface AgendaItem {
  id: string;
  title: string;
  subtitle?: string;
  dateKey: string;
  isChamado?: boolean;
  isConcluido?: boolean;
  horario?: string;
}

export type FlatListItem =
  | { type: 'header'; dateLabel: string; dateKey: string }
  | { type: 'item'; data: AgendaItem }
  | { type: 'empty'; dateKey: string };

export function useFlatAgendaData(items: AgendaItem[], dateKeys: string[]) {
  return useMemo(() => {
    // Constantes de altura fixas
    const HEADER_HEIGHT = 36;
    const EMPTY_HEIGHT = 46;
    const ITEM_HEIGHT = 132;

    const allDays = generateCalendarDays();
    const result: FlatListItem[] = [];
    const stickyIndices: number[] = [];
    const itemLayouts: { length: number; offset: number; index: number }[] = [];

    let currentOffset = 0;

    // Processa apenas os dias especificados em dateKeys
    dateKeys.forEach((dateKey) => {
      const day = allDays.find(d => d.dateKey === dateKey);
      if (!day) return;

      const dayLabel = `${day.dayName}, ${day.dayNumber} ${day.date.toLocaleDateString('pt-BR', { month: 'long' }).replace('.', '')}`.toUpperCase();

      // Header
      stickyIndices.push(result.length);
      result.push({ type: 'header', dateLabel: dayLabel, dateKey: day.dateKey });
      itemLayouts.push({ length: HEADER_HEIGHT, offset: currentOffset, index: result.length - 1 });
      currentOffset += HEADER_HEIGHT;

      // Items ou Empty
      const dayItems = items.filter(item => item.dateKey === day.dateKey);

      if (dayItems.length === 0) {
        result.push({ type: 'empty', dateKey: day.dateKey });
        itemLayouts.push({ length: EMPTY_HEIGHT, offset: currentOffset, index: result.length - 1 });
        currentOffset += EMPTY_HEIGHT;
      } else {
        dayItems.forEach(item => {
          result.push({ type: 'item', data: item });
          itemLayouts.push({ length: ITEM_HEIGHT, offset: currentOffset, index: result.length - 1 });
          currentOffset += ITEM_HEIGHT;
        });
      }
    });

    return { flatData: result, stickyIndices, itemLayouts };
  }, [items, dateKeys]);
}
