import { useTheme } from '@/contexts/ThemeContext';
import { generateCalendarDays, getTodayDateKey } from '@/utils/agenda';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { Animated, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_WIDTH = SCREEN_WIDTH / 7;

export interface CollapsedCalendarV2Ref {
  setActiveDateAnimated: (dateKey: string) => void;
  setActiveDateInstant: (dateKey: string) => void;
}

interface CollapsedCalendarV2Props {
  onDayPress?: (dateKey: string) => void;
}

export const CollapsedCalendarV2 = forwardRef<CollapsedCalendarV2Ref, CollapsedCalendarV2Props>(
  function CollapsedCalendarV2({ onDayPress }, ref) {
    console.log('[CollapsedCalendarV2] Re-render');
    const { colors } = useTheme();
    const scrollViewRef = useRef<ScrollView>(null);

    const days = useMemo(() => generateCalendarDays(), []);

    // Bolinha começa no dia de hoje
    const todayDateKey = getTodayDateKey();
    const todayIndex = days.findIndex(d => d.dateKey === todayDateKey);
    const initialX = todayIndex !== -1 ? (todayIndex * DAY_WIDTH) + (DAY_WIDTH / 2) - 16 : 0;
    const bolinhaX = useRef(new Animated.Value(initialX)).current;

    // Lógica compartilhada de scroll
    const scrollToDate = (dateKey: string, animated: boolean) => {
      const dayIndex = days.findIndex(d => d.dateKey === dateKey);
      if (dayIndex === -1) {
        console.warn('[CollapsedCalendarV2] dateKey não encontrado:', dateKey);
        return;
      }

      const weekIndex = Math.floor(dayIndex / 7);
      const offset = weekIndex * SCREEN_WIDTH;
      scrollViewRef.current?.scrollTo({ x: offset, animated });
    };

    // Lógica compartilhada de movimentação da bolinha
    const setActiveDay = (dateKey: string, animated: boolean) => {
      const dayIndex = days.findIndex(d => d.dateKey === dateKey);
      if (dayIndex === -1) return;

      const x = (dayIndex * DAY_WIDTH) + (DAY_WIDTH / 2) - 16;

      Animated.timing(bolinhaX, {
        toValue: x,
        duration: animated ? 150 : 0,
        useNativeDriver: true,
      }).start();
    };

    // Lógica de alto nível: define active date (scrolla + bolinha)
    const setActiveDate = (dateKey: string, animated: boolean) => {
      scrollToDate(dateKey, animated);
      setActiveDay(dateKey, animated);
    };

    // Expõe métodos explícitos para o parent
    useImperativeHandle(ref, () => ({
      setActiveDateAnimated: (dateKey: string) => {
        console.log('[CollapsedCalendarV2] setActiveDateAnimated:', dateKey);
        setActiveDate(dateKey, true);
      },
      setActiveDateInstant: (dateKey: string) => {
        console.log('[CollapsedCalendarV2] setActiveDateInstant:', dateKey);
        setActiveDate(dateKey, false);
      },
    }), [days, bolinhaX]);

    const handleDayPress = (dateKey: string) => {
      console.log('[CollapsedCalendarV2] Dia clicado:', dateKey);
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
              {days.map((day) => {
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
  },
);
