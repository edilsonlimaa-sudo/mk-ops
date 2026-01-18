import axios, { AxiosError } from 'axios';

/**
 * Tipos de resultado da validação de credenciais
 */
export type ValidationResultType =
  | 'success'
  | 'invalid-url'
  | 'connection-error'
  | 'invalid-credentials'
  | 'not-mkauth-api'
  | 'unknown-error';

export interface ValidationResult {
  type: ValidationResultType;
  success: boolean;
  message: string;
  token?: string;
  details?: string;
}

export interface ValidationCredentials {
  serverUrl: string;
  clientId: string;
  clientSecret: string;
}

/**
 * Tipos para validação de permissões
 */
export type HttpMethod = 'GET' | 'PUT';

export interface RequiredPermission {
  controller: string;
  method: HttpMethod;
  endpoint: string;
  description: string;
}

export interface PermissionCheckResult {
  permission: RequiredPermission;
  granted: boolean;
  error?: string;
}

export interface PermissionsValidationResult {
  success: boolean;
  allGranted: boolean;
  results: PermissionCheckResult[];
  missingPermissions: RequiredPermission[];
  message: string;
}

/**
 * Permissões necessárias para o app funcionar
 */
const REQUIRED_PERMISSIONS: RequiredPermission[] = [
  // Chamado
  { controller: 'Chamado', method: 'GET', endpoint: '/chamado/listar/limite=1', description: 'Listar chamados' },
  { controller: 'Chamado', method: 'PUT', endpoint: '/chamado/editar', description: 'Editar chamados' },
  // Cliente
  { controller: 'Cliente', method: 'GET', endpoint: '/cliente/listar/limite=1', description: 'Listar clientes' },
  { controller: 'Cliente', method: 'PUT', endpoint: '/cliente/editar', description: 'Editar clientes' },
  // Funcionarios
  { controller: 'Funcionarios', method: 'GET', endpoint: '/funcionarios/listar/pagina=1', description: 'Listar funcionários' },
  // Instalacao
  { controller: 'Instalacao', method: 'GET', endpoint: '/instalacao/listar/limite=1', description: 'Listar instalações' },
  { controller: 'Instalacao', method: 'PUT', endpoint: '/instalacao/editar', description: 'Editar instalações' },
  // Plano
  { controller: 'Plano', method: 'GET', endpoint: '/plano/listar/limite=1', description: 'Listar planos' },
  // Usuario
  { controller: 'Usuario', method: 'GET', endpoint: '/usuario/listar/limite=1', description: 'Listar usuários' },
];

/**
 * Mensagens amigáveis para cada tipo de erro
 */
const MESSAGES: Record<ValidationResultType, string> = {
  'success': 'Conexão estabelecida com sucesso!',
  'invalid-url': 'URL inválida. Verifique o endereço informado.',
  'connection-error': 'Não foi possível conectar. Verifique a URL e sua conexão.',
  'invalid-credentials': 'Client ID ou Client Secret inválidos.',
  'not-mkauth-api': 'Esta URL não parece ser uma API MK-Auth válida.',
  'unknown-error': 'Erro desconhecido ao validar conexão.',
};

/**
 * Serviço de validação para onboarding
 * 
 * Usa axios puro (sem interceptors) para evitar conflitos com
 * o fluxo de refresh de token do apiClient.
 * 
 * Detecta com precisão os diferentes cenários de erro:
 * - URL inválida ou mal formada
 * - Host/DNS inexistente
 * - Credenciais inválidas (403 MK-Auth)
 * - URL válida mas não é API MK-Auth
 */
class OnboardingValidationService {
  
  /**
   * Valida as credenciais e URL do MK-Auth
   */
  async validateCredentials(credentials: ValidationCredentials): Promise<ValidationResult> {
    const { serverUrl, clientId, clientSecret } = credentials;

    console.log('🔐 [OnboardingValidation] Validando credenciais...');
    console.log('🔐 [OnboardingValidation] URL:', serverUrl);

    // Monta URL completa
    const cleanUrl = serverUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const fullUrl = `https://${cleanUrl}/api/`;

    console.log('🔐 [OnboardingValidation] Full URL:', fullUrl);

    // Monta Basic Auth
    const authString = `${clientId}:${clientSecret}`;
    const base64Auth = btoa(authString);

    try {
      const response = await axios.get(fullUrl, {
        headers: { 'Authorization': `Basic ${base64Auth}` },
        timeout: 15000,
        // Não seguir redirects automaticamente (detectar sites comuns)
        maxRedirects: 0,
        // Aceitar qualquer status para analisar manualmente
        validateStatus: () => true,
      });

      console.log('🔐 [OnboardingValidation] Response status:', response.status);
      console.log('🔐 [OnboardingValidation] Response data:', JSON.stringify(response.data).substring(0, 200));

      return this.analyzeResponse(response.status, response.data);

    } catch (error) {
      console.log('❌ [OnboardingValidation] Axios error:', (error as Error).message);
      console.log('❌ [OnboardingValidation] Error code:', (error as AxiosError).code);
      return this.analyzeError(error as AxiosError);
    }
  }

