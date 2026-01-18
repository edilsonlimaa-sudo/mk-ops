import { useTheme } from '@/contexts/ThemeContext';
import { login } from '@/lib/auth/session';
import { useOnboardingStore } from '@/stores/onboarding/useOnboardingStore';
import { useSetupStore } from '@/stores/onboarding/useSetupStore';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SetupSuccess() {
  const { colors } = useTheme();
  const router = useRouter();
  const { completeOnboarding } = useOnboardingStore();
  const { data } = useSetupStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Animações
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animação de entrada do ícone
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }).start(() => {
      // Pulse contínuo apenas após a entrada
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Fade in do texto
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleContinue = async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('🚀 [success] Iniciando login automático...');
      
      // Faz login com os dados validados (garantidamente existem após validação)
      await login(data.serverUrl!, data.clientId!, data.clientSecret!);
      
      console.log('✅ [success] Login realizado! Guards irão redirecionar...');
      
      // Marca onboarding como completo
      completeOnboarding();
      
      // Não precisa redirecionar - os guards farão isso
    } catch (error) {
      console.error('❌ [success] Erro ao fazer login:', error);
      setError(error instanceof Error ? error.message : 'Erro ao fazer login');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView 
      style={{ backgroundColor: colors.screenBackground }} 
      className="flex-1 justify-center items-center px-6"
      edges={['top', 'bottom']}
    >
      {/* Ícone de sucesso animado */}
      <Animated.View
        style={{
          transform: [
            { scale: Animated.multiply(scaleAnim, pulseAnim) },
          ],
        }}
      >
        <View 
          className="w-32 h-32 rounded-full items-center justify-center mb-8"
          style={{ backgroundColor: '#10b981' + '20' }}
        >
          <Text className="text-7xl">✓</Text>
        </View>
      </Animated.View>

      {/* Textos */}
      <Animated.View
        style={{ opacity: fadeAnim }}
        className="items-center"
      >
        <Text 
          style={{ color: colors.cardTextPrimary }} 
          className="text-3xl font-bold mb-3 text-center"
        >
          Configuração Concluída!
        </Text>

        <Text 
          style={{ color: colors.cardTextSecondary }} 
          className="text-base text-center mb-8 leading-6"
        >
          Seu app está pronto para uso. Você já pode começar a gerenciar seus chamados e clientes.
        </Text>

        {/* Badge de sucesso */}
        <View className="bg-green-500/10 rounded-full px-6 py-3 mb-8">
          <Text style={{ color: '#10b981' }} className="text-sm font-semibold">
            🎉 Setup concluído com sucesso
          </Text>
        </View>

        {/* Erro se houver */}
        {error ? (
          <View className="bg-red-500/10 rounded-xl px-4 py-3 mb-4">
            <Text style={{ color: '#ef4444' }} className="text-sm text-center">
              {error}
            </Text>
          </View>
        ) : null}

        {/* Botão de continuar */}
        <TouchableOpacity
          onPress={handleContinue}
          disabled={isLoading}
          style={{ 
            backgroundColor: '#10b981',
            opacity: isLoading ? 0.7 : 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
          }}
          className="rounded-2xl py-4 px-12"
          activeOpacity={0.8}
        >
          {isLoading ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className="text-white font-bold text-lg">
                Entrando...
              </Text>
            </View>
          ) : (
            <Text className="text-white font-bold text-lg">
              Começar a usar →
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}
