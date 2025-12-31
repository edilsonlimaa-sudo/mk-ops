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

        return (
          <TouchableOpacity
            onPress={() => onSelect(item)}
            disabled={isAnyUpdating}
            className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200 active:bg-gray-100"
            style={{ opacity: isAnyUpdating && !isUpdating ? 0.5 : 1 }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-800 mb-1">
                  {item.nome}
                </Text>
                {item.descricao && (
                  <Text className="text-sm text-gray-600 mb-2">
                    {item.descricao}
                  </Text>
                )}
                <View className="flex-row items-center gap-4">
                  <View className="flex-row items-center">
                    <Ionicons name="arrow-down-circle" size={16} color="#9333ea" />
                    <Text className="text-xs text-gray-600 ml-1">
                      {item.veldown} Mbps
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="arrow-up-circle" size={16} color="#a855f7" />
                    <Text className="text-xs text-gray-600 ml-1">
                      {item.velup} Mbps
                    </Text>
                  </View>
                  <Text className="text-sm font-bold text-purple-600">
                    R$ {item.valor}
                  </Text>
                </View>
              </View>
              {isUpdating ? (
                <ActivityIndicator size="small" color="#9333ea" />
              ) : (
                <Ionicons
                  name={currentPlano === item.nome ? "checkmark-circle" : "chevron-forward"}
                  size={24}
                  color={currentPlano === item.nome ? "#9333ea" : "#9ca3af"}
                />
              )}
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}
