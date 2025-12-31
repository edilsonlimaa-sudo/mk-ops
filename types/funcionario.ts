export interface Funcionario {
  id: string; // ID do funcionário
  uuid_func: string;
  uuid: string; // alias para uuid_func
  nome: string;
  cpf: string | null;
  rg: string | null;
  nascimento: string | null;
  email: string | null;
  cargo: string | null;
  sexo: string | null;
  telefone: string | null;
  celular: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  complemento: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  cidade_ibge: string | null;
  salario: string | null;
  data_adm: string | null;
  comissao: string | null;
  tipo: string | null;
  crc: string | null;
}

export interface FuncionarioListResponse {
  funcionarios: Funcionario[];
}