  /**
   * Analisa resposta HTTP recebida
   */
  private analyzeResponse(status: number, data: unknown): ValidationResult {
    // Status 200 - verificar se é JWT válido
    if (status === 200) {
      return this.analyze200Response(data);
    }

    // Status 403 - verificar se é erro MK-Auth
    if (status === 403) {
      return this.analyze403Response(data);
    }

    // Status 3xx - redirect (provavelmente site comum)
    if (status >= 300 && status < 400) {
      return {
        type: 'not-mkauth-api',
        success: false,
        message: MESSAGES['not-mkauth-api'],
        details: `Servidor retornou redirect (${status}). Verifique se a URL está correta.`,
      };
    }

    // Status 404 - endpoint não existe
    if (status === 404) {
      return {
        type: 'not-mkauth-api',
        success: false,
        message: MESSAGES['not-mkauth-api'],
        details: 'Endpoint /api/ não encontrado neste servidor.',
      };
    }

    // Status 5xx - erro do servidor
    if (status >= 500) {
      return {
        type: 'connection-error',
        success: false,
        message: 'Servidor retornou erro interno. Tente novamente mais tarde.',
        details: `Status: ${status}`,
      };
    }

    // Outros status inesperados
    return {
      type: 'not-mkauth-api',
      success: false,
      message: MESSAGES['not-mkauth-api'],
      details: `Resposta inesperada (status ${status}).`,
    };
  }

  /**
   * Analisa resposta 200 - deve conter JWT válido
   */
  private analyze200Response(data: unknown): ValidationResult {
    // JWT é string começando com "eyJ" (header base64)
    const isJwtString = typeof data === 'string' && data.startsWith('eyJ');
    
    // Ou objeto com campo token
    const hasTokenField = 
      typeof data === 'object' && 
      data !== null && 
      'token' in data &&
      typeof (data as { token: unknown }).token === 'string' &&
      (data as { token: string }).token.startsWith('eyJ');

    if (isJwtString) {
      return {
        type: 'success',
        success: true,
        message: MESSAGES['success'],
        token: data as string,
      };
    }

    if (hasTokenField) {
      return {
        type: 'success',
        success: true,
        message: MESSAGES['success'],
        token: (data as { token: string }).token,
      };
    }

    // 200 mas não é JWT - verifica se é HTML (site comum)
    if (typeof data === 'string' && data.includes('<!DOCTYPE') || data?.toString().includes('<html')) {
      return {
        type: 'not-mkauth-api',
        success: false,
        message: MESSAGES['not-mkauth-api'],
        details: 'Servidor retornou uma página HTML, não uma API.',
      };
    }

    // 200 com conteúdo inesperado
    return {
      type: 'not-mkauth-api',
      success: false,
      message: MESSAGES['not-mkauth-api'],
      details: 'Resposta não contém um token JWT válido.',
    };
  }

  /**
   * Analisa resposta 403 - deve ser erro de credenciais MK-Auth
   */
  private analyze403Response(data: unknown): ValidationResult {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Mensagens conhecidas do MK-Auth para credenciais inválidas
    const isMkAuthCredentialError = 
      dataString.includes('Requisicao nao autorizada') ||
      dataString.includes('Autenticacao invalida') ||
      dataString.includes('nao autorizada');

    if (isMkAuthCredentialError) {
      return {
        type: 'invalid-credentials',
        success: false,
        message: MESSAGES['invalid-credentials'],
        details: 'Verifique o Client ID e Client Secret no painel MK-Auth.',
      };
    }

    // 403 de outro servidor (não MK-Auth)
    return {
      type: 'not-mkauth-api',
      success: false,
      message: MESSAGES['not-mkauth-api'],
      details: 'Servidor retornou 403, mas não é o padrão MK-Auth.',
    };
  }

