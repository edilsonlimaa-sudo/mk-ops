/**
 * Módulo de autenticação - Lógica de negócio.
 * 
 * Organização:
 * - session.ts: Login / Logout / Credenciais
 * - token.ts: Refresh de token / Validação
 * - bootstrap.ts: Restore de sessão
 * 
 * Princípios:
 * - Funções puras que orquestram services e stores
 * - Não mantêm estado próprio
 * - Testáveis isoladamente
 * - Reutilizáveis fora de componentes React
 */

// Sessão (login/logout)
export { getSavedCredentials, login, logout } from './session';

// Token (refresh)
export { isExpired, refreshToken } from './token';

// Bootstrap (restore)
export { restoreAuth } from './bootstrap';
