import { useTheme } from '@/contexts/ThemeContext';
import { generateCalendarDays } from '@/utils/agenda';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { Animated, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_WIDTH = SCREEN_WIDTH / 7;

interface CollapsedCalendarProps {
  onDayPress?: (dateKey: string) => void;
}

export interface CollapsedCalendarRef {
  scrollToWeek: (weekIndex: number) => void;
  updateActiveDay: (dateKey: string) => void;
}

export const CollapsedCalendar = forwardRef<CollapsedCalendarRef, CollapsedCalendarProps>(
  function CollapsedCalendar({ onDayPress }, ref) {
    console.log('[CollapsedCalendar] Re-render');
    const { colors } = useTheme();
    const scrollViewRef = useRef<ScrollView>(null);
    const bolinhaX = useRef(new Animated.Value(0)).current;

    const days = useMemo(() => generateCalendarDays(), []);

    // Expõe métodos para o componente pai
    useImperativeHandle(ref, () => ({
      scrollToWeek: (weekIndex: number) => {
        const offset = weekIndex * SCREEN_WIDTH;
        scrollViewRef.current?.scrollTo({ x: offset, animated: true });
      },
      updateActiveDay: (dateKey: string) => {
        console.log('[CollapsedCalendar] updateActiveDay chamado (SEM re-render):', dateKey);
        const dayIndex = days.findIndex(d => d.dateKey === dateKey);
        if (dayIndex === -1) return;
        
        // Calcula posição X: centro do dia - metade da bolinha
        const x = (dayIndex * DAY_WIDTH) + (DAY_WIDTH / 2) - 16;
        
        console.log('[CollapsedCalendar] Movendo bolinha para x:', x, 'dayIndex:', dayIndex);
        
        Animated.timing(bolinhaX, {
          toValue: x,
          duration: 100, // Bolinha mais rápida que a paginação
          useNativeDriver: true,
        }).start();
      },
    }), [days, bolinhaX]);

  const handleDayPress = (dateKey: string) => {
    console.log('[CollapsedCalendar] Dia clicado:', dateKey);
    onDayPress?.(dateKey);
  };

  return (
    <View
      className="border-b"
      style={{
        backgroundColor: colors.cardBackground,
        borderBottomColor: colors.cardBorder,
      }}
    >
      {/* Cabeçalho fixo dos dias da semana */}
      <View className="flex-row pt-1">
        {WEEK_DAYS.map((dayName, index) => (
          <View
            key={index}
            className="items-center py-1"
            style={{ width: DAY_WIDTH }}
          >
            <Text
              className="text-[10px] font-medium"
              style={{ color: colors.cardTextSecondary }}
            >
              {dayName}
            </Text>
          </View>
        ))}
      </View>

      {/* ScrollView com os números dos dias */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
      >
        <View style={{ position: 'relative' }}>
          {/* Bolinha flutuante - scrolla junto com o conteúdo */}
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 4,
              left: 0,
              width: 32,
              height: 32,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: '#3b82f6',
              backgroundColor: 'transparent',
              zIndex: 10,
              transform: [{ translateX: bolinhaX }],
            }}
          />

          <View className="flex-row">
            {days.map((day, index) => {
              // Alterna background discreto entre meses
              const monthBg = day.month % 2 === 0
                ? 'transparent'
                : 'rgba(128, 128, 128, 0.06)'; // Cinza muito sutil

              return (
                <TouchableOpacity
                  key={day.dateKey}
                  activeOpacity={0.7}
                  onPress={() => handleDayPress(day.dateKey)}
                  className="items-center py-1.5"
                  style={{
                    width: DAY_WIDTH,
                    backgroundColor: monthBg,
                  }}
                >
                  <View className="w-8 h-8 justify-center items-center rounded-full">
                    <Text
                      className="text-[15px] font-normal"
                      style={{ color: colors.cardTextPrimary }}
                    >
                      {day.dayNumber}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
});
