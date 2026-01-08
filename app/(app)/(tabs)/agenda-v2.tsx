import { CollapsedCalendarV2 } from '@/components/agenda/CollapsedCalendarV2';
import { useTheme } from '@/contexts/ThemeContext';
import { View } from 'react-native';

// Mock data para testar
const mockItems = [
  { id: '1', title: 'Chamado #1234', subtitle: 'Cliente: João Silva', dateKey: '2026-01-07' },
  { id: '2', title: 'Instalação #5678', subtitle: 'Cliente: Maria Santos', dateKey: '2026-01-08' },
  { id: '3', title: 'Chamado #9012', subtitle: 'Cliente: Pedro Costa', dateKey: '2026-01-15' },
  { id: '4', title: 'Instalação #3456', subtitle: 'Cliente: Ana Lima', dateKey: '2026-01-15' },
];

export default function AgendaV2Screen() {
  const { colors } = useTheme();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.screenBackground }}>
      <View style={{ backgroundColor: colors.cardBackground }}>
        <CollapsedCalendarV2 />
      </View>
    </View>
  );
}
