import { useTheme } from '@/contexts/ThemeContext';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Text, View } from 'react-native';

export type LoadingScreenState = 'loading' | 'success' | 'error';

interface ImmersiveLoadingScreenProps {
  /** Controls whether the loading screen is visible */
  visible: boolean;
  
  /** Current state of the loading screen */
  state: LoadingScreenState;
  
  /** Title text for loading state */
  loadingTitle: string;
  
  /** Subtitle text for loading state (optional) */
  loadingSubtitle?: string;
  
  /** Title text for success state */
  successTitle: string;
  
  /** Subtitle text for success state (optional) */
  successSubtitle?: string;
  
  /** Title text for error state */
  errorTitle: string;
  
  /** Subtitle text for error state (optional) */
  errorSubtitle?: string;
  
  /**
   * Callback fired after success/error animation completes (1.8s).
   * Not called for loading state.
   * Parent component should handle state transitions (e.g., hiding screen, reopening modals).
   */
  onAnimationComplete?: () => void;
}

/**
 * Immersive fullscreen loading overlay with animated states.
 * 
 * **Behavior:**
 * - `loading`: Shows blue spinner with fade-in animation (300ms)
 * - `success`: Shows green checkmark with scale animation (1.2 → 1), auto-hides after 1.8s
 * - `error`: Shows red X with scale animation (1.2 → 1), auto-hides after 1.8s
 * 
 * **Usage patterns:**
 * 1. **Login (connecting only)**: Uses loading + error, skips success (redirects immediately on success)
 * 2. **Initial load**: Uses loading + success, skips error (handled by React Query error state)
 * 3. **Validation**: Uses all 3 states (loading → success/error with different callbacks)
 * 
 * Parent component controls when to show/hide via `visible` prop.
 * Component calls `onAnimationComplete` after success/error animations, parent decides next action.
 * 
 * @example
 * ```tsx
 * <ImmersiveLoadingScreen
 *   visible={loadingState !== 'idle'}
 *   state={loadingState}
 *   loadingTitle="Conectando ao MK-Auth"
 *   loadingSubtitle="Aguarde um momento..."
 *   errorTitle="Erro ao conectar!"
 *   errorSubtitle="Verifique as credenciais..."
 *   onAnimationComplete={() => setLoadingState('idle')}
 * />
 * ```
 */
export function ImmersiveLoadingScreen({
  visible,
  state,
  loadingTitle,
  loadingSubtitle,
  successTitle,
  successSubtitle,
  errorTitle,
  errorSubtitle,
  onAnimationComplete,
}: ImmersiveLoadingScreenProps) {
  const { colors } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0));

  // Fade in animation when becoming visible
  useEffect(() => {
    if (visible && state === 'loading') {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, state]);

  // Success/Error scale animation
  useEffect(() => {
    if (state === 'success' || state === 'error') {
      // Reset fade for success/error states
      fadeAnim.setValue(1);
      
      // Scale animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after 1.8s
      const timer = setTimeout(() => {
        onAnimationComplete?.();
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [state]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{ opacity: fadeAnim, backgroundColor: colors.screenBackground }}
      className="absolute inset-0 justify-center items-center z-50"
    >
      {state === 'loading' && (
        <View className="items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ color: colors.cardTextPrimary }} className="text-xl font-semibold mt-6">
            {loadingTitle}
          </Text>
          {loadingSubtitle && (
            <Text style={{ color: colors.cardTextSecondary }} className="text-sm mt-2">
              {loadingSubtitle}
            </Text>
          )}
        </View>
      )}

      {state === 'success' && (
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="items-center"
        >
          <View className="w-20 h-20 bg-green-500 rounded-full items-center justify-center mb-6">
            <Text className="text-white text-4xl font-bold">✓</Text>
          </View>
          <Text style={{ color: colors.cardTextPrimary }} className="text-xl font-semibold">
            {successTitle}
          </Text>
          {successSubtitle && (
            <Text style={{ color: colors.cardTextSecondary }} className="text-sm mt-2">
              {successSubtitle}
            </Text>
          )}
        </Animated.View>
      )}

      {state === 'error' && (
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="items-center"
        >
          <View className="w-20 h-20 bg-red-500 rounded-full items-center justify-center mb-6">
            <Text className="text-white text-4xl font-bold">✕</Text>
          </View>
          <Text style={{ color: colors.cardTextPrimary }} className="text-xl font-semibold">
            {errorTitle}
          </Text>
          {errorSubtitle && (
            <Text style={{ color: colors.cardTextSecondary }} className="text-sm mt-2">
              {errorSubtitle}
            </Text>
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
}
