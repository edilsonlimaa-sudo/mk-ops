import { queryClient } from '@/lib/queryClient';
import { authService } from '@/services/api/auth';
import { getTokenExpiration } from '@/services/api/core/token/jwtDecoder';
import { authStorage } from '@/services/storage/authStorage';
import { useAuthStore } from '@/stores/auth';
import { useLicenseStore } from '@/stores/license/useLicenseStore';
import { useOnboardingStore } from '@/stores/onboarding/useOnboardingStore';
import { useSetupStore } from '@/stores/onboarding/useSetupStore';
import { useUserStore } from '@/stores/useUserStore';

/**
 * Realiza login e estabelece sessão autenticada.
 * 
 * Este método:
 * - Chama API de login
 * - Salva credenciais e token no storage
 * - Atualiza store com token e dados de sessão
 * 
 * @param ipMkAuth IP do servidor MkAuth
 * @param clientId ID do cliente
 * @param clientSecret Secret do cliente
 * @throws Error se falhar autenticação
 */
export async function login(
  ipMkAuth: string, 
  clientId: string, 
  clientSecret: string
): Promise<void> {
  console.log('🔑 [auth.session] Iniciando login...');
  
  try {
    // 1. Chama API de login
    console.log('🌐 [auth.session] Chamando authService.login...');
    const token = await authService.login({ ipMkAuth, clientId, clientSecret });
    console.log('✅ [auth.session] Token recebido');
    
    // 2. Salva credenciais e token no storage
    console.log('💾 [auth.session] Salvando credenciais no storage...');
    await authStorage.saveCredentials({ ipMkAuth, clientId, clientSecret }, token);
    
    // 3. Extrai data de expiração do token
    const tokenExpiration = getTokenExpiration(token);
    console.log('⏰ [auth.session] Token expira em:', new Date(tokenExpiration).toLocaleString());
    
    // 4. Atualiza store (apiClient se auto-configura via subscription)
    console.log('📝 [auth.session] Atualizando estado da store...');
    useAuthStore.setState({
      token,
      tokenExpiration,
      ipMkAuth,
    });
    
    console.log('✨ [auth.session] Login completo!');
  } catch (error) {
    console.error('❌ [auth.session] Erro no login:', error);
    throw error;
  }
}

/**
 * Realiza logout e limpa sessão.
 * 
 * Este método:
 * - Limpa storage (credenciais e token)
 * - Limpa cache do React Query
 * - Reseta store para estado inicial
 */
export async function logout(): Promise<void> {
  console.log('🚪 [auth.session] Iniciando logout...');
  
  // 1. Limpa storage
  await authStorage.clearAll();
  console.log('🗑️ [auth.session] Storage limpo');
  
  // 2. Limpa cache do React Query (remove dados de todas as queries)
  queryClient.clear();
  console.log('🧹 [auth.session] Cache do React Query limpo');
  
  // 3. Reseta store (apiClient se auto-limpa via subscription)
  useAuthStore.setState({
    token: null,
    tokenExpiration: null,
    ipMkAuth: null,
  });
  
  console.log('📝 [auth.session] Estado limpo');
}

/**
 * Desconexão completa do aplicativo.
 *
 * Este método:
 * - Limpa identificação do usuário
 * - Executa logout da API (token, credenciais e cache)
 * - Reseta onboarding e setup para estado de primeira execução
 */
export async function disconnectCompletely(): Promise<void> {
  console.log('🧨 [auth.session] Iniciando desconexão completa...');

  // 1. Limpa usuário identificado (logout parcial usa apenas isso)
  await useUserStore.getState().clearIdentification();
  console.log('🧼 [auth.session] Identificação do usuário limpa');

  // 2. Limpa sessão de API + cache sensível
  await logout();

  // 3. Reseta fluxo de onboarding e setup (persistidos em AsyncStorage)
  useSetupStore.getState().resetSetup();
  useOnboardingStore.getState().resetOnboarding();
  console.log('♻️ [auth.session] Onboarding e setup resetados');

  // 4. Limpa cache de licença (novo servidor pode ser diferente)
  await useLicenseStore.getState().clearLicense();
  console.log('🔓 [auth.session] Cache de licença limpo');
}

/**
 * Busca credenciais salvas no storage.
 * 
 * Útil para:
 * - Pré-preencher formulário de login
 * - Verificar se usuário já tem credenciais salvas
 * 
 * @returns Credenciais salvas ou null se não existirem
 */
export async function getSavedCredentials() {
  return await authStorage.getCredentials();
}