  /**
   * Analisa erros de rede/axios
   */
  private analyzeError(error: AxiosError): ValidationResult {
    const message = error.message?.toLowerCase() || '';
    const code = error.code?.toLowerCase() || '';

    // DNS não encontrado
    if (code === 'enotfound' || message.includes('getaddrinfo')) {
      return {
        type: 'connection-error',
        success: false,
        message: 'Servidor não encontrado. Verifique a URL digitada.',
        details: 'Não foi possível resolver o endereço do servidor.',
      };
    }

    // Conexão recusada
    if (code === 'econnrefused') {
      return {
        type: 'connection-error',
        success: false,
        message: 'Conexão recusada pelo servidor.',
        details: 'O servidor não está aceitando conexões nesta porta.',
      };
    }

    // Timeout
    if (code === 'econnaborted' || message.includes('timeout')) {
      return {
        type: 'connection-error',
        success: false,
        message: 'Tempo de conexão esgotado. Tente novamente.',
        details: 'O servidor demorou muito para responder.',
      };
    }

    // Protocolo inválido
    if (message.includes('unsupported protocol') || message.includes('invalid url')) {
      return {
        type: 'invalid-url',
        success: false,
        message: MESSAGES['invalid-url'],
        details: 'Formato de URL inválido.',
      };
    }

    // Erro de certificado SSL
    if (message.includes('certificate') || message.includes('ssl') || code === 'cert_has_expired') {
      return {
        type: 'connection-error',
        success: false,
        message: 'Erro de certificado SSL do servidor.',
        details: 'O certificado de segurança do servidor pode estar expirado.',
      };
    }

    // Sem conexão de rede
    if (message.includes('network') || code === 'err_network') {
      return {
        type: 'connection-error',
        success: false,
        message: 'Sem conexão com a internet.',
        details: 'Verifique sua conexão de rede.',
      };
    }

    // Erro genérico
    return {
      type: 'unknown-error',
      success: false,
      message: MESSAGES['unknown-error'],
      details: error.message,
    };
  }

  /**
   * Valida todas as permissões necessárias para o app
   * 
   * Gera um token novo internamente para evitar problemas de expiração.
   * Requests são executadas sequencialmente para respeitar rate limiting da API.
   */
  async validatePermissions(
    credentials: ValidationCredentials,
    onProgress?: (current: number, total: number, permission: RequiredPermission) => void
  ): Promise<PermissionsValidationResult> {
    // 1. Primeiro gera um token fresco
    const authResult = await this.validateCredentials(credentials);
    
    if (!authResult.success || !authResult.token) {
      return {
        success: false,
        allGranted: false,
        results: [],
        missingPermissions: REQUIRED_PERMISSIONS,
        message: `Falha ao autenticar: ${authResult.message}`,
      };
    }

    const token = authResult.token;
    const cleanUrl = credentials.serverUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const baseUrl = `https://${cleanUrl}/api`;

    const results: PermissionCheckResult[] = [];
    const total = REQUIRED_PERMISSIONS.length;

    // 2. Verifica cada permissão SEQUENCIALMENTE (rate limiting)
    for (let i = 0; i < REQUIRED_PERMISSIONS.length; i++) {
      const permission = REQUIRED_PERMISSIONS[i];
      
      // Callback de progresso
      onProgress?.(i + 1, total, permission);

      const result = await this.checkSinglePermission(baseUrl, token, permission);
      results.push(result);
      
      // Pequeno delay entre requests para evitar rate limiting
      if (i < REQUIRED_PERMISSIONS.length - 1) {
        await this.delay(100);
      }
    }

    const missingPermissions = results
      .filter(r => !r.granted)
      .map(r => r.permission);

    const allGranted = missingPermissions.length === 0;

    return {
      success: true,
      allGranted,
      results,
      missingPermissions,
      message: allGranted
        ? 'Todas as permissões estão configuradas corretamente!'
        : `${missingPermissions.length} permissão(ões) não configurada(s).`,
    };
  }

  /**
   * Verifica uma única permissão
   */
  private async checkSinglePermission(
    baseUrl: string,
    token: string,
    permission: RequiredPermission
  ): Promise<PermissionCheckResult> {
    const url = `${baseUrl}${permission.endpoint}`;

    try {
      const config = {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 10000,
        validateStatus: () => true,
      };

      const response = permission.method === 'GET'
        ? await axios.get(url, config)
        : await axios.put(url, {}, config);

      // Verifica se é erro de permissão
      if (response.status === 200 && response.data?.error?.text) {
        const errorText = response.data.error.text as string;
        
        // Padrão: "Permissao de acesso {METHOD} ao controle {CONTROLLER} negado"
        if (errorText.toLowerCase().includes('permissao') && errorText.toLowerCase().includes('negado')) {
          return {
            permission,
            granted: false,
            error: errorText,
          };
        }
      }

      // Se não teve erro de permissão, está OK (mesmo que retorne array vazio ou erro de validação)
      return {
        permission,
        granted: true,
      };

    } catch (error) {
      // Erro de rede - não conseguimos verificar
      return {
        permission,
        granted: false,
        error: `Erro ao verificar: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Retorna a lista de permissões necessárias (para exibir na UI)
   */
  getRequiredPermissions(): RequiredPermission[] {
    return [...REQUIRED_PERMISSIONS];
  }

  /**
   * Helper para delay entre requests (rate limiting)
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const onboardingValidationService = new OnboardingValidationService();
