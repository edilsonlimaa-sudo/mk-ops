import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { Instalacao } from '@/types/instalacao';
import { Text, TouchableOpacity, View } from 'react-native';

interface InstalacaoCardProps {
  instalacao: Instalacao;
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

export function InstalacaoCard({ instalacao, variant = 'agenda', onPress }: InstalacaoCardProps) {
  const { colors } = useTheme();
  const isHistorico = variant === 'historico';
  
  const dataProcessamento = formatarDataHora(instalacao.processamento);
  const dataInstalacao = formatarDataHora(instalacao.datainst);
  const dataVisita = instalacao.visita ? formatarDataHora(instalacao.visita) : null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View
        className="rounded-lg p-3 mb-2 shadow-sm"
        style={{ backgroundColor: colors.cardBackground }}
      >
        {/* Badge Instalação */}
        <View className="flex-row justify-between items-center mb-2">
          <Badge label="Instalação" color="purple" variant="outline" />
          <Text className="text-xs font-mono" style={{ color: colors.cardTextSecondary }}>
            #{instalacao.termo}
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
              {instalacao.nome || 'Cliente não identificado'}
            </Text>
            <Text
              className="text-xs"
              style={{ color: colors.cardTextSecondary }}
              numberOfLines={1}
            >
              {instalacao.celular || 'Sem telefone'}
            </Text>
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

        {/* Ativação - consistência com assunto do ChamadoCard */}
        <Text
          className="text-sm mb-2"
          style={{ color: colors.cardTextSecondary }}
        >
          Ativação
        </Text>

        {/* Status instalação - apenas no histórico */}
        {isHistorico && instalacao.instalado === 'sim' && (
          <View 
            className="px-2 py-1 rounded mb-2"
            style={{ backgroundColor: colors.successBackground }}
          >
            <Text className="text-xs" style={{ color: colors.successText }}>
              ✓ Instalação concluída
            </Text>
          </View>
        )}

        {/* Footer */}
        <View
          className="flex-row justify-between items-center pt-2 border-t"
          style={{ borderTopColor: colors.cardBorder }}
        >
          <Text className="text-xs" style={{ color: colors.cardTextSecondary }}>
            {isHistorico ? 'Instalado:' : 'Solicitado:'} {isHistorico ? dataInstalacao?.completo : dataProcessamento?.data}
          </Text>
          <Text className="text-xs" style={{ color: colors.cardTextSecondary }} numberOfLines={1}>
            {isHistorico 
              ? (instalacao.tecnico || 'Não atribuído')
              : (instalacao.login_atend || '🔴 Livre')
            }
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
