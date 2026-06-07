import { licenseService } from '@/services/license/LicenseService';
import { useAuthStore } from '@/stores/auth';
import { useLicenseStore } from '@/stores/license/useLicenseStore';
import {
    getDaysUntilExpiration,
    getDaysUntilGraceEnd,
    getExpirationWarningDays,
    isAccessBlocked,
    isInGracePeriod,
    normalizeMkAuthAddress,
} from '@/utils/license';

/**
 * useLicenseValidation — hook principal para gerenciar validação de licença.
 *
 * Responsabilidades:
 * - Verificar 1x por dia se a licença está válida
 * - Expor estado derivado (dias restantes, avisos, bloqueio)
 * - Fornecer `checkNow()` para revalidação manual
 */
export function useLicenseValidation() {
  const { license, isChecking, lastCheckedAt, checkLicense, clearLicense } = useLicenseStore();
  const ipMkAuth = useAuthStore((state) => state.ipMkAuth);

  const daysUntilExpiration = getDaysUntilExpiration(license?.expiresAt);
  const daysUntilGraceEnd = getDaysUntilGraceEnd(license?.gracePeriodEndsAt);
  const warningDays = getExpirationWarningDays(license);
  const inGracePeriod = license ? isInGracePeriod(license) : false;
  const accessBlocked = isAccessBlocked(license);

  /**
   * Verifica licença se necessário (apenas 1x por dia).
   * Chamado pelo AppLayout na abertura do app.
   */
  const checkIfNeeded = async () => {
    if (!ipMkAuth) {
      console.log('⚠️ [useLicenseValidation] Sem ipMkAuth, pulando verificação');
      return;
    }

    const normalizedAddress = normalizeMkAuthAddress(ipMkAuth);
    const alreadyCheckedToday = await licenseService.isCheckedToday();
    if (alreadyCheckedToday) {
      console.log('ℹ️ [useLicenseValidation] Licença já verificada hoje, usando cache');
      return;
    }

    console.log('🔄 [useLicenseValidation] Verificando licença (1ª abertura do dia)...');
    return checkLicense(normalizedAddress);
  };

  /**
   * Força revalidação imediata (ex: botão "Verificar novamente").
   */
  const checkNow = async () => {
    if (!ipMkAuth) return;
    const normalizedAddress = normalizeMkAuthAddress(ipMkAuth);
    return checkLicense(normalizedAddress);
  };

  return {
    // Estado
    license,
    isChecking,
    lastCheckedAt,

    // Estado derivado
    isValid: license?.valid ?? false,
    isExpired: license?.status === 'expired',
    inGracePeriod,
    accessBlocked,
    daysUntilExpiration,
    daysUntilGraceEnd,
    warningDays, // null = sem aviso; number = dias restantes para mostrar banner

    // Ações
    checkIfNeeded,
    checkNow,
    clearLicense,
  };
}
