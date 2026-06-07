import { normalizeMkAuthAddress } from '@/utils/license';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LicenseCacheData } from './types';

const CACHE_KEY = 'license_cache';

/** TTL do cache offline: 7 dias em ms */
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Intervalo mínimo entre validações: 1 dia em ms */
export const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

/**
 * License Storage — persiste e recupera o cache de validação de licença.
 * Usa AsyncStorage (dados não-sensíveis, similar ao padrão de stores de onboarding).
 */
class LicenseStorage {
  /**
   * Salva o resultado de uma validação no cache local.
   * O endereço já deve vir normalizado do LicenseService.
   */
  async save(data: LicenseCacheData): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      console.log('💾 [LicenseStorage] Cache salvo para:', data.mkAuthAddress);
    } catch (error) {
      console.error('❌ [LicenseStorage] Erro ao salvar cache:', error);
    }
  }

  /**
   * Recupera o cache. Retorna null se não existir ou estiver expirado (> 7 dias).
   */
  async get(): Promise<LicenseCacheData | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (!raw) return null;

      const data: LicenseCacheData = JSON.parse(raw);
      const age = Date.now() - data.lastCheckedAt;

      if (age > CACHE_TTL_MS) {
        console.log('⏰ [LicenseStorage] Cache expirado (> 7 dias), descartando');
        await this.clear();
        return null;
      }

      console.log('📦 [LicenseStorage] Cache recuperado, idade:', Math.floor(age / 3600000), 'horas');
      return data;
    } catch (error) {
      console.error('❌ [LicenseStorage] Erro ao ler cache:', error);
      return null;
    }
  }

  /**
   * Verifica se a última checagem foi há menos de 1 dia.
   * Se true, não precisa revalidar hoje.
   */
  async isCheckedToday(): Promise<boolean> {
    try {
      const cache = await this.get();
      if (!cache) return false;

      const age = Date.now() - cache.lastCheckedAt;
      return age < CHECK_INTERVAL_MS;
    } catch {
      return false;
    }
  }

  /**
   * Recupera o cache apenas se o endereço corresponder (após normalização).
   */
  async getForAddress(mkAuthAddress: string): Promise<LicenseCacheData | null> {
    const cache = await this.get();
    if (!cache) return null;

    const normalizedInput = normalizeMkAuthAddress(mkAuthAddress);
    const normalizedCache = normalizeMkAuthAddress(cache.mkAuthAddress);

    if (normalizedInput !== normalizedCache) {
      console.log('⚠️ [LicenseStorage] Cache é de outro servidor, descartando');
      console.log('  - Cache:', normalizedCache);
      console.log('  - Atual:', normalizedInput);
      return null;
    }

    return cache;
  }

  /**
   * Remove o cache local.
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      console.log('🗑️ [LicenseStorage] Cache limpo');
    } catch (error) {
      console.error('❌ [LicenseStorage] Erro ao limpar cache:', error);
    }
  }
}

export const licenseStorage = new LicenseStorage();
