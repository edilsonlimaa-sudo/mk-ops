import axios from 'axios';

/**
 * Detecta se um erro é de rede (offline, timeout, etc)
 * Usado para diferenciar erro de conectividade vs credenciais inválidas
 */
export const isNetworkError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const networkErrorCodes = ['ECONNABORTED', 'ERR_NETWORK'];
  const networkErrorMessages = ['Network Error', 'timeout'];

  const hasNetworkCode = error.code && networkErrorCodes.includes(error.code);
  const hasNetworkMessage = networkErrorMessages.some((msg) =>
    error.message.includes(msg)
  );

  return hasNetworkCode || hasNetworkMessage;
};
