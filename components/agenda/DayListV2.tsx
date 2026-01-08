import { useTheme } from '@/contexts/ThemeContext';
import { FlatListItem, useFlatAgendaData } from '@/hooks/agenda/useFlatAgendaData';
import { FlatList, Text, View } from 'react-native';
import { ListItem } from './ListItem';

interface AgendaItem {
  id: string;
  title: string;
  subtitle?: string;
  dateKey: string;
}

interface DayListV2Props {
  items?: AgendaItem[];
  dateKey: string;
}

export function DayListV2({ items = [], dateKey }: DayListV2Props) {
  console.log('[DayListV2] Re-render, items:', items.length, 'dateKey:', dateKey);
  const { colors } = useTheme();

  // Hook transforma os dados (apenas 1 dia)
  const { flatData, itemLayouts } = useFlatAgendaData(items, [dateKey]);

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

  const getItemLayout = (_: any, index: number) => {
    return itemLayouts[index] || { length: 0, offset: 0, index };
  };

  return (
    <FlatList
      data={flatData}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.type}-${index}`}
      getItemLayout={getItemLayout}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}
