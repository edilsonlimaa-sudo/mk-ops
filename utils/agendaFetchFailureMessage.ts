import axios, { AxiosError } from 'axios';

function isLikelyNetworkFailure(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    const ax = error as AxiosError;
    const code = (ax.code || '').toLowerCase();
    const msg = (ax.message || '').toLowerCase();
    return (
      code === 'err_network' ||
      code === 'econnaborted' ||
      code === 'enetunreach' ||
      msg.includes('network error') ||
      msg.includes('timeout')
    );
  }
  const raw = error instanceof Error ? error.message.toLowerCase() : '';
  return raw.includes('network') || raw.includes('timeout');
}

/**
 * Mensagem amigável para falha do fetch da agenda (carregamento inicial ou refresh).
 * Alinhado ao tom do onboarding (connection-error), sem expor "Network Error" cru.
 */
export function agendaFetchFailureMessage(
  error: unknown,
  context: 'initial' | 'refresh'
): string {
  const verb = context === 'initial' ? 'carregar' : 'atualizar';
  const prefix = `Não foi possível ${verb} a agenda.`;

  if (isLikelyNetworkFailure(error)) {
    return `${prefix} Verifique sua conexão ou tente novamente.`;
  }

  const raw = error instanceof Error ? error.message.trim() : '';
  if (raw && !/^network error$/i.test(raw)) {
    return `${prefix} ${raw}`;
  }

  return `${prefix} Tente novamente em instantes.`;
}
