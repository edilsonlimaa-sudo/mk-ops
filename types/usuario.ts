export interface Usuario {
  uuid: string;
  login: string;
  email: string | null;
  avatar: string;
  ultacesso: string;
  nivel: string;
}

export interface UsuarioListResponse {
  total_registros: number;
  consulta_atual: number;
  pagina_atual: number;
  total_paginas: number;
  usuarios: Usuario[];
}

export interface UsuarioDetalhado extends Usuario {
  idacesso: string;
  uuid_acesso: string;
  validade: string;
  sha: string;
  nome: string;
  horario: string;
  tempoil: string | null;
  tempofl: string | null;
  ativo: string;
  key_onetime: string | null;
  ga: string;
  cli_grupos: string;
  sesid: string;
  func: string;
  permissoes: string[];
}
