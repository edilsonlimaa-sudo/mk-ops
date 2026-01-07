import { useTheme } from '@/contexts/ThemeContext';
import { generateCalendarDays } from '@/utils/agenda';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
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
  onScrollBeginDrag?: () => void;
}

export interface AgendaListRef {
  scrollToDate: (dateKey: string) => void;
}

type FlatListItem =
  | { type: 'header'; dateLabel: string; dateKey: string }
  | { type: 'item'; data: AgendaItem }
  | { type: 'empty'; dateKey: string };

export const AgendaList = forwardRef<AgendaListRef, AgendaListProps>(
  ({ items = [], onActiveHeaderChange, onScrollBeginDrag }, ref) => {
  console.log('[AgendaList] Re-render, items:', items.length);
  const { colors } = useTheme();
  const lastActiveHeaderRef = useRef<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const flatData = useMemo(() => {
    // Constantes de altura fixas (definidas nos componentes)
    const HEADER_HEIGHT = 36;
    const EMPTY_HEIGHT = 46;
    const ITEM_HEIGHT = 82;

    // Gera todos os 49 dias das 7 semanas
    const days = generateCalendarDays();
    const result: FlatListItem[] = [];
    const stickyIndices: number[] = [];
    const dateKeyToIndexMap = new Map<string, number>();
    const itemLayouts: { length: number; offset: number; index: number }[] = [];

    let currentOffset = 0;

    // Cria estrutura flat com header para cada dia + pré-calcula layouts
    days.forEach((day, dayIndex) => {
      const dayLabel = `${day.dayName}, ${day.dayNumber} ${day.date.toLocaleDateString('pt-BR', { month: 'long' }).replace('.', '')}`.toUpperCase();

      dateKeyToIndexMap.set(day.dateKey, dayIndex);

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

    return { flatData: result, stickyIndices, dateKeyToIndexMap, itemLayouts };
  }, [items]);

  // Expõe métodos para o componente pai
  useImperativeHandle(ref, () => ({
    scrollToDate: (dateKey: string) => {
      const headerIndex = flatData.flatData.findIndex(
        item => item.type === 'header' && item.dateKey === dateKey
      );

      if (headerIndex === -1) {
        console.warn('[AgendaList] dateKey não encontrado:', dateKey);
        return;
      }

      const offset = flatData.itemLayouts[headerIndex]?.offset ?? 0;

      console.log('[AgendaList] Scrollando para:', dateKey, 'offset:', offset);
      
      flatListRef.current?.scrollToOffset({ offset, animated: true });
    },
  }), [flatData.flatData, flatData.itemLayouts]);

  const renderItem = ({ item }: { item: FlatListItem }) => {
    if (item.type === 'header') {
      return (
        <View
          style={{ 
            height: 36,
            backgroundColor: colors.screenBackground,
            justifyContent: 'center',
            paddingHorizontal: 16,
          }}
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
        <View 
          style={{ 
            height: 46,
            justifyContent: 'center',
            paddingHorizontal: 16,
          }}
        >
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
      <View style={{ height: 82 }}>
        <ListItem
          title={item.data.title}
          subtitle={item.data.subtitle}
          onPress={() => console.log('Item clicado:', item.data.id)}
        />
      </View>
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

  // getItemLayout para scroll eficiente - usa layouts pré-calculados O(1)
  const getItemLayout = useCallback(
    (_: any, index: number) => {
      return flatData.itemLayouts[index] || { length: 0, offset: 0, index };
    },
    [flatData.itemLayouts]
  );

  return (
    <FlatList
      ref={flatListRef}
      data={flatData.flatData}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.type}-${index}`}
      getItemLayout={getItemLayout}
      stickyHeaderIndices={flatData.stickyIndices}
      contentContainerStyle={{ paddingBottom: 24 }}
      viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
      onScrollBeginDrag={onScrollBeginDrag}
    />
  );
});
