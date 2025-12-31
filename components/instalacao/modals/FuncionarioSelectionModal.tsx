import { Funcionario } from '@/types/funcionario';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SelectionModal } from '../SelectionModal';

interface FuncionarioSelectionModalProps {
  visible: boolean;
  funcionarios: Funcionario[] | undefined;
  isLoading: boolean;
  currentTecnico: string | null;
  updatingItemId: string | null;
  onSelect: (funcionario: Funcionario) => void;
  onClose: () => void;
}

export function FuncionarioSelectionModal({
  visible,
  funcionarios,
  isLoading,
  currentTecnico,
  updatingItemId,
  onSelect,
  onClose,
}: FuncionarioSelectionModalProps) {
  return (
    <SelectionModal
      visible={visible}
      onClose={onClose}
      title="Selecionar Técnico"
      data={funcionarios}
      isLoading={isLoading}
      keyExtractor={(item) => item.uuid_func}
      emptyMessage="Nenhum funcionário disponível"
      renderItem={({ item }) => {
        const isUpdating = updatingItemId === item.uuid_func;
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
                {item.cargo && (
                  <Text className="text-sm text-gray-600 mb-1">
                    {item.cargo}
                  </Text>
                )}
                <View className="flex-row items-center gap-4 flex-wrap">
                  {item.email && (
                    <View className="flex-row items-center">
                      <Ionicons name="mail-outline" size={14} color="#6b7280" />
                      <Text className="text-xs text-gray-600 ml-1" numberOfLines={1}>
                        {item.email}
                      </Text>
                    </View>
                  )}
                  {item.celular && (
                    <View className="flex-row items-center">
                      <Ionicons name="call-outline" size={14} color="#6b7280" />
                      <Text className="text-xs text-gray-600 ml-1" numberOfLines={1}>
                        {item.celular}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              {isUpdating ? (
                <ActivityIndicator size="small" color="#9333ea" />
              ) : (
                <Ionicons
                  name={currentTecnico === item.nome ? "checkmark-circle" : "chevron-forward"}
                  size={24}
                  color={currentTecnico === item.nome ? "#10b981" : "#9ca3af"}
                />
              )}
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}
