import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';

interface SelectionModalProps<T> {
  visible: boolean;
  onClose: () => void;
  title: string;
  data: T[] | undefined;
  isLoading: boolean;
  keyExtractor: (item: T) => string;
  renderItem: (info: { item: T; index: number }) => React.ReactElement;
  emptyMessage?: string;
}

export function SelectionModal<T>({
  visible,
  onClose,
  title,
  data,
  isLoading,
  keyExtractor,
  renderItem,
  emptyMessage = 'Nenhum item disponível',
}: SelectionModalProps<T>) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View 
          style={{ backgroundColor: colors.cardBackground, maxHeight: '80%' }} 
          className="rounded-t-3xl p-6"
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text style={{ color: colors.cardTextPrimary }} className="text-base font-bold">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.cardTextSecondary} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={{ color: colors.cardTextSecondary }} className="mt-2">Carregando...</Text>
            </View>
          ) : !data || data.length === 0 ? (
            <View className="py-8 items-center">
              <Ionicons name="alert-circle-outline" size={48} color={colors.cardTextSecondary} />
              <Text style={{ color: colors.cardTextSecondary }} className="mt-2">{emptyMessage}</Text>
            </View>
          ) : (
            <FlatList
              data={data}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              showsVerticalScrollIndicator={true}
              ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
