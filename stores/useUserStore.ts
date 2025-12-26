import { UsuarioDetalhado } from '@/types/usuario';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const IDENTIFIED_USER_KEY = 'identified_user_data';

interface UserState {
  currentUser: Omit<UsuarioDetalhado, 'sha'> | null;
  isIdentified: boolean;
  
  // Identifica o usuário (salva dados completos no SecureStore, exceto sha)
  identifyUser: (usuario: UsuarioDetalhado) => Promise<void>;
  
  // Limpa a identificação (mantém auth da API)
  clearIdentification: () => Promise<void>;
  
  // Restaura do storage (se tiver)
  restoreUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,
  isIdentified: false,

  identifyUser: async (usuario: UsuarioDetalhado) => {
    try {
      // Remove o hash SHA por segurança
      const { sha, ...usuarioSemHash } = usuario;
      
      // Salva dados completos no SecureStore
      await SecureStore.setItemAsync(
        IDENTIFIED_USER_KEY, 
        JSON.stringify(usuarioSemHash)
      );
      
      set({
        currentUser: usuarioSemHash,
        isIdentified: true,
      });
      
      console.log('✅ [UserStore] Usuário identificado:', usuarioSemHash.login);
    } catch (error) {
      console.error('❌ [UserStore] Erro ao identificar usuário:', error);
      throw error;
    }
  },

  clearIdentification: async () => {
    try {
      await SecureStore.deleteItemAsync(IDENTIFIED_USER_KEY);
      
      set({
        currentUser: null,
        isIdentified: false,
      });
      
      console.log('🗑️ [UserStore] Identificação limpa');
    } catch (error) {
      console.error('❌ [UserStore] Erro ao limpar identificação:', error);
    }
  },

  restoreUser: async () => {
    try {
      const userData = await SecureStore.getItemAsync(IDENTIFIED_USER_KEY);
      
      if (userData) {
        const usuario = JSON.parse(userData) as Omit<UsuarioDetalhado, 'sha'>;
        set({
          currentUser: usuario,
          isIdentified: true,
        });
        console.log('♻️ [UserStore] Usuário restaurado:', usuario.login);
      } else {
        set({
          currentUser: null,
          isIdentified: false,
        });
        console.log('ℹ️ [UserStore] Nenhum usuário identificado no storage');
      }
    } catch (error) {
      console.error('❌ [UserStore] Erro ao restaurar usuário:', error);
      set({
        currentUser: null,
        isIdentified: false,
      });
    }
  },
}));

// Export do tipo para uso em outros lugares
export type { UserState };

