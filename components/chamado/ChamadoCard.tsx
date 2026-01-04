import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { Chamado } from '@/types/chamado';
import { Text, TouchableOpacity, View } from 'react-native';

interface ChamadoCardProps {
  chamado: Chamado;
  variant?: 'agenda' | 'historico';
  onPress: () => void;
}

/**
 * Formata data com hora
 */
function formatarDataHora(dataStr: string | null) {
  if (!dataStr) return null;

  try {
    const data = new Date(dataStr.replace(' ', 'T'));
    if (isNaN(data.getTime())) return null;

    const dataFormatada = data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
    const horaFormatada = data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return { data: dataFormatada, hora: horaFormatada, completo: `${dataFormatada} às ${horaFormatada}` };
  } catch {
    return null;
  }
}

export function ChamadoCard({ chamado, variant = 'agenda', onPress }: ChamadoCardProps) {
  const { colors } = useTheme();
  const isHistorico = variant === 'historico';
  
  const dataAbertura = formatarDataHora(chamado.abertura);
  const dataFechamento = formatarDataHora(chamado.fechamento);
  const dataVisita = chamado.visita ? formatarDataHora(chamado.visita) : null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View
        className="rounded-lg p-3 mb-2 shadow-sm"
        style={{ backgroundColor: colors.cardBackground }}
      >
        {/* Badge Chamado */}
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center gap-2">
            <Badge label="Chamado" color="blue" variant="outline" />
            <Badge
              label={(chamado.prioridade || 'Normal').charAt(0).toUpperCase() + (chamado.prioridade || 'Normal').slice(1)}
              color={
                chamado.prioridade === 'alta'
                  ? 'red'
                  : chamado.prioridade === 'media'
                  ? 'orange'
                  : 'green'
              }
              variant="solid"
            />
          </View>
          <Text className="text-xs font-mono" style={{ color: colors.cardTextSecondary }}>
            #{chamado.chamado}
          </Text>
        </View>

        {/* Cliente e Visita */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text
              className="text-sm font-bold"
              style={{ color: colors.cardTextPrimary }}
              numberOfLines={1}
            >
              {chamado.nome || 'Cliente não identificado'}
            </Text>
            {chamado.ramal && (
              <Text
                className="text-xs"
                style={{ color: colors.cardTextSecondary }}
                numberOfLines={1}
              >
                {chamado.ramal}
              </Text>
            )}
          </View>

          {!isHistorico && dataVisita && (
            <View
              className="px-2 py-1 rounded ml-2"
              style={{ backgroundColor: colors.searchInputBackground }}
            >
              <Text className="text-xs font-bold" style={{ color: colors.cardTextPrimary }}>
                {dataVisita.data} {dataVisita.hora}
              </Text>
            </View>
          )}
        </View>

        {/* Assunto */}
        <Text
          className="text-sm mb-2"
          style={{ color: colors.cardTextSecondary }}
          numberOfLines={2}
        >
          {chamado.assunto || 'Sem assunto'}
        </Text>

        {/* Motivo fechamento - apenas no histórico */}
        {isHistorico && chamado.motivo_fechar && (
          <View 
            className="px-2 py-1 rounded mb-2"
            style={{ backgroundColor: colors.successBackground }}
          >
            <Text className="text-xs" style={{ color: colors.successText }}>
              ✓ {chamado.motivo_fechar}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View
          className="flex-row justify-between items-center pt-2 border-t"
          style={{ borderTopColor: colors.cardBorder }}
        >
          <Text className="text-xs" style={{ color: colors.cardTextSecondary }}>
            {isHistorico ? 'Fechado:' : 'Aberto:'} {isHistorico ? dataFechamento?.completo : dataAbertura?.data}
          </Text>
          <Text className="text-xs" style={{ color: colors.cardTextSecondary }} numberOfLines={1}>
            {chamado.atendente || (isHistorico ? 'Não atribuído' : '🔴 Livre')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
