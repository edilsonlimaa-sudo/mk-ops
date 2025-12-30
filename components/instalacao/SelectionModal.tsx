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
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-base font-bold text-gray-800">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-500 mt-2">Carregando...</Text>
            </View>
          ) : !data || data.length === 0 ? (
            <View className="py-8 items-center">
              <Ionicons name="alert-circle-outline" size={48} color="#9ca3af" />
              <Text className="text-gray-500 mt-2">{emptyMessage}</Text>
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
