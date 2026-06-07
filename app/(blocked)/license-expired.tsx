import { useTheme } from '@/contexts/ThemeContext';
import { useLicenseValidation } from '@/hooks/license/useLicenseValidation';
import {
    getDaysUntilGraceEnd,
    isInGracePeriod,
} from '@/utils/license';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LicenseExpired() {
  const { colors } = useTheme();
  const router = useRouter();
  const { license, isChecking, checkNow } = useLicenseValidation();

  const inGrace = license ? isInGracePeriod(license) : false;
  const graceDaysLeft = inGrace ? getDaysUntilGraceEnd(license?.gracePeriodEndsAt) : 0;

  const handleRetry = async () => {
    try {
      const result = await checkNow();
      if (result?.valid) {
        // Licença válida novamente — volta para o app
        router.replace('/(app)/(agenda)');
      }
    } catch {
      // Mantém na tela de bloqueio
    }
  };

  const expiresAtFormatted = license?.expiresAt
    ? new Date(license.expiresAt).toLocaleDateString('pt-BR')
    : null;

  const graceEndsAtFormatted = license?.gracePeriodEndsAt
    ? new Date(license.gracePeriodEndsAt).toLocaleDateString('pt-BR')
    : null;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.screenBackground }}
      edges={['top', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Ícone */}
        <View
          className="w-24 h-24 rounded-3xl items-center justify-center mb-6"
          style={{ backgroundColor: '#ef444415' }}
        >
          <Text className="text-5xl">🔒</Text>
        </View>

        {/* Título */}
        <Text
          className="text-2xl font-bold text-center mb-2"
          style={{ color: colors.cardTextPrimary }}
        >
          {inGrace ? 'Licença Expirada' : 'Acesso Bloqueado'}
        </Text>

        {/* Subtítulo */}
        <Text
          className="text-base text-center mb-6 leading-6"
          style={{ color: colors.cardTextSecondary }}
        >
          {inGrace
            ? `Sua licença expirou, mas você ainda tem ${graceDaysLeft} dia${graceDaysLeft !== 1 ? 's' : ''} de período de graça.`
            : 'A licença do MK-Ops para este servidor expirou. Renove para continuar usando o aplicativo.'}
        </Text>

        {/* Card de informações */}
        <View
          className="w-full rounded-2xl p-5 mb-6 border"
          style={{
            backgroundColor: colors.cardBackground,
            borderColor: colors.cardBorder,
          }}
        >
          {license?.clientName && (
            <InfoRow label="Empresa" value={license.clientName} colors={colors} />
          )}
          {expiresAtFormatted && (
            <InfoRow label="Expirou em" value={expiresAtFormatted} colors={colors} />
          )}
          {inGrace && graceEndsAtFormatted && (
            <InfoRow
              label="Graça termina em"
              value={graceEndsAtFormatted}
              valueColor="#f59e0b"
              colors={colors}
            />
          )}
          {license?.status === 'not_found' && (
            <InfoRow
              label="Status"
              value="Servidor não registrado"
              valueColor="#ef4444"
              colors={colors}
            />
          )}
        </View>

        {/* Instruções de renovação */}
        <View
          className="w-full rounded-2xl p-5 mb-6 border"
          style={{
            backgroundColor: '#fef3c715',
            borderColor: '#f59e0b30',
          }}
        >
          <Text className="text-sm font-semibold mb-3" style={{ color: '#92400e' }}>
            Como renovar
          </Text>
          <Text className="text-sm leading-5" style={{ color: '#78350f' }}>
            1. Entre em contato com o suporte do MK-Ops{'\n'}
            2. Informe o endereço do seu servidor{'\n'}
            3. Efetue o pagamento da renovação{'\n'}
            4. Toque em "Verificar novamente" abaixo
          </Text>
        </View>

        {/* Botão de verificar novamente */}
        <TouchableOpacity
          onPress={handleRetry}
          disabled={isChecking}
          className="w-full rounded-xl py-4 items-center mb-3"
          style={{ backgroundColor: '#3b82f6', opacity: isChecking ? 0.7 : 1 }}
        >
          {isChecking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Verificar novamente</Text>
          )}
        </TouchableOpacity>

        <Text
          className="text-xs text-center"
          style={{ color: colors.cardTextSecondary }}
        >
          Após renovar, toque no botão acima para liberar o acesso.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  valueColor,
  colors,
}: {
  label: string;
  value: string;
  valueColor?: string;
  colors: any;
}) {
  return (
    <View className="flex-row justify-between items-center py-2">
      <Text className="text-sm" style={{ color: colors.cardTextSecondary }}>
        {label}
      </Text>
      <Text
        className="text-sm font-medium"
        style={{ color: valueColor ?? colors.cardTextPrimary }}
      >
        {value}
      </Text>
    </View>
  );
}
