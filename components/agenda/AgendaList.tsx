import { useTheme } from '@/contexts/ThemeContext';
import { generateCalendarDays } from '@/utils/agenda';
import { useCallback, useMemo, useRef } from 'react';
import { FlatList, Text, View } from 'react-native';
import { ListItem } from './ListItem';

interface AgendaItem {
  id: string;
  title: string;
  subtitle?: string;
  dateKey: string; // Data do item (YYYY-MM-DD)
}

interface AgendaListProps {
  items?: AgendaItem[];
  onActiveHeaderChange?: (dateKey: string, dayIndex: number) => void;
}

type FlatListItem =
  | { type: 'header'; dateLabel: string; dateKey: string }
  | { type: 'item'; data: AgendaItem }
  | { type: 'empty'; dateKey: string };

export function AgendaList({ items = [], onActiveHeaderChange }: AgendaListProps) {
  console.log('[AgendaList] Re-render, items:', items.length);
  const { colors } = useTheme();
  const lastActiveHeaderRef = useRef<string | null>(null);

  const flatData = useMemo(() => {
    // Gera todos os 49 dias das 7 semanas
    const days = generateCalendarDays();
    const result: FlatListItem[] = [];
    const stickyIndices: number[] = [];
    const dateKeyToIndexMap = new Map<string, number>();

    // Cria estrutura flat com header para cada dia
    days.forEach((day, dayIndex) => {
      const dayLabel = `${day.dayName}, ${day.dayNumber} ${day.date.toLocaleDateString('pt-BR', { month: 'long' }).replace('.', '')}`.toUpperCase();

      // Mapeia dateKey para índice do dia (0-48)
      dateKeyToIndexMap.set(day.dateKey, dayIndex);

      // Adiciona header do dia
      stickyIndices.push(result.length);
      result.push({ type: 'header', dateLabel: dayLabel, dateKey: day.dateKey });

      // Filtra items desse dia
      const dayItems = items.filter(item => item.dateKey === day.dateKey);

      if (dayItems.length === 0) {
        result.push({ type: 'empty', dateKey: day.dateKey });
      } else {
        dayItems.forEach(item => {
          result.push({ type: 'item', data: item });
        });
      }
    });

    return { flatData: result, stickyIndices, dateKeyToIndexMap };
  }, [items]);

  const renderItem = ({ item }: { item: FlatListItem }) => {
    if (item.type === 'header') {
      return (
        <View
          className="py-3 px-4"
          style={{ backgroundColor: colors.screenBackground }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: colors.cardTextSecondary }}
          >
            {item.dateLabel}
          </Text>
        </View>
      );
    }

    if (item.type === 'empty') {
      return (
        <View className="py-4 px-4">
          <Text
            className="text-sm italic"
            style={{ color: colors.cardTextSecondary }}
          >
            Sem agendamentos
          </Text>
        </View>
      );
    }

    // type === 'item'
    return (
      <ListItem
        title={item.data.title}
        subtitle={item.data.subtitle}
        onPress={() => console.log('Item clicado:', item.data.id)}
      />
    );
  };

  // Detecta o header ativo baseado nos itens visíveis
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: any[] }) => {
      const firstItem = viewableItems[0]?.item;
      if (!firstItem) return;
      
      // Extrai dateKey baseado no tipo
      const dateKey = 
        firstItem.type === 'header' || firstItem.type === 'empty'
          ? firstItem.dateKey
          : firstItem.type === 'item'
          ? firstItem.data.dateKey
          : null;
      
      // Notifica se mudou
      if (dateKey && lastActiveHeaderRef.current !== dateKey) {
        lastActiveHeaderRef.current = dateKey;
        const dayIndex = flatData.dateKeyToIndexMap.get(dateKey) ?? 0;
        onActiveHeaderChange?.(dateKey, dayIndex);
      }
    },
    [onActiveHeaderChange]
  );

  const viewabilityConfigCallbackPairs = useMemo(
    () => [
      {
        viewabilityConfig: {
          itemVisiblePercentThreshold: 10,
          minimumViewTime: 0,
        },
        onViewableItemsChanged: handleViewableItemsChanged,
      },
    ],
    [handleViewableItemsChanged]
  );

  return (
    <FlatList
      data={flatData.flatData}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.type}-${index}`}
      stickyHeaderIndices={flatData.stickyIndices}
      contentContainerStyle={{ paddingBottom: 24 }}
      viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
    />
  );
}
