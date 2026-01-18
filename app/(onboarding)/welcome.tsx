import { useTheme } from '@/contexts/ThemeContext';
import { useOnboardingStore } from '@/stores/onboarding/useOnboardingStore';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Welcome() {
  const { colors } = useTheme();
  const router = useRouter();
  const { startSetup } = useOnboardingStore();
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);

  // Animações
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animações sequenciais para cada elemento
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(30)).current;
  const descOpacity = useRef(new Animated.Value(0)).current;
  const descTranslate = useRef(new Animated.Value(20)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerTranslate = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // 1. Logo aparece com rotação e bounce (0ms)
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
      // Pulsar suave contínuo
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

    // 2. Título aparece (400ms após logo)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(titleTranslate, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);

    // 3. Descrição aparece (700ms após logo)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(descOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(descTranslate, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 700);

    // 4. Footer (info + botão) aparece (1000ms após logo)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(footerOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(footerTranslate, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1000);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startSetup();
    router.replace('/(onboarding)/(setup)/1-server');
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
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslate }],
          }}
        >
          <Text
            style={{ color: colors.cardTextPrimary }}
            className="text-3xl font-bold text-center mb-4"
          >
            Bem-vindo ao MK-[Ops]
          </Text>
        </Animated.View>

        {/* Descrição */}
        <Animated.View
          style={{
            opacity: descOpacity,
            transform: [{ translateY: descTranslate }],
          }}
        >
          <Text
            style={{ color: colors.cardTextSecondary }}
            className="text-base text-center leading-6"
          >
            Vamos configurar sua conexão{'\n'}com o MK-Auth
          </Text>
        </Animated.View>
      </View>

      {/* Footer com CTAs balanceados */}
      <Animated.View
        style={{
          opacity: footerOpacity,
          transform: [{ translateY: footerTranslate }],
        }}
        className="pb-6 px-6"
      >
        <View className="flex-row items-center justify-between">
          {/* Info à esquerda */}
          <TouchableOpacity
            onPress={() => setShowRequirementsModal(true)}
            className="flex-row items-center"
            activeOpacity={0.7}
          >
            <View className="w-5 h-5 rounded-full items-center justify-center mr-2" style={{ backgroundColor: '#2563eb' }}>
              <Text style={{ color: '#ffffff' }} className="text-xs font-bold">i</Text>
            </View>
            <Text style={{ color: colors.cardTextSecondary }} className="text-sm">
              O que preciso?
            </Text>
          </TouchableOpacity>

          {/* CTA à direita */}
          <TouchableOpacity
            onPress={handleStart}
            activeOpacity={0.7}
            className="py-2 px-4"
          >
            <Text style={{ color: '#2563eb' }} className="text-base font-semibold">
              Começar
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Modal de Requisitos */}
      <Modal
        visible={showRequirementsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRequirementsModal(false)}
      >
        <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <View
            style={{ backgroundColor: colors.cardBackground }}
            className="w-full rounded-3xl p-8"
          >
            {/* Header */}
            <View className="items-center mb-8">
              <Text style={{ color: colors.cardTextPrimary }} className="text-2xl font-bold mb-2">
                O que você vai precisar
              </Text>
              <Text style={{ color: colors.cardTextSecondary }} className="text-sm">
                ~2 minutos para conectar
              </Text>
            </View>

            {/* Lista minimalista */}
            <View className="mb-8">
              {/* Item 1 */}
              <View className="flex-row items-start mb-6">
                <Text className="text-2xl mr-4">🖥️</Text>
                <View className="flex-1">
                  <Text style={{ color: colors.cardTextPrimary }} className="text-base font-semibold mb-1">
                    Acesso ao painel MK-Auth
                  </Text>
                  <Text style={{ color: colors.cardTextSecondary }} className="text-sm leading-5">
                    Você vai precisar estar logado no painel web
                  </Text>
                </View>
              </View>

              {/* Item 2 */}
              <View className="flex-row items-start mb-6">
                <Text className="text-2xl mr-4">🌐</Text>
                <View className="flex-1">
                  <Text style={{ color: colors.cardTextPrimary }} className="text-base font-semibold mb-1">
                    URL do servidor
                  </Text>
                  <Text style={{ color: colors.cardTextSecondary }} className="text-sm leading-5">
                    Endereço web onde seu MK-Auth está hospedado
                  </Text>
                </View>
              </View>

              {/* Item 3 */}
              <View className="flex-row items-start mb-6">
                <Text className="text-2xl mr-4">🔑</Text>
                <View className="flex-1">
                  <Text style={{ color: colors.cardTextPrimary }} className="text-base font-semibold mb-1">
                    Client ID e Secret
                  </Text>
                  <Text style={{ color: colors.cardTextSecondary }} className="text-sm leading-5">
                    Credenciais para autenticação da API
                  </Text>
                </View>
              </View>

              {/* Item 4 */}
              <View className="flex-row items-start">
                <Text className="text-2xl mr-4">✓</Text>
                <View className="flex-1">
                  <Text style={{ color: colors.cardTextPrimary }} className="text-base font-semibold mb-1">
                    Permissões da API
                  </Text>
                  <Text style={{ color: colors.cardTextSecondary }} className="text-sm leading-5">
                    Você poderá revogar no painel quando quiser
                  </Text>
                </View>
              </View>
            </View>

            {/* Botão */}
            <TouchableOpacity
              className="py-4 rounded-xl"
              style={{ backgroundColor: '#2563eb' }}
              onPress={() => setShowRequirementsModal(false)}
              activeOpacity={0.9}
            >
              <Text className="text-white text-center text-base font-semibold">
                Entendi, vamos lá
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
