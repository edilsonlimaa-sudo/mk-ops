import { useTheme } from '@/contexts/ThemeContext';
import { FlatListItem, useFlatAgendaData } from '@/hooks/agenda/useFlatAgendaData';
import { generateCalendarDays } from '@/utils/agenda';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { FlatList, Text, View } from 'react-native';
import { ListItem } from './ListItem';

interface AgendaItem {
  id: string;
  title: string;
  subtitle?: string;
  dateKey: string;
  isChamado?: boolean;
  isConcluido?: boolean;
  horario?: string;
}

interface AgendaListV2Props {
  items?: AgendaItem[];
  initialDateKey?: string;
  onActiveHeaderChange?: (dateKey: string) => void;
  onItemPress?: (item: AgendaItem) => void;
}

export interface AgendaListV2Ref {
  setActiveDateAnimated: (dateKey: string) => void;
  setActiveDateInstant: (dateKey: string) => void;
  getIndexForDate: (dateKey: string) => number;
}

export const AgendaListV2 = forwardRef<AgendaListV2Ref, AgendaListV2Props>(({ items = [], initialDateKey, onActiveHeaderChange, onItemPress }, ref) => {
  console.log('[AgendaListV2] Re-render, items:', items.length);
  const { colors } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const lastEmittedDateKeyRef = useRef<string | null>(null);

  // Gera todos os dateKeys (modo agenda = 90 dias)
  const dateKeys = useMemo(() => generateCalendarDays().map(d => d.dateKey), []);

  // Hook transforma os dados
  const { flatData, stickyIndices, itemLayouts } = useFlatAgendaData(items, dateKeys);

  // Calcula initialScrollIndex antes da renderização
  const initialScrollIndex = useMemo(() => {
    if (!initialDateKey) return undefined;
    const index = flatData.findIndex(item => item.type === 'header' && item.dateKey === initialDateKey);
    return index >= 0 ? index : undefined;
  }, [flatData, initialDateKey]);

  // Expõe métodos imperativos
  useImperativeHandle(ref, () => ({
    setActiveDateAnimated: (dateKey: string) => {
      scrollToDate(dateKey, true);
    },
    setActiveDateInstant: (dateKey: string) => {
      scrollToDate(dateKey, false);
    },
    getIndexForDate: (dateKey: string) => {
      const index = flatData.findIndex(item => item.type === 'header' && item.dateKey === dateKey);
      return index >= 0 ? index : -1;
    },
  }), [flatData, itemLayouts]);

  const scrollToDate = (dateKey: string, animated: boolean) => {
    const headerIndex = flatData.findIndex(
      item => item.type === 'header' && item.dateKey === dateKey
    );

    if (headerIndex === -1) {
      console.warn('[AgendaListV2] dateKey não encontrado:', dateKey);
      return;
    }

    const offset = itemLayouts[headerIndex]?.offset ?? 0;
    flatListRef.current?.scrollToOffset({ offset, animated });
  };

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
      <View style={{ height: 132 }}>
        <ListItem
          title={item.data.title}
          subtitle={item.data.subtitle}
          isChamado={item.data.isChamado}
          isConcluido={item.data.isConcluido}
          horario={item.data.horario}
          onPress={() => onItemPress?.(item.data)}
        />
      </View>
    );
  };

  const getItemLayout = (_: any, index: number) => {
    return itemLayouts[index] || { length: 0, offset: 0, index };
  };

  const handleScroll = ({ nativeEvent }: any) => {
    if (!onActiveHeaderChange) return;

    const scrollY = nativeEvent.contentOffset.y;

    // Encontra qual header está ativo baseado no scroll position
    let activeDateKey: string | null = null;

    // Percorre os headers de trás pra frente para encontrar o último que passou
    for (let i = flatData.length - 1; i >= 0; i--) {
      const item = flatData[i];
      if (item.type === 'header' && item.dateKey) {
        const layout = itemLayouts[i];
        if (layout && layout.offset <= scrollY) {
          activeDateKey = item.dateKey;
          break;
        }
      }
    }

    // Só notifica se o dateKey realmente mudou
    if (activeDateKey && lastEmittedDateKeyRef.current !== activeDateKey) {
      lastEmittedDateKeyRef.current = activeDateKey;
      onActiveHeaderChange(activeDateKey);
    }
  };

  return (
    <FlatList
      ref={flatListRef}
      data={flatData}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.type}-${index}`}
      getItemLayout={getItemLayout}
      initialScrollIndex={initialScrollIndex}
      stickyHeaderIndices={stickyIndices}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
});
