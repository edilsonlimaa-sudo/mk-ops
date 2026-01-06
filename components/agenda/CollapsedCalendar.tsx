import { useTheme } from '@/contexts/ThemeContext';
import { useAgendaCalendarStore } from '@/stores/useAgendaCalendarStore';
import {
    forwardRef,
    memo,
    useCallback,
    useImperativeHandle,
    useRef
} from 'react';
import { FlatList, InteractionManager, Text, TouchableOpacity, View } from 'react-native';

export interface CollapsedCalendarRef {
  scrollToToday: (animated?: boolean) => void;
  scrollToDate: (dateKey: string, animated?: boolean) => void;
}

// Mapa para lookup rápido de dateKey -> index
const DATE_KEY_TO_INDEX = new Map<string, number>();

interface CalendarDay {
  date: Date;
  dateKey: string;
  dayNumber: string;
  dayName: string;
  monthName: string;
  isToday: boolean;
  isPast: boolean;
  isFirstOfMonth: boolean;
}

interface CollapsedCalendarProps {
  onSelectDate: (dateKey: string) => void;
}

// Store setter fora do componente para evitar re-renders
const getSetSelectedDateKey = () => useAgendaCalendarStore.getState().setSelectedDateKey;

// Gera os 61 dias (D-30 a D+30)
const generateDays = (): CalendarDay[] => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const days: CalendarDay[] = [];
  let lastMonth = -1;

  for (let i = -30; i <= 30; i++) {
    const date = new Date(hoje);
    date.setDate(hoje.getDate() + i);

    const dateKey = date.toISOString().split('T')[0];
    const isToday = i === 0;
    const isPast = i < 0;
    const currentMonth = date.getMonth();
    const isFirstOfMonth = currentMonth !== lastMonth;
    lastMonth = currentMonth;

    const dayName = date
      .toLocaleDateString('pt-BR', { weekday: 'short' })
      .replace('.', '')
      .toUpperCase();

    const monthName = date
      .toLocaleDateString('pt-BR', { month: 'short' })
      .replace('.', '')
      .toUpperCase();

    days.push({
      date,
      dateKey,
      dayNumber: date.getDate().toString(),
      dayName,
      monthName,
      isToday,
      isPast,
      isFirstOfMonth,
    });
    
    // Popula mapa para lookup rápido
    DATE_KEY_TO_INDEX.set(dateKey, days.length - 1);
  }

  return days;
};

const DAYS = generateDays();
const TODAY_INDEX = 30;
const ITEM_WIDTH = 48;

// Componente que lê o estado do store para um dia específico
// Só re-renderiza quando esse dia específico muda de seleção
interface CalendarDayItemProps {
  item: CalendarDay;
  onPress: (dateKey: string) => void;
}

const CalendarDayItem = memo(function CalendarDayItem({
  item,
  onPress,
}: CalendarDayItemProps) {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Selector granular - só re-renderiza quando ESTE dia muda
  const isSelected = useAgendaCalendarStore(
    (state) => state.selectedDateKey === item.dateKey
  );

  const handlePress = useCallback(() => {
    // Atualiza store imediatamente (sem causar re-render do pai)
    getSetSelectedDateKey()(item.dateKey);
    // Usa InteractionManager para scroll após animações do tap
    InteractionManager.runAfterInteractions(() => {
      onPress(item.dateKey);
    });
  }, [item.dateKey, onPress]);

  // Cores baseadas no tema
  const accentColor = isDark ? '#60a5fa' : '#2563eb'; // blue-400 / blue-600
  const pastColor = colors.cardTextSecondary;
  const normalColor = colors.cardTextPrimary;
  const mutedColor = isDark ? '#64748b' : '#9ca3af'; // slate-500 / gray-400

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={{
        width: ITEM_WIDTH,
        alignItems: 'center',
        paddingVertical: 6,
      }}
    >
      {/* Dia da semana */}
      <Text
        style={{
          fontSize: 10,
          fontWeight: '500',
          color: isSelected ? accentColor : item.isPast ? mutedColor : colors.cardTextSecondary,
          marginBottom: 2,
        }}
      >
        {item.dayName}
      </Text>

      {/* Número do dia */}
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isSelected ? accentColor : 'transparent',
          // Hoje sem seleção: borda azul
          borderWidth: item.isToday && !isSelected ? 2 : 0,
          borderColor: accentColor,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: isSelected || item.isToday ? '600' : '400',
            color: isSelected
              ? '#ffffff'
              : item.isToday
              ? accentColor
              : item.isPast
              ? mutedColor
              : normalColor,
          }}
        >
          {item.dayNumber}
        </Text>
      </View>

      {/* Nome do mês - sempre visível */}
      <Text
        style={{
          fontSize: 9,
          fontWeight: item.isFirstOfMonth ? '700' : '500',
          color: item.isFirstOfMonth
            ? accentColor
            : isSelected
            ? accentColor
            : item.isPast
            ? (isDark ? '#475569' : '#d1d5db')
            : mutedColor,
          marginTop: 2,
        }}
      >
        {item.monthName}
      </Text>
    </TouchableOpacity>
  );
});

export const CollapsedCalendar = forwardRef<CollapsedCalendarRef, CollapsedCalendarProps>(
  function CollapsedCalendar({ onSelectDate }, ref) {
    const { colors } = useTheme();
    const flatListRef = useRef<FlatList>(null);

    // Expõe métodos para scroll externo
    useImperativeHandle(
      ref,
      () => ({
        scrollToToday: (animated = true) => {
          flatListRef.current?.scrollToIndex({
            index: TODAY_INDEX,
            animated,
            viewPosition: 0.5,
          });
        },
        scrollToDate: (dateKey: string, animated = true) => {
          const index = DATE_KEY_TO_INDEX.get(dateKey);
          if (index !== undefined) {
            flatListRef.current?.scrollToIndex({
              index,
              animated,
              viewPosition: 0.5,
            });
          }
        },
      }),
      []
    );

    // Não precisa de useEffect para scroll inicial
    // O initialScrollIndex da FlatList já faz isso

    const renderDay = useCallback(
      ({ item }: { item: CalendarDay }) => {
        return <CalendarDayItem item={item} onPress={onSelectDate} />;
      },
      [onSelectDate]
    );

    const getItemLayout = useCallback(
      (_: any, index: number) => ({
        length: ITEM_WIDTH,
        offset: ITEM_WIDTH * index,
        index,
      }),
      []
    );

    return (
      <View
        style={{
          backgroundColor: colors.cardBackground,
          borderBottomWidth: 1,
          borderBottomColor: colors.cardBorder,
          paddingVertical: 4,
        }}
      >
        <FlatList
          ref={flatListRef}
          data={DAYS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.dateKey}
          renderItem={renderDay}
          getItemLayout={getItemLayout}
          // contentOffset em vez de initialScrollIndex - posiciona instantaneamente sem animação
          contentOffset={{ x: TODAY_INDEX * ITEM_WIDTH - 100, y: 0 }}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={5}
          onScrollToIndexFailed={() => {
            // Fallback silencioso
          }}
        />
      </View>
    );
  }
);
