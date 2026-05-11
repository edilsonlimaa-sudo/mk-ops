/**
 * Corta casas decimais sem arredondar (evita 3,081099… virar 3,08110 por carry do toFixed).
 * Funciona no texto do token como veio na string (ex.: API), preservando os dígitos exibidos.
 */
function truncateNumericToken(token: string, maxDecimals: number): string {
  const t = token.trim();
  if (!t) return t;

  const neg = t.startsWith('-');
  const unsigned = neg ? t.slice(1) : t;

  const dot = unsigned.indexOf('.');
  if (dot === -1) {
    return (neg ? '-' : '') + unsigned;
  }

  const intPart = unsigned.slice(0, dot) || '0';
  const frac = unsigned.slice(dot + 1);
  const fracTrunc = frac.slice(0, maxDecimals);
  if (fracTrunc.length === 0) {
    return (neg ? '-' : '') + intPart;
  }
  return (neg ? '-' : '') + intPart + '.' + fracTrunc;
}

/**
 * Formata string de coordenadas (ex.: "lng,lat" ou "lng,lat,0") para exibição na UI,
 * evitando overflow com muitas casas decimais. Valores completos permanecem no dado bruto.
 * Usa truncagem na string (corta casas extras), não arredondamento — ex.: 3,08109962… vira 3,08109 com 5 casas, nunca 3,08110.
 */
export function formatCoordinatesForDisplay(
  raw: string | null | undefined,
  decimals = 5
): string {
  if (!raw?.trim()) return '';

  const trimmed = raw.trim();
  const parts = trimmed.split(',').map((p) => p.trim()).filter((p) => p.length > 0);
  if (parts.length < 2) {
    return trimmed.length > 40 ? `${trimmed.slice(0, 38)}…` : trimmed;
  }

  const a = parseFloat(parts[0]);
  const b = parseFloat(parts[1]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return trimmed.length > 40 ? `${trimmed.slice(0, 38)}…` : trimmed;
  }

  return `${truncateNumericToken(parts[0], decimals)}, ${truncateNumericToken(parts[1], decimals)}`;
}
