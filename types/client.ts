/**
 * Client entity from MK-Auth API
 * Contains all fields returned by /api/cliente/listar endpoint
 * Total: 154 fields organized by category
 */
export interface Client {
  // === Identificação Única ===
  id: string;
  uuid_cliente: string;
  uuid: string;
  codigo: string;

  // === Identificação Pessoal ===
  nome: string;
  cpf_cnpj: string;
  rg: string;
  ie: string | null;
  nascimento: string;
  estado_civil: string;
  pessoa: string;
  tipo_pessoa: string;
  tipo_cliente: string;
  nome_pai: string | null;
  nome_mae: string | null;
  expedicao_rg: string | null;
  naturalidade: string | null;
  foto: string;

  // === Contatos ===
  email: string;
  rec_email: string;
  fone: string;
  celular: string;
  celular2: string | null;
  nextel: string | null;
  opcelular: string;
  opcelular2: string;
  ramal: string;
  responsavel: string | null;

  // === Endereço de Instalação ===
  endereco: string;
  numero: string | null;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  coordenadas: string;
  cidade_ibge: string;
  estado_ibge: string;

  // === Endereço Residencial/Cobrança ===
  endereco_res: string;
  numero_res: string | null;
  complemento_res: string;
  bairro_res: string;
  cidade_res: string;
  estado_res: string;
  cep_res: string;
  nome_res: string;

  // === Autenticação e Acesso ===
  login: string;
  senha: string;
  altsenha: string;
  user_ip: string | null;
  user_mac: string | null;
  data_ip: string | null;
  data_mac: string | null;
  login_atend: string;

  // === Conexão e Rede ===
  tipo: string;
  ip: string | null;
  ipvsix: string | null;
  mac: string | null;
  autoip: string;
  automac: string;
  ipfall: string | null;
  pool_name: string;
  pool6: string | null;
  accesslist: string;
  simultaneo: string;
  interface: string | null;
  acessacen: string;

  // === Plano e Serviços ===
  plano: string;
  plano15: string;
  turbo: string;
  statusturbo: string;
  night: string;
  planodown: string;
  ligoudown: string;
  statusdown: string;
  plano_bloqc: string;
  ltrafego: string;

  // === Cobrança e Financeiro ===
  venc: string;
  tipo_cob: string;
  conta: string;
  conta_cartao: string;
  desconto: string;
  acrescimo: string;
  adesao: string;
  valor_sva: string;
  isento: string;
  geranfe: string;
  mesref: string;
  tit_abertos: string;
  tit_vencidos: string;
  parc_abertas: string;
  prilanc: string;
  resumo: string;
  dot_ref: string | null;
  fortunus: string;

  // === Equipamentos e Infraestrutura ===
  equipamento: string;
  comodato: string;
  mac_serial: string | null;
  onu_ont: string | null;
  porta_olt: string | null;
  armario_olt: string | null;
  porta_splitter: string | null;
  caixa_herm: string | null;
  switch: string | null;
  ssid: string | null;

  // === Status e Controle ===
  cli_ativado: string;
  bloqueado: string;
  tipobloq: string;
  status_corte: string;
  data_bloq: string | null;
  data_desbloq: string;
  data_desativacao: string | null;
  pgcorte: string;
  pgaviso: string;
  dias_corte: string;
  aviso: string;

  // === Datas e Registro ===
  cadastro: string;
  last_update: string;
  data_ins: string | null;

  // === Observações e Notas ===
  obs: string | null;
  observacao: string;
  rem_obs: string | null;
  tags: string | null;

  // === Outros Controles ===
  contrato: string;
  termo: string;
  chavetipo: string;
  chave: string | null;
  send: string;
  grupo: string;
  vendedor: string | null;
  tecnico: string | null;
  mbdisco: string;
  sms: string;
  zap: string;
  gsici: string;
  local_dici: string;
}

/**
 * Paginated response from /api/cliente/listar endpoint
 */
export interface ClientListResponse {
  total_registros: number;
  consulta_atual: number;
  pagina_atual: number;
  total_paginas: number;
  clientes: Client[];
}

/**
 * Payload for updating a client
 * - All Client fields are optional (partial update)
 * - uuid is required for identification (maps to uuid_cliente in API)
 */
export type UpdateClientPayload = Partial<Client> & {
  uuid: string; // Required: identifies the client (uuid_cliente)
};
