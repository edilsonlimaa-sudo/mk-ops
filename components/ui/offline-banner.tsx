import { useTheme } from '@/contexts/ThemeContext';
import { useOnlineStatus } from '@/hooks/ui/useOnlineStatus';
import { Text, View } from 'react-native';

/**
 * Banner interno - SEMPRE usa o hook
 */
function OfflineBannerInternal() {
  const { colors } = useTheme();
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <View
      className="px-4 py-2 flex-row items-center justify-center gap-2"
      style={{ backgroundColor: '#f59e0b' }}
    >
      <Text className="text-xs font-medium text-white">
        📡 Modo offline - exibindo dados em cache
      </Text>
    </View>
  );
}

/**
 * Banner que aparece no topo quando o app está offline
 * Mostra feedback visual claro para o usuário
 * 
 * @param isOnline - Opcional. Se fornecido, usa esse valor. 
 *                   Se não fornecido, usa o hook useNetworkStatus internamente.
 */
export function OfflineBanner({ isOnline }: { isOnline?: boolean } = {}) {
  const { colors } = useTheme();

  // Se recebeu prop, usa ela (para agenda)
  if (isOnline !== undefined) {
    if (isOnline) {
      return null;
    }
    return (
      <View
        className="px-4 py-2 flex-row items-center justify-center gap-2"
        style={{ backgroundColor: '#f59e0b' }}
      >
        <Text className="text-xs font-medium text-white">
          📡 Modo offline - exibindo dados em cache
        </Text>
      </View>
    );
  }

  // Se não recebeu prop, usa versão com hook (para outras telas)
  return <OfflineBannerInternal />;
}
