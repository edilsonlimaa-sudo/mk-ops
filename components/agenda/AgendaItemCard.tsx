import { useTheme } from '@/contexts/ThemeContext';
import { ServicoAgenda } from '@/types/agenda';
import { Chamado } from '@/types/chamado';
import { Instalacao } from '@/types/instalacao';
import { isChamado } from '@/utils/agenda';
import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface AgendaItemCardProps {
  item: ServicoAgenda;
  onPress: () => void;
}

/**
 * Card da agenda - design clean com suporte a tema
 */
export const AgendaItemCard = memo(function AgendaItemCard({ item, onPress }: AgendaItemCardProps) {
  const { colors } = useTheme();
  const isChamadoItem = isChamado(item);
  const chamado = isChamadoItem ? (item as Chamado) : null;
  const instalacao = !isChamadoItem ? (item as Instalacao) : null;

  const concluido = isChamadoItem
    ? chamado?.status === 'fechado'
    : instalacao?.instalado === 'sim';

  const nome = item.nome || 'Cliente não identificado';
  const assunto = isChamadoItem
    ? chamado?.assunto || 'Suporte técnico'
    : instalacao?.plano || 'Nova instalação';

  // Dados extras para contexto
  const bairro = instalacao?.bairro || null;
  const telefone = instalacao?.telefone || instalacao?.celular || null;
  const prioridade = chamado?.prioridade || null;

  const getHoraVisita = () => {
    if (!item.visita) return '--:--';
    try {
      const data = new Date(item.visita.replace(' ', 'T'));
      return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };
  const hora = getHoraVisita();

  // Card concluído - mesmo layout, cores mais visíveis
  if (concluido) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
        <View 
          className="rounded-xl p-3 flex-row items-center shadow-sm"
          style={{ backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.cardBorder }}
        >
          {/* Indicator lateral verde */}
          <View className="w-1 h-12 rounded-full mr-3 bg-green-500" />

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-center flex-wrap mb-0.5 gap-2">
              <Text className="text-xs font-semibold text-green-600">
                ✓ {isChamadoItem ? 'CHAMADO' : 'INSTALAÇÃO'}
              </Text>
              {isChamadoItem && prioridade && (
                <View 
                  className="px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: colors.searchInputBackground }}
                >
                  <Text className="text-xs font-medium" style={{ color: colors.cardTextSecondary }}>
                    {prioridade.toUpperCase()}
                  </Text>
                </View>
              )}
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={12} color={colors.cardTextSecondary} />
                <Text className="text-xs ml-1" style={{ color: colors.cardTextSecondary }}>{hora}</Text>
              </View>
            </View>

            <Text 
              className="text-base font-medium line-through" 
              style={{ color: colors.cardTextSecondary }}
              numberOfLines={1}
            >
              {nome}
            </Text>

            <Text 
              className="text-sm mt-0.5 line-through" 
              style={{ color: colors.cardTextSecondary, opacity: 0.7 }}
              numberOfLines={1}
            >
              {assunto}
            </Text>

            {/* Info extra - bairro e telefone */}
            <View className="flex-row items-center mt-1 flex-wrap gap-3">
              {bairro && (
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={12} color={colors.cardTextSecondary} style={{ opacity: 0.6 }} />
                  <Text className="text-xs ml-1" style={{ color: colors.cardTextSecondary, opacity: 0.6 }}>{bairro}</Text>
                </View>
              )}
              {telefone && (
                <View className="flex-row items-center">
                  <Ionicons name="call-outline" size={12} color={colors.cardTextSecondary} style={{ opacity: 0.6 }} />
                  <Text className="text-xs ml-1" style={{ color: colors.cardTextSecondary, opacity: 0.6 }}>{telefone}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Chevron */}
          <Ionicons name="chevron-forward" size={20} color={colors.cardTextSecondary} style={{ opacity: 0.5 }} />
        </View>
      </TouchableOpacity>
    );
  }

  // Card pendente - destaque
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
      <View 
        className="rounded-xl p-3 flex-row items-center shadow-sm"
        style={{ backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.cardBorder }}
      >
        {/* Indicator lateral colorido */}
        <View className={`w-1 h-12 rounded-full mr-3 ${isChamadoItem ? 'bg-blue-500' : 'bg-violet-500'}`} />

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center flex-wrap mb-0.5 gap-2">
            <Text className={`text-xs font-semibold ${isChamadoItem ? 'text-blue-600' : 'text-violet-600'}`}>
              {isChamadoItem ? 'CHAMADO' : 'INSTALAÇÃO'}
            </Text>
            {isChamadoItem && prioridade && (
              <View className={`px-1.5 py-0.5 rounded ${
                prioridade === 'urgente' ? 'bg-red-100' : 
                prioridade === 'alta' ? 'bg-orange-100' : ''
              }`} style={prioridade === 'normal' ? { backgroundColor: colors.searchInputBackground } : {}}>
                <Text className={`text-xs font-medium ${
                  prioridade === 'urgente' ? 'text-red-600' : 
                  prioridade === 'alta' ? 'text-orange-600' : ''
                }`} style={prioridade === 'normal' ? { color: colors.cardTextSecondary } : {}}>
                  {prioridade.toUpperCase()}
                </Text>
              </View>
            )}
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={12} color={colors.cardTextSecondary} />
              <Text className="text-xs ml-1" style={{ color: colors.cardTextSecondary }}>{hora}</Text>
            </View>
          </View>
          
          <Text 
            className="text-base font-semibold" 
            style={{ color: colors.cardTextPrimary }}
            numberOfLines={1}
          >
            {nome}
          </Text>
          
          <Text 
            className="text-sm mt-0.5" 
            style={{ color: colors.cardTextSecondary }}
            numberOfLines={1}
          >
            {assunto}
          </Text>

          {/* Info extra - bairro e telefone */}
          <View className="flex-row items-center mt-1 flex-wrap gap-3">
            {bairro && (
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={12} color={colors.cardTextSecondary} />
                <Text className="text-xs ml-1" style={{ color: colors.cardTextSecondary }}>{bairro}</Text>
              </View>
            )}
            {telefone && (
              <View className="flex-row items-center">
                <Ionicons name="call-outline" size={12} color={colors.cardTextSecondary} />
                <Text className="text-xs ml-1" style={{ color: colors.cardTextSecondary }}>{telefone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={20} color={colors.cardTextSecondary} style={{ opacity: 0.5 }} />
      </View>
    </TouchableOpacity>
  );
});
