/**
 * Auth Store - Estado de autenticação.
 * 
 * Esta store contém apenas ESTADO PURO:
 * - token
 * - tokenExpiration
 * - ipMkAuth
 * - isRestored
 * - isAuthenticated (derivado)
 * 
 * Para AÇÕES (login, logout, refresh, etc), use:
 * import { login, logout, refreshToken, restoreAuth } from '@/lib/auth'
 */

// Store (estado puro)
export { useAuthStore } from './auth.store';

