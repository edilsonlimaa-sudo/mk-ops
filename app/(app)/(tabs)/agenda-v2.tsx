import { useTheme } from '@/contexts/ThemeContext';
import { Text, View } from 'react-native';

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
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.screenBackground }}>
      <Text className="text-2xl font-bold" style={{ color: colors.cardText }}>
        Agenda V2
      </Text>
      <Text className="text-sm mt-2" style={{ color: colors.cardTextSecondary }}>
        Nova implementação com store silenciosa
      </Text>
    </View>
  );
}
