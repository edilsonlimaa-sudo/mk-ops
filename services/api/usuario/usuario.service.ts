import { Usuario, UsuarioDetalhado, UsuarioListResponse } from '@/types/usuario';
import bcrypt from 'bcryptjs';
import * as Crypto from 'expo-crypto';
import apiClient from '../core/apiClient';

/**
 * Fetches a single page of users
 * @param page - Page number (1-indexed)
 * @returns Paginated response with users (empty array if no records found)
 */
const fetchUsuarioPage = async (page: number): Promise<UsuarioListResponse> => {
  const response = await apiClient.get(
    `/api/usuario/listar/pagina=${page}`
  );
  
  // Handle "Registros nao encontrados" response (200 status, no data)
  if (response.data?.mensagem?.includes('Registros nao encontrados')) {
    return {
      total_registros: 0,
      consulta_atual: 0,
      pagina_atual: page,
      total_paginas: 0,
      usuarios: [],
    };
  }
  
  return response.data;
};

/**
 * Fetches ALL users from all pages
 * @returns Array of all users (empty array if no data)
 */
export const fetchAllUsuarios = async (): Promise<Usuario[]> => {
  console.log('🔍 [UsuarioService] Iniciando busca de usuários...');
  
  try {
    const firstPage = await fetchUsuarioPage(1);
    const { total_paginas, usuarios } = firstPage;

    console.log(`📊 [UsuarioService] Total de páginas: ${total_paginas}, Usuários na página 1: ${usuarios.length}`);

    // No data or only one page
    if (total_paginas <= 1) {
      console.log(`✅ [UsuarioService] Retornando ${usuarios.length} usuários`);
      return usuarios;
    }

    // Fetch remaining pages in parallel
    const remainingPages = Array.from({ length: total_paginas - 1 }, (_, i) => i + 2);
    console.log(`🚀 [UsuarioService] Buscando ${remainingPages.length} páginas restantes em paralelo...`);
    const remainingResults = await Promise.all(remainingPages.map(fetchUsuarioPage));

    const allUsuarios = [
      ...usuarios,
      ...remainingResults.flatMap((result) => result.usuarios),
    ];

    console.log(`✅ [UsuarioService] Total de ${allUsuarios.length} usuários carregados`);
    return allUsuarios;
  } catch (error) {
    console.error('❌ [UsuarioService] Erro ao buscar usuários:', error);
    throw error;
  }
};

/**
 * Fetches detailed information for a specific user by UUID
 * @param uuid - User UUID
 * @returns Detailed user information
 */
export const fetchUsuarioDetail = async (uuid: string): Promise<UsuarioDetalhado> => {
  console.log(`🔍 [UsuarioService] Buscando detalhes do usuário ${uuid}...`);
  
  try {
    const response = await apiClient.get(`/api/usuario/show/${uuid}`);
    console.log(`✅ [UsuarioService] Detalhes do usuário ${uuid} carregados`);
    return response.data;
  } catch (error) {
    console.error(`❌ [UsuarioService] Erro ao buscar detalhes do usuário ${uuid}:`, error);
    throw error;
  }
};

/**
 * Searches for a user by login
 * @param login - User login
 * @returns Paginated response with matching users
 */
export const searchUsuarioByLogin = async (login: string): Promise<UsuarioListResponse> => {
  console.log(`🔍 [UsuarioService] Buscando usuário com login: ${login}...`);
  
  try {
    const response = await apiClient.get(`/api/usuario/listar/login=${login}`);
    
    // Handle "Registros nao encontrados" response
    if (response.data?.mensagem?.includes('Registros nao encontrados')) {
      return {
        total_registros: 0,
        consulta_atual: 0,
        pagina_atual: 1,
        total_paginas: 0,
        usuarios: [],
      };
    }
    
    console.log(`✅ [UsuarioService] Encontrado(s) ${response.data.usuarios.length} usuário(s)`);
    return response.data;
  } catch (error) {
    console.error(`❌ [UsuarioService] Erro ao buscar usuário ${login}:`, error);
    throw error;
  }
};

/**
 * Validates user password using SHA-256 + bcrypt and returns detailed user data if valid
 * @param usuarioUuid - User UUID
 * @param password - Plain text password
 * @returns Detailed user information if password is valid
 * @throws Error if password is invalid or user fetch fails
 */
export const validatePassword = async (
  usuarioUuid: string,
  password: string
): Promise<UsuarioDetalhado> => {
  console.log(`🔐 [UsuarioService] Validando senha para usuário ${usuarioUuid}...`);

  try {
    // 1. Fetch complete user data including password hash
    const usuarioDetalhado = await fetchUsuarioDetail(usuarioUuid);
    console.log('✅ [UsuarioService] Dados completos do usuário obtidos');

    // 2. Hash password with SHA-256
    console.log('🔒 [UsuarioService] Gerando hash SHA-256 da senha...');
    const sha256Hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );

    // 3. Convert PHP bcrypt format ($2y$) to JS format ($2a$)
    const bcryptHash = usuarioDetalhado.sha.replace('$2y$', '$2a$');

    // 4. Compare SHA-256 hash with stored bcrypt hash
    console.log('🔍 [UsuarioService] Comparando hashes...');
    const isValid = await bcrypt.compare(sha256Hash, bcryptHash);

    if (!isValid) {
      console.log('❌ [UsuarioService] Senha incorreta');
      throw new Error('Senha incorreta');
    }

    console.log('✅ [UsuarioService] Senha validada com sucesso');
    return usuarioDetalhado;
  } catch (error) {
    if (error instanceof Error && error.message === 'Senha incorreta') {
      throw error; // Re-throw validation error
    }
    console.error(`❌ [UsuarioService] Erro ao validar senha:`, error);
    throw new Error('Erro ao validar senha');
  }
};
