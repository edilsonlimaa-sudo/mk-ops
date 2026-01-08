import { useTheme } from '@/contexts/ThemeContext';
import { useUserStore } from '@/stores/useUserStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PerfilScreen() {
  const { colors, theme } = useTheme();
  const { currentUser } = useUserStore();

  const initials = currentUser?.nome
    ? currentUser.nome.charAt(0).toUpperCase()
    : '?';

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Perfil',
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerText,
        }}
      />

      <SafeAreaView style={{ backgroundColor: colors.screenBackground }} className="flex-1" edges={['bottom']}>
        <ScrollView>
          {/* Header */}
          <View style={{ backgroundColor: '#3b82f6' }} className="items-center py-12">
            <View
              className="w-28 h-28 rounded-full items-center justify-center mb-4"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderWidth: 3,
                borderColor: 'rgba(255,255,255,0.3)',
              }}>
              <Text className="text-white text-5xl font-bold">{initials}</Text>
            </View>
            <Text className="text-white text-2xl font-bold">{currentUser?.nome}</Text>
            <Text className="text-white text-base mt-1 opacity-80">@{currentUser?.login}</Text>
          </View>

          {/* Informações */}
          <View className="p-6">
            <View
              className="rounded-2xl border mb-6 overflow-hidden"
              style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }}>
              {currentUser?.email && (
                <InfoRow
                  icon="mail"
                  label="Email"
                  value={currentUser.email}
                  colors={colors}
                  showBorder
                />
              )}
              {currentUser?.func && (
                <InfoRow
                  icon="briefcase"
                  label="Função"
                  value={currentUser.func}
                  colors={colors}
                  showBorder
                />
              )}
              <InfoRow
                icon="checkmark-circle"
                label="Status"
                value={currentUser?.ativo === 'sim' ? 'Ativo' : 'Inativo'}
                colors={colors}
                valueColor={currentUser?.ativo === 'sim' ? '#10b981' : '#ef4444'}
              />
            </View>

            {/* Acesso */}
            <Text
              className="text-xs uppercase mb-3 ml-1"
              style={{ color: colors.cardTextSecondary }}>
              Informações de Acesso
            </Text>
            <View
              className="rounded-2xl border mb-6 overflow-hidden"
              style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }}>
              <InfoRow
                icon="time"
                label="Último Acesso"
                value={currentUser?.ultacesso || 'Não disponível'}
                colors={colors}
                showBorder
              />
              <InfoRow
                icon="calendar"
                label="Validade"
                value={currentUser?.validade || 'Não definida'}
                colors={colors}
                showBorder
              />
              <InfoRow
                icon="alarm"
                label="Horário Permitido"
                value={currentUser?.horario || 'Sem restrições'}
                colors={colors}
              />
            </View>

            {/* IDs */}
            <Text
              className="text-xs uppercase mb-3 ml-1"
              style={{ color: colors.cardTextSecondary }}>
              Identificadores
            </Text>
            <View
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }}>
              <InfoRow
                icon="key"
                label="ID de Acesso"
                value={currentUser?.idacesso}
                colors={colors}
                showBorder
                mono
              />
              <InfoRow
                icon="finger-print"
                label="UUID"
                value={currentUser?.uuid}
                colors={colors}
                mono
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
  colors,
  showBorder = false,
  valueColor,
  mono = false,
}: {
  icon: string;
  label: string;
  value?: string;
  colors: any;
  showBorder?: boolean;
  valueColor?: string;
  mono?: boolean;
}) {
  return (
    <View
      className="p-4"
      style={showBorder ? { borderBottomWidth: 1, borderBottomColor: colors.cardBorder } : {}}>
      <View className="flex-row items-center">
        <Ionicons name={icon as any} size={20} color={colors.cardTextSecondary} />
        <View className="flex-1 ml-3">
          <Text className="text-xs mb-1" style={{ color: colors.cardTextSecondary }}>
            {label}
          </Text>
          <Text
            className="text-sm font-medium"
            style={{
              color: valueColor || colors.cardTextPrimary,
              fontFamily: mono ? 'monospace' : undefined,
            }}>
            {value || 'N/A'}
          </Text>
        </View>
      </View>
    </View>
  );
}
