import { ServicoAgenda } from '@/services/api/agenda';
import { useMemo } from 'react';

// Tipos para lista achatada (FlatList)
export type FlatListItem =
  | { type: 'header'; id: string; title: string; dateKey: string; isToday: boolean; isTomorrow: boolean; isPast: boolean }
  | { type: 'item'; id: string; data: ServicoAgenda }
  | { type: 'empty'; id: string; dateKey: string };

// Alturas fixas para getItemLayout
export const HEADER_HEIGHT = 40;
export const ITEM_HEIGHT = 100;
export const EMPTY_HEIGHT = 36;

/**
 * Gera array de datas de D-30 a D+30 (61 dias)
 */
const gerarDatasFixas = () => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const datas: Date[] = [];
  for (let i = -30; i <= 30; i++) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() + i);
    datas.push(data);
  }
  return datas;
};

/**
 * Hook para transformar serviços em dados otimizados para FlatList
 * 
 * Responsabilidades:
 * - Gera lista "achatada" com headers intercalados
 * - Pré-calcula layouts para getItemLayout O(1)
 * - Filtra dados para modo dia vs agenda
 * - Cria mapas de navegação (dateKey → index)
 * 
 * @param servicos - Dados da API (React Query)
 * @param selectedDateKey - Data selecionada no calendário
 * @param viewMode - Modo de visualização ('day' | 'agenda')
 */
export function useAgendaData(
  servicos: ServicoAgenda[] | undefined,
  selectedDateKey: string,
  viewMode: 'day' | 'agenda'
) {
  // Gera lista achatada com headers + itens + vazios + offsets pré-calculados
  const { flatData, todayHeaderIndex, itemLayouts } = useMemo(() => {
    const datasFixas = gerarDatasFixas();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    // Mapeia serviços por dateKey
    const servicosPorData = new Map<string, ServicoAgenda[]>();

    if (servicos && servicos.length > 0) {
      for (const servico of servicos) {
        if (!servico.visita) continue;
        try {
          const dataServico = new Date(servico.visita.replace(' ', 'T'));
          dataServico.setHours(0, 0, 0, 0);
          const dateKey = dataServico.toISOString().split('T')[0];

          if (!servicosPorData.has(dateKey)) {
            servicosPorData.set(dateKey, []);
          }
          servicosPorData.get(dateKey)!.push(servico);
        } catch {
          // Ignora datas inválidas
        }
      }
    }

    // Constrói lista achatada E pré-calcula layouts
    const items: FlatListItem[] = [];
    const layouts: { length: number; offset: number; index: number }[] = [];
    let todayIdx = 0;
    let currentOffset = 0;

    for (let i = 0; i < datasFixas.length; i++) {
      const data = datasFixas[i];
      const dateKey = data.toISOString().split('T')[0];
      const isToday = data.getTime() === hoje.getTime();
      const isTomorrow = data.getTime() === amanha.getTime();
      const isPast = data < hoje;

      // Formata título
      const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'long' });
      const diaSemanaCapitalizado =
        diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
      const dataFormatada = data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
      });

      let title: string;
      if (isToday) {
        title = `Hoje, ${dataFormatada}`;
        todayIdx = items.length; // Captura índice ANTES de adicionar o header
      } else if (isTomorrow) {
        title = `Amanhã, ${dataFormatada}`;
      } else {
        title = `${diaSemanaCapitalizado}, ${dataFormatada}`;
      }

      // Adiciona header + layout
      items.push({
        type: 'header',
        id: `header-${dateKey}`,
        title,
        dateKey,
        isToday,
        isTomorrow,
        isPast,
      });
      layouts.push({ length: HEADER_HEIGHT, offset: currentOffset, index: items.length - 1 });
      currentOffset += HEADER_HEIGHT;

      // Adiciona itens do dia ou placeholder vazio
      const servicosDoDia = servicosPorData.get(dateKey);
      if (servicosDoDia && servicosDoDia.length > 0) {
        for (const servico of servicosDoDia) {
          items.push({
            type: 'item',
            id: servico.id,
            data: servico,
          });
          layouts.push({ length: ITEM_HEIGHT, offset: currentOffset, index: items.length - 1 });
          currentOffset += ITEM_HEIGHT;
        }
      } else {
        items.push({
          type: 'empty',
          id: `empty-${dateKey}`,
          dateKey,
        });
        layouts.push({ length: EMPTY_HEIGHT, offset: currentOffset, index: items.length - 1 });
        currentOffset += EMPTY_HEIGHT;
      }
    }

    return { flatData: items, todayHeaderIndex: todayIdx, itemLayouts: layouts };
  }, [servicos]);

  // Dados filtrados para modo dia (só mostra o dia selecionado)
  const { dayModeData, dayModeLayouts } = useMemo(() => {
    const items: FlatListItem[] = [];
    const layouts: { length: number; offset: number; index: number }[] = [];
    let currentOffset = 0;
    let foundHeader = false;

    for (const item of flatData) {
      if (item.type === 'header') {
        if (item.dateKey === selectedDateKey) {
          foundHeader = true;
          items.push(item);
          layouts.push({ length: HEADER_HEIGHT, offset: currentOffset, index: items.length - 1 });
          currentOffset += HEADER_HEIGHT;
        } else if (foundHeader) {
          // Chegou no próximo header, para
          break;
        }
      } else if (foundHeader) {
        items.push(item);
        const height = item.type === 'empty' ? EMPTY_HEIGHT : ITEM_HEIGHT;
        layouts.push({ length: height, offset: currentOffset, index: items.length - 1 });
        currentOffset += height;
      }
    }

    return { dayModeData: items, dayModeLayouts: layouts };
  }, [flatData, selectedDateKey]);

  // Dados ativos baseado no modo
  const activeData = viewMode === 'day' ? dayModeData : flatData;
  const activeLayouts = viewMode === 'day' ? dayModeLayouts : itemLayouts;

  // Mapa de dateKey → índice do header para navegação rápida
  const dateKeyToIndex = useMemo(() => {
    const map = new Map<string, number>();
    flatData.forEach((item, index) => {
      if (item.type === 'header') {
        map.set(item.dateKey, index);
      }
    });
    return map;
  }, [flatData]);

  // Pré-calcula índices dos headers para sticky
  const stickyHeaderIndices = useMemo(
    () =>
      activeData
        .map((item, idx) => (item.type === 'header' ? idx : null))
        .filter((idx): idx is number => idx !== null),
    [activeData]
  );

  return {
    // Dados para renderização
    activeData,
    activeLayouts,
    
    // Dados brutos (para busca binária no scroll)
    flatData,
    itemLayouts,
    
    // Índices especiais
    todayHeaderIndex,
    dateKeyToIndex,
    stickyHeaderIndices,
  };
}
