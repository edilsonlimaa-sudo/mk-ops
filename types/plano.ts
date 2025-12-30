/**
 * Plano entity from MK-Auth API
 */
export interface Plano {
  id: string;
  uuid_plano: string;
  uuid: string;
  nome: string;
  desc_titulo: string;
  descricao: string;
  tipo: string;
  valor: string;
  velup: string;
  veldown: string;
  prioridade: string;
  tecnologia: string;
  aliquota: string;
  faixa: string;
  burst?: string;
  garup?: string;
  gardown?: string;
  maxup?: string;
  maxdown?: string;
  desaup?: string;
  desadown?: string;
  tempoup?: string;
  tempodown?: string;
}

export interface PlanoListResponse {
  planos: Plano[];
  status?: string;
  mensagem?: string;
}
