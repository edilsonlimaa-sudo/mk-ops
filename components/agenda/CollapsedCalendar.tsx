import { useTheme } from '@/contexts/ThemeContext';
import { useAgendaStore } from '@/stores/useAgendaStore';
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, InteractionManager, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface CalendarDay {
  date: Date;
  dateKey: string;
  dayNumber: string;
  dayName: string;
  dayOfWeek: number; // 0 = domingo, 6 = sábado
  isToday: boolean;
}

interface CollapsedCalendarProps {
  onSelectDate: (dateKey: string) => void;
}

export interface CollapsedCalendarRef {
  updateBolinhaFromScroll: (dateKey: string) => void;
}

// Gera todas as 9 semanas (61 dias: D-30 a D+30)
const generateAllWeeks = (): CalendarDay[][] => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const todayKey = hoje.toISOString().split('T')[0];
  
  const weeks: CalendarDay[][] = [];
  
  // Começa 30 dias antes de hoje
  const startDate = new Date(hoje);
  startDate.setDate(hoje.getDate() - 30);
  
  // Ajusta para o domingo da primeira semana
  const firstSunday = new Date(startDate);
  const dayOfWeek = startDate.getDay();
  firstSunday.setDate(startDate.getDate() - dayOfWeek);
  
  // Gera 9 semanas completas (63 dias, cobrindo os 61 + margem)
  for (let weekIndex = 0; weekIndex < 9; weekIndex++) {
    const weekDays: CalendarDay[] = [];
    
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const date = new Date(firstSunday);
      date.setDate(firstSunday.getDate() + (weekIndex * 7) + dayIndex);
      
      const dateKey = date.toISOString().split('T')[0];
      const isToday = dateKey === todayKey;
      
      const dayName = date
        .toLocaleDateString('pt-BR', { weekday: 'short' })
        .replace('.', '')
        .toUpperCase();
      
      weekDays.push({
        date,
        dateKey,
        dayNumber: date.getDate().toString(),
        dayName,
        dayOfWeek: dayIndex,
        isToday,
      });
    }
    
    weeks.push(weekDays);
  }
  
  return weeks;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = SCREEN_WIDTH / 7;

// Helper: encontra índice da semana que contém uma data
const findWeekIndex = (dateKey: string, allWeeks: CalendarDay[][]): number => {
  for (let i = 0; i < allWeeks.length; i++) {
    if (allWeeks[i].some(day => day.dateKey === dateKey)) {
      return i;
    }
  }
  return 0; // fallback para primeira semana
};

// Componente do dia
interface CalendarDayItemProps {
  item: CalendarDay;
  onPress: (dateKey: string) => void;
}

