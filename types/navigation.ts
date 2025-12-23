/**
 * Navigation types for type-safe routing
 * Based on Expo Router v3+ with file-based routing
 */

/**
 * App Stack navigation params
 * Used for navigating to detail screens from tabs
 */
export type AppStackParamList = {
  // Tabs (no params)
  '(app)': undefined;
  '(app)/index': undefined;
  '(app)/clientes': undefined;
  '(app)/chamados': undefined;
  '(app)/agenda': undefined;
  '(app)/historico': undefined;

  // Detail screens (with id param)
  '(app)/detalhes/cliente/[id]': { id: string };
  '(app)/detalhes/chamado/[id]': { id: string };
  '(app)/detalhes/instalacao/[id]': { id: string };
};

/**
 * Helper types for useLocalSearchParams in detail screens
 * Note: 'id' param represents the actual identifier used by the API:
 * - Cliente: uuid_cliente
 * - Chamado: uuid_suporte
 * - Instalacao: id (numeric string)
 */
export type ClienteDetalhesParams = { id: string }; // id = uuid_cliente
export type ChamadoDetalhesParams = { id: string }; // id = uuid_suporte
export type InstalacaoDetalhesParams = { id: string }; // id = instalacao.id

/**
 * Union type for all detail params
 */
export type DetalhesParams = 
  | ClienteDetalhesParams 
  | ChamadoDetalhesParams 
  | InstalacaoDetalhesParams;
