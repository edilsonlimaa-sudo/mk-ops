import { useLicenseValidation } from '@/hooks/license/useLicenseValidation';
import { getWarningSeverity } from '@/utils/license';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const SEVERITY_COLORS = {
  warning: { bg: '#fef9c3', border: '#fde047', text: '#713f12', icon: '⚠️' },
  danger:  { bg: '#fff7ed', border: '#fb923c', text: '#7c2d12', icon: '⚠️' },
  critical: { bg: '#fef2f2', border: '#f87171', text: '#7f1d1d', icon: '🔴' },
};

/**
 * LicenseExpiringBanner — exibido no topo do app quando a licença está próxima de expirar.
 * Aparece com 7, 3 ou 1 dia(s) de antecedência, e durante todo o período de graça.
 * Dismissível uma vez por sessão.
 */
export function LicenseExpiringBanner() {
  const { warningDays, inGracePeriod, daysUntilGraceEnd } = useLicenseValidation();
  const [dismissed, setDismissed] = useState(false);

  // Sem aviso necessário ou já dispensado
  if (warningDays === null || dismissed) return null;

  const daysToShow = inGracePeriod ? daysUntilGraceEnd : warningDays;
  const severity = getWarningSeverity(daysToShow);
  const palette = SEVERITY_COLORS[severity];

  const message = inGracePeriod
    ? `Período de graça: ${daysToShow} dia${daysToShow !== 1 ? 's' : ''} restante${daysToShow !== 1 ? 's' : ''}. Renove sua licença.`
    : `Sua licença expira em ${daysToShow} dia${daysToShow !== 1 ? 's' : ''}. Renove para não perder o acesso.`;

  return (
    <View
      className="flex-row items-center px-4 py-3"
      style={{
        backgroundColor: palette.bg,
        borderBottomWidth: 1,
        borderBottomColor: palette.border,
      }}
    >
      <Text className="text-base mr-2">{palette.icon}</Text>
      <Text
        className="flex-1 text-xs font-medium leading-4"
        style={{ color: palette.text }}
      >
        {message}
      </Text>
      {/* Não dismissível durante período de graça */}
      {!inGracePeriod && (
        <TouchableOpacity
          onPress={() => setDismissed(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text className="text-base" style={{ color: palette.text }}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
