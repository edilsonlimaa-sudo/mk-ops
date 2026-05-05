/**
 * Formato das credenciais de API MK-Auth (alinhado aos placeholders do onboarding).
 * Prefixos literais como no painel + sufixo sem espaços.
 */
const CLIENT_ID_RE = /^Client_Id_[A-Za-z0-9_-]{8,}$/;
const CLIENT_SECRET_RE = /^Client_Secret_[A-Za-z0-9_-]{8,}$/;

export function isMkAuthClientIdFormat(value: string): boolean {
  return CLIENT_ID_RE.test(value.trim());
}

export function isMkAuthClientSecretFormat(value: string): boolean {
  return CLIENT_SECRET_RE.test(value.trim());
}

export function areMkAuthCredentialsFormatValid(clientId: string, clientSecret: string): boolean {
  return isMkAuthClientIdFormat(clientId) && isMkAuthClientSecretFormat(clientSecret);
}

export function validateMkAuthClientId(value: string): true | string {
  const t = value.trim();
  if (!t) return 'Por favor, informe o Client ID';
  if (/\s/.test(t)) return 'Não use espaços; copie a chave inteira em uma linha.';
  if (!CLIENT_ID_RE.test(t)) {
    return 'O Client ID deve estar no formato Client_Id_… (como no painel MK-Auth).';
  }
  return true;
}

export function validateMkAuthClientSecret(value: string): true | string {
  const t = value.trim();
  if (!t) return 'Por favor, informe o Client Secret';
  if (/\s/.test(t)) return 'Não use espaços; copie a chave inteira em uma linha.';
  if (!CLIENT_SECRET_RE.test(t)) {
    return 'O Client Secret deve estar no formato Client_Secret_… (como no painel MK-Auth).';
  }
  return true;
}

/** Erro de formato só quando já há conteúdo (feedback sem assustar com campo vazio). */
export function getMkAuthClientIdFormatHint(value: string): string | null {
  if (!value.trim()) return null;
  const r = validateMkAuthClientId(value);
  return r === true ? null : r;
}

export function getMkAuthClientSecretFormatHint(value: string): string | null {
  if (!value.trim()) return null;
  const r = validateMkAuthClientSecret(value);
  return r === true ? null : r;
}
