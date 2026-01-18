import { useOnboardingStore } from '@/stores/onboarding/useOnboardingStore';
import { Redirect } from 'expo-router';

/**
 * Índice do onboarding - redireciona para a rota correta baseado no estado
 */
export default function OnboardingIndex() {
  const { getResumeRoute } = useOnboardingStore();
  const route = getResumeRoute();
  
  // Redireciona para a rota correta baseado no progresso
  return <Redirect href={route as any} />;
}
