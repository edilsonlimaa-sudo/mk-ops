import { getTokenExpiration } from '@/services/api/core/token/jwtDecoder';
import { authStorage } from '@/services/storage/authStorage';
import { useAuthStore } from '@/stores/auth';
import { isExpired, refreshToken } from './token';

/**
 * Restaura sessão de autenticação do storage (bootstrap da aplicação).
 * 
 * Este método:
 * - Busca sessão salva no storage
 * - Verifica expiração do token
 * - Renova token proativamente se expirado
 * - Marca bootstrap como completo (isRestored = true)
 * - Trata erros graciosamente (mantém sessão ou limpa estado)
 * 
 * Cenários tratados:
 * 1. Token válido → restaura sessão normalmente
 * 2. Token expirado → tenta renovar; se falhar, mantém token expirado (interceptor vai tentar depois)
 * 3. Sem sessão → marca como não autenticado
 * 4. Erro no storage → limpa estado e tenta limpar storage corrompido
 * 
 * @throws Error apenas em casos críticos (storage corrompido, etc)
 */
export async function restoreAuth(): Promise<void> {
  console.log('🔍 [auth.bootstrap] Iniciando restore...');

  try {
    // 1. Busca sessão do storage
    const session = await authStorage.getSession();

    if (!session) {
      // Sem sessão salva → usuário não autenticado
      console.log('⚠️ [auth.bootstrap] Nenhuma sessão encontrada');
      useAuthStore.setState({
        token: null,
        tokenExpiration: null,
        ipMkAuth: null,
        isRestored: true, // Bootstrap completo (sem sessão)
      });
      return;
    }

    // 2. Extrai expiração do token
    const tokenExpiration = getTokenExpiration(session.token);
    console.log('📅 [auth.bootstrap] Token expira em:', new Date(tokenExpiration).toLocaleString());

    // 3. Validação proativa: verifica se token está expirado
    if (isExpired(tokenExpiration)) {
      console.log('🔄 [auth.bootstrap] Token expirado detectado, tentando renovar...');

      try {
        // Tenta renovar token ANTES de marcar como autenticado
        await refreshToken();

        // Marca como restaurado após refresh bem-sucedido
        useAuthStore.setState({ isRestored: true });
        console.log('✅ [auth.bootstrap] Sessão restaurada com token renovado!');
        return;

      } catch (refreshError) {
        // Falha no refresh proativo → mantém token expirado
        // Interceptor vai tentar refresh depois na primeira chamada
        console.warn('⚠️ [auth.bootstrap] Falha ao renovar token proativamente:', refreshError);

        useAuthStore.setState({
          token: session.token,
          tokenExpiration,
          ipMkAuth: session.ipMkAuth,
          isRestored: true, // Bootstrap completo (com token expirado)
        });

        console.log('⚠️ [auth.bootstrap] Sessão restaurada com token expirado (interceptor vai tentar renovar)');
        return;
      }
    }

    // 4. Token válido → restaura sessão normalmente
    useAuthStore.setState({
      token: session.token,
      tokenExpiration,
      ipMkAuth: session.ipMkAuth,
      isRestored: true, // Bootstrap completo (com token válido)
    });

    console.log('✅ [auth.bootstrap] Sessão restaurada com sucesso! ipMkAuth:', session.ipMkAuth);

  } catch (error) {
    // Erro crítico (storage corrompido, permissão negada, etc)
    console.error('❌ [auth.bootstrap] Erro crítico:', error);

    // Limpa estado
    useAuthStore.setState({
      token: null,
      tokenExpiration: null,
      ipMkAuth: null,
      isRestored: true, // Bootstrap completo (com erro)
    });

    // Tenta limpar storage corrompido em background (ignora se falhar)
    authStorage.clearAll().catch(() => { });

    throw error;
  }
}
