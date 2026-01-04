import { useTheme } from '@/contexts/ThemeContext';
import { Plano } from '@/types/plano';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SelectionModal } from '../SelectionModal';

interface PlanoSelectionModalProps {
  visible: boolean;
  planos: Plano[] | undefined;
  isLoading: boolean;
  currentPlano: string | null;
  updatingItemId: string | null;
  onSelect: (plano: Plano) => void;
  onClose: () => void;
}

export function PlanoSelectionModal({
  visible,
  planos,
  isLoading,
  currentPlano,
  updatingItemId,
  onSelect,
  onClose,
}: PlanoSelectionModalProps) {
  const { colors, theme } = useTheme();

  return (
    <SelectionModal
      visible={visible}
      onClose={onClose}
      title="Selecionar Plano"
      data={planos}
      isLoading={isLoading}
      keyExtractor={(item) => item.uuid_plano}
      emptyMessage="Nenhum plano disponível"
      renderItem={({ item }) => {
        const isUpdating = updatingItemId === item.uuid_plano;
        const isAnyUpdating = updatingItemId !== null;
        const isSelected = currentPlano === item.nome;

        return (
          <TouchableOpacity
            onPress={() => onSelect(item)}
            disabled={isAnyUpdating}
            style={{ 
              backgroundColor: isSelected 
                ? (theme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff')
                : colors.searchInputBackground,
              borderColor: isSelected 
                ? (theme === 'dark' ? 'rgba(59, 130, 246, 0.4)' : '#bfdbfe')
                : colors.cardBorder,
              opacity: isAnyUpdating && !isUpdating ? 0.5 : 1 
            }}
            className="rounded-xl p-4 mb-3 border"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text style={{ color: colors.cardTextPrimary }} className="text-base font-bold mb-1">
                  {item.nome}
                </Text>
                {item.descricao && (
                  <Text style={{ color: colors.cardTextSecondary }} className="text-sm mb-2">
                    {item.descricao}
                  </Text>
                )}
                <View className="flex-row items-center gap-4">
                  <View className="flex-row items-center">
                    <Ionicons name="arrow-down-circle" size={16} color="#3b82f6" />
                    <Text style={{ color: colors.cardTextSecondary }} className="text-xs ml-1">
                      {item.veldown} Mbps
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="arrow-up-circle" size={16} color="#60a5fa" />
                    <Text style={{ color: colors.cardTextSecondary }} className="text-xs ml-1">
                      {item.velup} Mbps
                    </Text>
                  </View>
                  <Text style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }} className="text-sm font-bold">
                    R$ {item.valor}
                  </Text>
                </View>
              </View>
              {isUpdating ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <Ionicons
                  name={isSelected ? "checkmark-circle" : "chevron-forward"}
                  size={24}
                  color={isSelected ? "#3b82f6" : colors.cardTextSecondary}
                />
              )}
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}
