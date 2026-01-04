import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Text, View } from 'react-native';

type IconColor = 'blue' | 'green' | 'purple' | 'indigo' | 'cyan' | 'orange' | 'yellow' | 'pink' | 'red' | 'emerald' | 'teal' | 'gray';

interface InfoSectionProps {
  /** Título da seção */
  title: string;
  /** Nome do ícone Ionicons */
  icon: keyof typeof Ionicons.glyphMap;
  /** Cor semântica do ícone */
  color: IconColor;
  /** Conteúdo da seção (InfoRows, etc) */
  children: ReactNode;
  /** Se true, não aplica o wrapper de conteúdo interno (útil quando os children já têm seus próprios wrappers) */
  noContentWrapper?: boolean;
}

// Cores semânticas para os ícones (fundo claro + ícone colorido)
const iconColors: Record<IconColor, { bg: string; icon: string }> = {
  blue: { bg: '#dbeafe', icon: '#3b82f6' },       // blue-100 / blue-500
  green: { bg: '#dcfce7', icon: '#10b981' },      // green-100 / emerald-500
  purple: { bg: '#f3e8ff', icon: '#9333ea' },     // purple-100 / purple-600
  indigo: { bg: '#e0e7ff', icon: '#6366f1' },     // indigo-100 / indigo-500
  cyan: { bg: '#cffafe', icon: '#06b6d4' },       // cyan-100 / cyan-500
  orange: { bg: '#ffedd5', icon: '#f97316' },     // orange-100 / orange-500
  yellow: { bg: '#fef9c3', icon: '#eab308' },     // yellow-100 / yellow-500
  pink: { bg: '#fce7f3', icon: '#ec4899' },       // pink-100 / pink-500
  red: { bg: '#fee2e2', icon: '#ef4444' },        // red-100 / red-500
  emerald: { bg: '#d1fae5', icon: '#10b981' },    // emerald-100 / emerald-500
  teal: { bg: '#ccfbf1', icon: '#14b8a6' },       // teal-100 / teal-500
  gray: { bg: '#e5e7eb', icon: '#6b7280' },       // gray-200 / gray-500
};

/**
 * Wrapper para seções de informação com header (ícone + título).
 * Aplica automaticamente o tema e mantém consistência visual.
 * 
 * @example
 * <InfoSection title="Informações Básicas" icon="person-outline" color="blue">
 *   <EditableInfoRow label="Nome" value={cliente.nome} field="nome" />
 *   <EditableInfoRow label="CPF" value={cliente.cpf} field="cpf" />
 * </InfoSection>
 */
export function InfoSection({ 
  title, 
  icon, 
  color, 
  children,
  noContentWrapper = false 
}: InfoSectionProps) {
  const { colors } = useTheme();
  const iconStyle = iconColors[color];

  return (
    <View 
      className="rounded-2xl p-5 mb-4"
      style={{ 
        backgroundColor: colors.cardBackground, 
        borderWidth: 1, 
        borderColor: colors.cardBorder 
      }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <View 
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: iconStyle.bg }}
        >
          <Ionicons name={icon} size={20} color={iconStyle.icon} />
        </View>
        <Text 
          className="text-base font-bold flex-1" 
          style={{ color: colors.cardTextPrimary }}
        >
          {title}
        </Text>
      </View>

      {/* Conteúdo */}
      {noContentWrapper ? (
        children
      ) : (
        <View 
          className="rounded-xl p-3" 
          style={{ backgroundColor: colors.searchInputBackground }}
        >
          {children}
        </View>
      )}
    </View>
  );
}
