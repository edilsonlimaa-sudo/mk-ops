import { useTheme } from '@/contexts/ThemeContext';
import { generateCalendarDays } from '@/utils/agenda';
import { useMemo, useRef } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_WIDTH = SCREEN_WIDTH / 7;

export function CollapsedCalendarV2() {
  console.log('[CollapsedCalendarV2] Re-render');
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const days = useMemo(() => generateCalendarDays(), []);

  const handleDayPress = (dateKey: string) => {
    console.log('[CollapsedCalendarV2] Dia clicado:', dateKey);
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
      </ScrollView>
    </View>
  );
}
