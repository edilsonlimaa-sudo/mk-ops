import { LicenseValidationRequest, LicenseValidationResponse } from './types';

/**
 * Mock responses para os 5 cenários de teste.
 * Altere MOCK_SCENARIO para mudar o comportamento durante desenvolvimento.
 *
 * Cenários:
 *   1 - valid_long      → Licença válida (expira em 60 dias)
 *   2 - valid_expiring  → Licença próxima do vencimento (3 dias)
 *   3 - grace_period    → Expirada mas dentro da graça (4 dias restantes)
 *   4 - fully_expired   → Expirada e período de graça acabou
 *   5 - not_found       → Licença não encontrada
 */
export type MockScenario =
  | 'valid_long'
  | 'valid_expiring'
  | 'grace_period'
  | 'fully_expired'
  | 'not_found';

export let MOCK_SCENARIO: MockScenario = 'valid_long';

/** Muda o cenário mock (útil durante desenvolvimento/testes) */
export function setMockScenario(scenario: MockScenario) {
  MOCK_SCENARIO = scenario;
}

/** Simula delay de rede (800ms) */
const delay = (ms = 800) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Retorna data ISO adicionando `days` ao dia atual */
function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export async function mockValidateLicense(
  _request: LicenseValidationRequest,
): Promise<LicenseValidationResponse> {
  await delay();

  switch (MOCK_SCENARIO) {
    case 'valid_long':
      return {
        valid: true,
        status: 'active',
        clientName: 'Empresa Demo',
        expiresAt: daysFromNow(60),
        gracePeriodEndsAt: daysFromNow(67),
      };

    case 'valid_expiring':
      return {
        valid: true,
        status: 'active',
        clientName: 'Empresa Demo',
        expiresAt: daysFromNow(3),
        gracePeriodEndsAt: daysFromNow(10),
      };

    case 'grace_period':
      return {
        valid: true, // Ainda permite acesso durante a graça
        status: 'expired',
        reason: 'expired',
        clientName: 'Empresa Demo',
        expiresAt: daysFromNow(-3), // Expirou 3 dias atrás
        gracePeriodEndsAt: daysFromNow(4), // Mais 4 dias de graça
      };

    case 'fully_expired':
      return {
        valid: false,
        status: 'expired',
        reason: 'expired',
        clientName: 'Empresa Demo',
        expiresAt: daysFromNow(-10),
        gracePeriodEndsAt: daysFromNow(-3),
      };

    case 'not_found':
    default:
      return {
        valid: false,
        status: 'not_found',
        reason: 'not_found',
      };
  }
}
