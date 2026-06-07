import { LicenseValidationResponse } from '@/services/license/types';

/**
 * Normaliza o endereço do servidor mk-auth para garantir consistência.
 * Remove protocolo, trailing slash e converte para lowercase.
 * 
 * Exemplos:
 *   '192.168.1.10'           -> '192.168.1.10'
 *   'HTTP://192.168.1.10/'   -> '192.168.1.10'
 *   'empresa.mkauth.com/'    -> 'empresa.mkauth.com'
 */
export function normalizeMkAuthAddress(address: string): string {
  return address
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')  // Remove http:// ou https://
    .replace(/\/$/, '');            // Remove trailing slash
}

/** Número de dias entre hoje e a data de expiração (negativo se já expirou) */
export function getDaysUntilExpiration(expiresAt: string | undefined): number {
  if (!expiresAt) return Infinity;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Número de dias restantes no período de graça (negativo se acabou) */
export function getDaysUntilGraceEnd(gracePeriodEndsAt: string | undefined): number {
  if (!gracePeriodEndsAt) return 0;
  const diff = new Date(gracePeriodEndsAt).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Retorna true se estiver dentro do período de graça (expirada mas ainda acessível) */
export function isInGracePeriod(license: LicenseValidationResponse): boolean {
  if (license.status !== 'expired') return false;
  return getDaysUntilGraceEnd(license.gracePeriodEndsAt) > 0;
}

/**
 * Retorna o limiar de aviso para exibir o banner.
 * null = sem aviso necessário
 * number = dias restantes (7, 3, ou 1)
 */
export function getExpirationWarningDays(
  license: LicenseValidationResponse | null,
): number | null {
  if (!license || !license.expiresAt) return null;

  // Período de graça: avisa sempre (dias de graça restantes)
  if (isInGracePeriod(license)) {
    return getDaysUntilGraceEnd(license.gracePeriodEndsAt);
  }

  const days = getDaysUntilExpiration(license.expiresAt);
  if (days <= 1) return 1;
  if (days <= 3) return 3;
  if (days <= 7) return 7;

  return null;
}

/** Retorna se o acesso deve ser bloqueado completamente */
export function isAccessBlocked(license: LicenseValidationResponse | null): boolean {
  if (!license) return false;
  // Bloqueia apenas se não for válido e não estiver em graça
  return !license.valid;
}

/** Severidade do aviso para determinar cor do banner */
export type WarningSeverity = 'warning' | 'danger' | 'critical';

export function getWarningSeverity(daysRemaining: number): WarningSeverity {
  if (daysRemaining <= 1) return 'critical'; // vermelho
  if (daysRemaining <= 3) return 'danger'; // laranja
  return 'warning'; // amarelo
}
