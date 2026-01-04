import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { Client } from '@/types/client';
import { Text, TouchableOpacity, View } from 'react-native';

interface ClienteCardProps {
  cliente: Client;
  onPress: () => void;
}

export function ClienteCard({ cliente, onPress }: ClienteCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View
        className="rounded-lg p-4 mb-3 shadow-sm"
        style={{ backgroundColor: colors.cardBackground }}
      >
        {/* Header */}
        <View className="mb-2">
          <Text className="text-lg font-semibold" style={{ color: colors.cardTextPrimary }}>
            {cliente.nome}
          </Text>
        </View>

        {cliente.cpf_cnpj && (
          <Text className="text-sm mt-1" style={{ color: colors.cardTextSecondary }}>
            CPF/CNPJ: {cliente.cpf_cnpj}
          </Text>
        )}

        <View
          className="flex-row justify-between items-center mt-3 pt-3 border-t"
          style={{ borderTopColor: colors.cardBorder }}
        >
          <View>
            <Text className="text-xs" style={{ color: colors.cardTextSecondary }}>
              Plano
            </Text>
            <Text className="text-sm font-medium" style={{ color: colors.cardTextPrimary }}>
              {cliente.plano}
            </Text>
          </View>

          <View className="flex-row gap-2">
            <Badge
              label={cliente.cli_ativado === 's' ? 'Ativo' : 'Inativo'}
              color={cliente.cli_ativado === 's' ? 'green' : 'gray'}
              variant="outline"
              bold={false}
            />
            <Badge
              label={cliente.bloqueado === 'sim' ? 'Bloqueado' : 'Desbloqueado'}
              color={cliente.bloqueado === 'sim' ? 'red' : 'blue'}
              variant="outline"
              bold={false}
            />
          </View>

          {cliente.celular && (
            <View>
              <Text className="text-xs" style={{ color: colors.cardTextSecondary }}>
                Contato
              </Text>
              <Text className="text-sm" style={{ color: colors.cardTextPrimary }}>
                {cliente.celular}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