function CalendarDayItem({
  item,
  onPress,
}: CalendarDayItemProps) {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';

  const handlePress = useCallback(() => {
    // Atualiza store
    useAgendaStore.getState().selectDate(item.dateKey);
    // Usa InteractionManager para scroll após animações do tap
    InteractionManager.runAfterInteractions(() => {
      onPress(item.dateKey);
    });
  }, [item.dateKey, onPress]);

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
          color: colors.cardTextSecondary,
          marginBottom: 2,
        }}
      >
        {item.dayName}
      </Text>

      {/* Número do dia - SEM círculo (bolinha é overlay) */}
      <View
        style={{
          width: 32,
          height: 32,
          justifyContent: 'center',
          alignItems: 'center',
          // Hoje: borda azul
          borderWidth: item.isToday ? 2 : 0,
          borderColor: isDark ? '#60a5fa' : '#2563eb',
          borderRadius: 16,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: item.isToday ? '600' : '400',
            color: item.isToday
              ? (isDark ? '#60a5fa' : '#2563eb')
              : colors.cardTextPrimary,
          }}
        >
          {item.dayNumber}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const CollapsedCalendarComponent = forwardRef<CollapsedCalendarRef, CollapsedCalendarProps>(
  function CollapsedCalendar({ onSelectDate }, ref) {
    const t0 = performance.now();
    console.log('[CollapsedCalendar] Re-render INICIO');
    const { colors, theme } = useTheme();
    const isDark = theme === 'dark';
  
  // Não precisa mais observar selectedDateKey - bolinha atualiza via ref
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Gera todas as semanas uma única vez
  const allWeeks = useMemo(() => generateAllWeeks(), []);
  
  // Animated.Value para posição da bolinha (atualização instantânea via setValue)
  const bolinhaLeft = useRef(new Animated.Value(0)).current;
  const [dayNumber, setDayNumber] = useState<string>('');
  const lastUpdatedDateKey = useRef<string>('');
  
  // Ref para a semana atual (para animação rápida)
  const currentWeekIndexRef = useRef(4); // começa na semana central
  
  // Expõe método para atualização direta (sem esperar re-render)
  useImperativeHandle(ref, () => ({
    updateBolinhaFromScroll: (dateKey: string) => {
      // Guard: só atualiza se a data mudou
      if (lastUpdatedDateKey.current === dateKey) return;
      
      const t0 = performance.now();
      // Encontra índice absoluto do dia
      for (let weekIndex = 0; weekIndex < allWeeks.length; weekIndex++) {
        const dayIndexInWeek = allWeeks[weekIndex].findIndex(day => day.dateKey === dateKey);
        if (dayIndexInWeek !== -1) {
          lastUpdatedDateKey.current = dateKey;
          
          const absoluteIndex = weekIndex * 7 + dayIndexInWeek;
          const newLeft = (absoluteIndex * ITEM_WIDTH) + (ITEM_WIDTH - 32) / 2;
          
          bolinhaLeft.setValue(newLeft);
          
          const newDayNumber = allWeeks[weekIndex][dayIndexInWeek].dayNumber;
          setDayNumber(newDayNumber);
          
          // Scrolla calendário para a semana correta (só se mudou de semana)
          if (currentWeekIndexRef.current !== weekIndex) {
            currentWeekIndexRef.current = weekIndex;
            const weekOffset = weekIndex * SCREEN_WIDTH;
            // Usa animated: false para scroll instantâneo - mais rápido!
            scrollViewRef.current?.scrollTo({ x: weekOffset, animated: false });
          }
          
          const t1 = performance.now();
          console.log(`[Bolinha] setValue para ${dateKey} (index ${absoluteIndex}) em ${(t1 - t0).toFixed(2)}ms`);
          return;
        }
      }
    }
  }), [allWeeks, bolinhaLeft]);

  // Inicializa bolinha na data selecionada da store
  useEffect(() => {
    const selectedDateKey = useAgendaStore.getState().selectedDateKey;
    
    // Encontra índice absoluto
    for (let weekIndex = 0; weekIndex < allWeeks.length; weekIndex++) {
      const dayIndexInWeek = allWeeks[weekIndex].findIndex(day => day.dateKey === selectedDateKey);
      if (dayIndexInWeek !== -1) {
        const absoluteIndex = weekIndex * 7 + dayIndexInWeek;
        const newLeft = (absoluteIndex * ITEM_WIDTH) + (ITEM_WIDTH - 32) / 2;
        bolinhaLeft.setValue(newLeft);
        
        const newDayNumber = allWeeks[weekIndex][dayIndexInWeek].dayNumber;
        setDayNumber(newDayNumber);
        
        // Scrolla para a semana correta
        const weekOffset = weekIndex * SCREEN_WIDTH;
        scrollViewRef.current?.scrollTo({ x: weekOffset, animated: false });
        
        console.log(`[CollapsedCalendar] Inicializado em ${selectedDateKey} (semana ${weekIndex})`);
        return;
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const t1 = performance.now();
  console.log(`[CollapsedCalendar] Re-render FIM em ${(t1 - t0).toFixed(2)}ms`);

  return (
    <View
      style={{
        backgroundColor: colors.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder,
        paddingVertical: 4,
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={{ width: SCREEN_WIDTH * allWeeks.length }}
      >
        {/* Renderiza todas as semanas */}
        {allWeeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={{ width: SCREEN_WIDTH, flexDirection: 'row' }}>
            {week.map((day) => (
              <CalendarDayItem key={day.dateKey} item={day} onPress={onSelectDate} />
            ))}
          </View>
        ))}
        
        {/* Bolinha overlay - Animated.View com setValue (sem delay) */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 24,
            left: bolinhaLeft,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: isDark ? '#60a5fa' : '#2563eb',
          }}
        />
        
        {/* Número branco por cima */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 24,
            left: bolinhaLeft,
            width: 32,
            height: 32,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: '600',
              color: '#ffffff',
            }}
          >
            {dayNumber}
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
});

// Memoiza para evitar re-renders quando componente pai atualiza
export const CollapsedCalendar = memo(CollapsedCalendarComponent);
CollapsedCalendar.displayName = 'CollapsedCalendar';
