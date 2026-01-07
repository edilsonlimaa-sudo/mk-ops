import { useTheme } from '@/contexts/ThemeContext';
import { generateCalendarDays } from '@/utils/agenda';
import { useMemo } from 'react';
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
}

type FlatListItem =
  | { type: 'header'; dateLabel: string; dateKey: string }
  | { type: 'item'; data: AgendaItem }
  | { type: 'empty'; dateKey: string };

export function AgendaList({ items = [] }: AgendaListProps) {
  const { colors } = useTheme();

  const flatData = useMemo(() => {
    // Gera todos os 49 dias das 7 semanas
    const days = generateCalendarDays();
    const result: FlatListItem[] = [];
    const stickyIndices: number[] = [];

    // Cria estrutura flat com header para cada dia
    days.forEach((day) => {
      const dayLabel = `${day.dayName}, ${day.dayNumber} ${day.date.toLocaleDateString('pt-BR', { month: 'long' }).replace('.', '')}`.toUpperCase();

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

    return { flatData: result, stickyIndices };
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

  return (
    <FlatList
      data={flatData.flatData}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.type}-${index}`}
      stickyHeaderIndices={flatData.stickyIndices}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}
