import { normalizeMkAuthAddress } from '@/utils/license';
import { mockValidateLicense } from './mock';
import { licenseStorage } from './storage';
import { LicenseCacheData, LicenseValidationRequest, LicenseValidationResponse } from './types';

/**
 * Quando true, todas as chamadas usam dados mockados.
 * Trocar para false quando o backend estiver pronto.
 *
 * Contrato da API:
 *   POST https://license.mkops.com/api/v1/license/validate
 *   Body:  { mkAuthAddress: string }
 *   Response: LicenseValidationResponse
 */
const MOCK_MODE = true;
const API_BASE_URL = 'https://license.mkops.com/api/v1';

/**
 * LicenseService — responsável por validar licenças corporativas.
 * Abstrai a fonte dos dados (mock vs API real) e gerencia o cache.
 */
class LicenseService {
  /**
   * Valida a licença junto ao servidor (ou mock).
   * Salva resultado em cache para uso offline.
   */
  async validateLicense(mkAuthAddress: string): Promise<LicenseValidationResponse> {
    // Normaliza o endereço antes de qualquer operação
    const normalizedAddress = normalizeMkAuthAddress(mkAuthAddress);
    const request: LicenseValidationRequest = { mkAuthAddress: normalizedAddress };

    console.log('🔐 [LicenseService] Validando licença para:', normalizedAddress);
    console.log('🔐 [LicenseService] MOCK_MODE:', MOCK_MODE);

    try {
      let response: LicenseValidationResponse;

      if (MOCK_MODE) {
        response = await mockValidateLicense(request);
      } else {
        // 🌐 REAL: Chama API quando backend estiver pronto
        const res = await fetch(`${API_BASE_URL}/license/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
          signal: AbortSignal.timeout(10_000), // 10s timeout
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        response = await res.json();
      }

      // Salvar em cache (independente do resultado)
      const cacheData: LicenseCacheData = {
        mkAuthAddress: normalizedAddress,
        lastCheckedAt: Date.now(),
        response,
      };
      await licenseStorage.save(cacheData);

      console.log('✅ [LicenseService] Validação concluída:', response.status);
      return response;
    } catch (error) {
      console.warn('⚠️ [LicenseService] Erro ao validar online, tentando cache:', error);

      // Fallback: retornar cache se existir e for < 7 dias
      const cache = await licenseStorage.get();
      if (cache && cache.mkAuthAddress === normalizedAddress) {
        console.log('📦 [LicenseService] Usando cache como fallback');
        return cache.response;
      }

      // Sem cache válido — não conseguiu verificar
      console.error('❌ [LicenseService] Sem cache válido disponível');
      throw error;
    }
  }

  /**
   * Retorna o cache local sem fazer chamada de rede.
   * Usado no bootstrap para restaurar estado sem delay.
   */
  async getCachedLicense(): Promise<LicenseCacheData | null> {
    return licenseStorage.get();
  }

  /**
   * Verifica se a licença já foi checada hoje (< 24h).
   */
  async isCheckedToday(): Promise<boolean> {
    return licenseStorage.isCheckedToday();
  }

  /**
   * Limpa cache local (ex: ao fazer logout).
   */
  async clearCache(): Promise<void> {
    await licenseStorage.clear();
  }
}

export const licenseService = new LicenseService();
