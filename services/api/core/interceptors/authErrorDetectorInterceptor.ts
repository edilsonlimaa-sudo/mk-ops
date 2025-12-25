import { AxiosError, AxiosResponse } from 'axios';

/**
 * Detecta se uma resposta indica erro de autenticação,
 * mesmo quando vem com status 200 (caso MK-Auth API)
 */
const isAuthenticationError = (response: AxiosResponse): boolean => {
  // Caso padrão: status 401
  if (response.status === 401) {
    return true;
  }

  // Caso MK-Auth: status 200 com objeto error contendo mensagem de autenticação
  if (response.status === 200 && response.data?.error?.text) {
    const errorText = response.data.error.text.toLowerCase();
    return (
      errorText.includes('token') ||
      errorText.includes('não autorizado') ||
      errorText.includes('nao autorizado')
    );
  }

  return false;
};

/**
 * Success Interceptor: Detecta erros de autenticação disfarçados de sucesso (HTTP 200)
 * Converte em erro 401 para que o tokenRefreshInterceptor possa processar
 */
export const authErrorDetectorSuccessHandler = (response: AxiosResponse) => {
  // Se detectar erro de autenticação, converte em erro 401
  if (isAuthenticationError(response)) {
    console.log('⚠️ Erro de autenticação detectado em resposta 200');
    
    // Cria um erro simulando 401 para o tokenRefreshInterceptor processar
    const error = new Error('Token inválido ou expirado') as AxiosError;
    error.response = {
      ...response,
      status: 401,
      statusText: 'Unauthorized',
    };
    error.config = response.config;
    
    return Promise.reject(error);
  }

  // Resposta legítima, deixa passar
  return response;
};

/**
 * Error handler: apenas passa o erro adiante
 */
export const authErrorDetectorErrorHandler = (error: AxiosError) => {
  return Promise.reject(error);
};
