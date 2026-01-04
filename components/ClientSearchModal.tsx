import { useTheme } from '@/contexts/ThemeContext';
import { useClients } from '@/hooks/cliente';
import { Client } from '@/types/client';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ClientSearchModalProps {
  visible: boolean;
  onClose: () => void;
  initialSearchQuery: string;
}

export function ClientSearchModal({
  visible,
  onClose,
  initialSearchQuery,
}: ClientSearchModalProps) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const { data, isLoading, isError } = useClients();

  // Reset search query when modal opens
  useEffect(() => {
    if (visible) {
      setSearchQuery(initialSearchQuery);
    }
  }, [visible, initialSearchQuery]);

  // Filter clients based on search query
  const results = useMemo(() => {
    if (!data || !searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    
    return data
      .filter((client: Client) => {
        const nome = client.nome.toLowerCase();
        const login = client.login.toLowerCase();
        const cpf = client.cpf_cnpj.replace(/\D/g, ''); // Remove non-digits
        const searchCpf = query.replace(/\D/g, '');

        // Match by name, login, or CPF
        return (
          nome.includes(query) ||
          login.includes(query) ||
          (searchCpf && cpf.includes(searchCpf))
        );
      })
      .slice(0, 15); // Limit to top 15 results
  }, [searchQuery, data]);

  // Calculate match score for sorting (exact matches first)
  const sortedResults = useMemo(() => {
    if (!results.length) return [];

    const query = searchQuery.toLowerCase().trim();

    return [...results].sort((a, b) => {
      const aName = a.nome.toLowerCase();
      const bName = b.nome.toLowerCase();

      // Exact match first
      if (aName === query) return -1;
      if (bName === query) return 1;

      // Starts with query
      if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
      if (bName.startsWith(query) && !aName.startsWith(query)) return 1;

      // Alphabetical
      return aName.localeCompare(bName);
    });
  }, [results, searchQuery]);

  const handleSelectClient = (client: Client) => {
    onClose();
    // Small delay to allow modal to close before navigation
    setTimeout(() => {
      router.push(`/detalhes/cliente/${client.uuid}`);
    }, 100);
  };

  const renderClientItem = ({ item }: { item: Client }) => {
    const isExactMatch = item.nome.toLowerCase() === searchQuery.toLowerCase().trim();

    return (
      <TouchableOpacity
        onPress={() => handleSelectClient(item)}
        className="p-4"
        style={{ backgroundColor: colors.cardBackground, borderBottomWidth: 1, borderBottomColor: colors.cardBorder }}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text 
                className={`${isExactMatch ? 'font-bold' : 'font-semibold'} text-base`}
                style={{ color: colors.cardTextPrimary }}
              >
                {item.nome}
              </Text>
              {isExactMatch && (
                <View className="bg-blue-100 px-2 py-0.5 rounded">
                  <Text className="text-blue-800 text-xs font-semibold">Match exato</Text>
                </View>
              )}
            </View>
            <Text className="text-sm mb-1" style={{ color: colors.cardTextSecondary }}>
              CPF: {item.cpf_cnpj}
            </Text>
            <Text className="text-xs" style={{ color: colors.cardTextSecondary }}>
              Login: {item.login} • {item.plano || 'Sem plano'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.cardTextSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.screenBackground }} edges={['top']}>
        {/* Header */}
        <View 
          className="px-4 py-3"
          style={{ backgroundColor: colors.headerBackground, borderBottomWidth: 1, borderBottomColor: colors.headerBorder }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text 
              className="text-xl font-bold"
              style={{ color: colors.headerText }}
            >
              Buscar Cliente
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
              <Ionicons name="close" size={24} color={colors.cardTextSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View 
            className="flex-row items-center rounded-lg px-3 py-2"
            style={{ backgroundColor: colors.searchInputBackground }}
          >
            <Ionicons name="search" size={20} color={colors.cardTextSecondary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Nome, login ou CPF..."
              placeholderTextColor={colors.cardTextSecondary}
              className="flex-1 ml-2 text-base"
              style={{ color: colors.cardTextPrimary }}
              autoFocus
              autoCapitalize="words"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
                <Ionicons name="close-circle" size={20} color={colors.cardTextSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        <View className="flex-1">
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={colors.tabBarActiveTint} />
              <Text className="mt-4" style={{ color: colors.cardTextSecondary }}>Carregando clientes...</Text>
            </View>
          ) : isError ? (
            <View className="flex-1 items-center justify-center p-4">
              <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
              <Text className="mt-4 text-red-600 text-lg font-semibold">Erro ao carregar</Text>
              <Text className="mt-2 text-center" style={{ color: colors.cardTextSecondary }}>
                Não foi possível carregar a lista de clientes
              </Text>
            </View>
          ) : !searchQuery.trim() ? (
            <View className="flex-1 items-center justify-center p-4">
              <Ionicons name="search-outline" size={48} color={colors.cardTextSecondary} />
              <Text className="mt-4 text-center" style={{ color: colors.cardTextSecondary }}>
                Digite o nome, login ou CPF do cliente para buscar
              </Text>
            </View>
          ) : sortedResults.length === 0 ? (
            <View className="flex-1 items-center justify-center p-4">
              <Ionicons name="information-circle-outline" size={48} color={colors.cardTextSecondary} />
              <Text className="mt-4 font-semibold" style={{ color: colors.cardTextSecondary }}>Nenhum resultado encontrado</Text>
              <Text className="mt-2 text-center" style={{ color: colors.cardTextSecondary }}>
                Tente buscar por nome completo, login ou CPF
              </Text>
            </View>
          ) : (
            <>
              {/* Results Header */}
              <View 
                className="px-4 py-2"
                style={{ backgroundColor: colors.searchInputBackground, borderBottomWidth: 1, borderBottomColor: colors.cardBorder }}
              >
                <Text className="text-sm font-medium" style={{ color: colors.cardTextSecondary }}>
                  {sortedResults.length} {sortedResults.length === 1 ? 'resultado' : 'resultados'}
                </Text>
              </View>

              {/* Results List */}
              <FlatList
                data={sortedResults}
                keyExtractor={(item) => item.uuid}
                renderItem={renderClientItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={true}
              />
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
