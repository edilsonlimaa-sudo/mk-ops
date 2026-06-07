import { licenseService } from '@/services/license/LicenseService';
import { LicenseValidationResponse } from '@/services/license/types';
import { create } from 'zustand';

interface LicenseState {
  /** Resposta da última validação */
  license: LicenseValidationResponse | null;
  /** Se está consultando o servidor neste momento */
  isChecking: boolean;
  /** Timestamp da última checagem bem-sucedida */
  lastCheckedAt: number | null;

  // — Ações —

  /** Valida licença no servidor e atualiza o estado */
  checkLicense: (mkAuthAddress: string) => Promise<LicenseValidationResponse>;
  /** Restaura a última validação do cache sem fazer chamada de rede */
  restoreFromCache: () => Promise<void>;
  /** Limpa tudo (ao fazer logout completo) */
  clearLicense: () => Promise<void>;
}

export const useLicenseStore = create<LicenseState>((set) => ({
  license: null,
  isChecking: false,
  lastCheckedAt: null,

  checkLicense: async (mkAuthAddress: string) => {
    console.log('🔍 [useLicenseStore] Iniciando verificação de licença...');
    set({ isChecking: true });

    try {
      const response = await licenseService.validateLicense(mkAuthAddress);
      set({
        license: response,
        isChecking: false,
        lastCheckedAt: Date.now(),
      });
      console.log('✅ [useLicenseStore] Licença verificada:', response.status);
      return response;
    } catch (error) {
      console.error('❌ [useLicenseStore] Erro ao verificar licença:', error);
      set({ isChecking: false });
      throw error;
    }
  },

  restoreFromCache: async () => {
    console.log('📦 [useLicenseStore] Restaurando licença do cache...');
    const cached = await licenseService.getCachedLicense();

    if (cached) {
      set({
        license: cached.response,
        lastCheckedAt: cached.lastCheckedAt,
      });
      console.log('✅ [useLicenseStore] Cache restaurado:', cached.response.status);
    } else {
      console.log('ℹ️ [useLicenseStore] Sem cache de licença disponível');
    }
  },

  clearLicense: async () => {
    await licenseService.clearCache();
    set({
      license: null,
      isChecking: false,
      lastCheckedAt: null,
    });
    console.log('🗑️ [useLicenseStore] Licença limpa');
  },
}));
