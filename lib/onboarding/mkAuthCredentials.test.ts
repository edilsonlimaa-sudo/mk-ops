import {
  areMkAuthCredentialsFormatValid,
  isMkAuthClientIdFormat,
  isMkAuthClientSecretFormat,
  validateMkAuthClientId,
  validateMkAuthClientSecret,
} from './mkAuthCredentials';

describe('mkAuthCredentials', () => {
  const validId = 'Client_Id_abcdefghijklmnop';
  const validSecret = 'Client_Secret_abcdefghijklmnop';

  it('rejeita nome humano como Client ID', () => {
    expect(isMkAuthClientIdFormat('Edilson Rocha Lima')).toBe(false);
    expect(validateMkAuthClientId('Edilson Rocha Lima')).not.toBe(true);
  });

  it('rejeita Client Secret curto ou sem prefixo', () => {
    expect(isMkAuthClientSecretFormat('teste')).toBe(false);
    expect(validateMkAuthClientSecret('teste')).not.toBe(true);
  });

  it('aceita pares no formato do painel', () => {
    expect(isMkAuthClientIdFormat(validId)).toBe(true);
    expect(isMkAuthClientSecretFormat(validSecret)).toBe(true);
    expect(areMkAuthCredentialsFormatValid(validId, validSecret)).toBe(true);
  });

  it('rejeita sufixo curto (menos de 8 caracteres após o prefixo)', () => {
    expect(isMkAuthClientIdFormat('Client_Id_abcdefg')).toBe(false);
    expect(isMkAuthClientSecretFormat('Client_Secret_abcdefg')).toBe(false);
  });
});
