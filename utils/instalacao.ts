/**
 * Utilitários para manipulação de dados de instalação
 */

/**
 * Formata um valor numérico como moeda brasileira
 * @param valor Valor em reais
 * @returns String formatada (ex: "50,00")
 */
export const formatarMoeda = (valor: number): string => {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Converte uma string de valor para número
 * @param valor String com valor monetário
 * @returns Valor numérico em reais
 */
export const parseValor = (valor: string): number => {
  if (!valor) return 0;
  // Remove tudo exceto números
  const apenasNumeros = valor.replace(/\D/g, '');
  if (!apenasNumeros) return 0;
  // Se o valor original tinha vírgula ou ponto, trata como centavos
  // Senão, trata como reais inteiros
  if (valor.includes(',') || valor.includes('.')) {
    // Converte centavos para reais (ex: "5000" centavos = 50.00 reais)
    return parseInt(apenasNumeros) / 100;
  }
  // Valor digitado sem vírgula/ponto = reais inteiros
  return parseInt(apenasNumeros);
};

/**
 * Formata uma data completa com hora
 * @param dataStr String de data no formato ISO ou SQL
 * @returns String formatada (ex: "31/12/2025 14:30")
 */
export const formatarDataCompleta = (dataStr: string | null) => {
  if (!dataStr) return 'Não informado';
  try {
    const data = new Date(dataStr.replace(' ', 'T'));
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dataStr;
  }
};

/**
 * Formata apenas a data sem hora
 * @param dataStr String de data no formato ISO ou SQL
 * @returns String formatada (ex: "31/12/2025")
 */
export const formatarData = (dataStr: string | null) => {
  if (!dataStr) return 'Não informado';
  try {
    const data = new Date(dataStr.replace(' ', 'T'));
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dataStr;
  }
};

/**
 * Formata um nome em Title Case
 * @param nome Nome a ser formatado
 * @returns Nome formatado
 */
export const formatarNome = (nome: string) => {
  if (!nome) return '';

  // Remove espaços extras e coloca em Title Case
  return nome
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
};
