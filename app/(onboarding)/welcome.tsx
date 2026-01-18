import { useTheme } from '@/contexts/ThemeContext';
import { useOnboardingStore } from '@/stores/onboarding/useOnboardingStore';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Welcome() {
  const { colors } = useTheme();
  const router = useRouter();
  const { setPhase } = useOnboardingStore();

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animação do logo com rotação e bounce
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Pulsar suave após aparecer
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Textos com delay
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 30,
        friction: 8,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleNext = () => {
    setPhase('setup-intro');
    router.push('/(onboarding)/setup-intro');
  };

  return (
    <SafeAreaView 
      style={{ backgroundColor: colors.screenBackground }} 
      className="flex-1"
      edges={['top', 'bottom']}
    >
      {/* Conteúdo Central */}
      <View className="flex-1 justify-center items-center px-6">
        {/* Logo */}
        <Animated.View
          style={{
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
              { rotate: spin },
            ],
          }}
        >
          <View
            className="w-24 h-24 rounded-3xl items-center justify-center mb-8"
            style={{
              backgroundColor: '#2563eb',
              shadowColor: '#2563eb',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <Text className="text-5xl">🔐</Text>
          </View>
        </Animated.View>

        {/* Título */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text 
            style={{ color: colors.cardTextPrimary }} 
            className="text-3xl font-bold text-center mb-4"
          >
            Bem-vindo ao MK-Ops
          </Text>

          {/* Descrição */}
          <Text 
            style={{ color: colors.cardTextSecondary }} 
            className="text-base text-center leading-6"
          >
            Configure sua conexão com o MK-Auth{'\n'}em poucos passos
          </Text>
        </Animated.View>
      </View>

      {/* Navegação */}
      <Animated.View 
        style={{
          opacity: fadeAnim,
        }}
        className="pb-6 px-6 flex-row justify-end items-center"
      >
        <TouchableOpacity
          className="py-3 px-4"
          onPress={handleNext}
        >
          <Text style={{ color: '#2563eb' }} className="text-base font-semibold">
            Próximo →
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}
