import { useTheme } from '@/contexts/ThemeContext';
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
  const { colors, theme } = useTheme();

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
        const isSelected = currentTecnico === item.nome;

        return (
          <TouchableOpacity
            onPress={() => onSelect(item)}
            disabled={isAnyUpdating}
            style={{ 
              backgroundColor: isSelected 
                ? (theme === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5')
                : colors.searchInputBackground,
              borderColor: isSelected 
                ? (theme === 'dark' ? 'rgba(16, 185, 129, 0.4)' : '#a7f3d0')
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
                {item.cargo && (
                  <Text style={{ color: colors.cardTextSecondary }} className="text-sm mb-1">
                    {item.cargo}
                  </Text>
                )}
                <View className="flex-row items-center gap-4 flex-wrap">
                  {item.email && (
                    <View className="flex-row items-center">
                      <Ionicons name="mail-outline" size={14} color={colors.cardTextSecondary} />
                      <Text style={{ color: colors.cardTextSecondary }} className="text-xs ml-1" numberOfLines={1}>
                        {item.email}
                      </Text>
                    </View>
                  )}
                  {item.celular && (
                    <View className="flex-row items-center">
                      <Ionicons name="call-outline" size={14} color={colors.cardTextSecondary} />
                      <Text style={{ color: colors.cardTextSecondary }} className="text-xs ml-1" numberOfLines={1}>
                        {item.celular}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              {isUpdating ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <Ionicons
                  name={isSelected ? "checkmark-circle" : "chevron-forward"}
                  size={24}
                  color={isSelected ? "#10b981" : colors.cardTextSecondary}
                />
              )}
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}
