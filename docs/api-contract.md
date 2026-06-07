# API Contract — License Service

> Gerado automaticamente a partir da implementação frontend (mock-first).
> Este documento é a especificação para o backend de licenciamento.

---

## Base URL

```
https://license.mkops.com/api/v1
```

---

## Endpoints

### `POST /license/validate`

Valida se um servidor mk-auth possui licença ativa para uso do MK-Ops Mobile.

#### Request

```http
POST /api/v1/license/validate
Content-Type: application/json
```

```json
{
  "mkAuthAddress": "string"
}
```

| Campo          | Tipo     | Obrigatório | Descrição                                                  |
|----------------|----------|-------------|-------------------------------------------------------------|
| `mkAuthAddress`| `string` | ✅ Sim      | Endereço do servidor mk-auth (IP ou domínio). Chave única por empresa. **Enviado normalizado** (lowercase, sem protocolo, sem trailing slash). |

#### Response — Licença Ativa

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "valid": true,
  "status": "active",
  "clientName": "Empresa Demo Ltda",
  "expiresAt": "2026-12-31T23:59:59Z",
  "gracePeriodEndsAt": "2027-01-07T23:59:59Z"
}
```

#### Response — Expirada (dentro do período de graça)

```json
{
  "valid": true,
  "status": "expired",
  "reason": "expired",
  "clientName": "Empresa Demo Ltda",
  "expiresAt": "2026-06-03T23:59:59Z",
  "gracePeriodEndsAt": "2026-06-10T23:59:59Z"
}
```

> `valid: true` durante o período de graça (7 dias após expiração).
> O app exibe um banner de aviso mas permite o acesso.

#### Response — Expirada (período de graça esgotado)

```json
{
  "valid": false,
  "status": "expired",
  "reason": "expired",
  "clientName": "Empresa Demo Ltda",
  "expiresAt": "2026-05-27T23:59:59Z",
  "gracePeriodEndsAt": "2026-06-03T23:59:59Z"
}
```

#### Response — Suspensa

```json
{
  "valid": false,
  "status": "suspended",
  "reason": "suspended",
  "clientName": "Empresa Demo Ltda",
  "expiresAt": "2026-12-31T23:59:59Z",
  "gracePeriodEndsAt": "2027-01-07T23:59:59Z"
}
```

#### Response — Não encontrada

```json
{
  "valid": false,
  "status": "not_found",
  "reason": "not_found"
}
```

---

## Schema Completo

### Request Body

```typescript
interface LicenseValidationRequest {
  mkAuthAddress: string;
}
```

### Response Body

```typescript
interface LicenseValidationResponse {
  /** Acesso permitido? true = active || (expired && dentro da graça) */
  valid: boolean;

  /** Status real da licença */
  status: 'active' | 'expired' | 'suspended' | 'not_found';

  /** Presente quando valid=false. Razão do bloqueio. */
  reason?: 'expired' | 'suspended' | 'not_found';

  /** Nome da empresa (para exibição no app) */
  clientName?: string;

  /** Data de expiração da licença (ISO 8601 UTC) */
  expiresAt?: string;

  /** Data de fim do período de graça = expiresAt + 7 dias (ISO 8601 UTC) */
  gracePeriodEndsAt?: string;
}
```

---

## Regras de Negócio

| Regra | Detalhe |
|-------|---------|
| **Identificador único** | `mkAuthAddress` identifica a empresa. Não muda sem comunicação ao suporte. |
| **Normalização automática** | O app normaliza automaticamente: `HTTP://192.168.1.10/` → `192.168.1.10`. Backend deve fazer o mesmo. |
| **Período de graça** | 7 dias após `expiresAt`. Durante esse período, `valid=true` e `status=expired`. |
| **Acesso bloqueado** | Quando `valid=false` (expirado sem graça, suspenso ou não encontrado). |
| **Cache no app** | O app armazena a última resposta por até 7 dias (uso offline). |
| **Frequência** | O app valida apenas 1x por dia. |

---

## Requisitos de Infraestrutura

### Banco de dados (sugestão mínima)

```sql
CREATE TABLE licenses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mk_auth_address VARCHAR(255) UNIQUE NOT NULL,
  client_name   VARCHAR(255) NOT NULL,
  status        VARCHAR(20)  NOT NULL DEFAULT 'active',
  activated_at  TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mk_auth_address ON licenses(mk_auth_address);
```

> `gracePeriodEndsAt` é calculado em runtime: `expires_at + INTERVAL '7 days'`. Não precisa de coluna.

### Tabela de auditoria (opcional mas recomendado)

```sql
CREATE TABLE license_validations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mk_auth_address VARCHAR(255) NOT NULL,
  result          BOOLEAN NOT NULL,
  status          VARCHAR(20),
  validated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Notas para Implementação do Backend

1. **Normalização**: O app frontend **já envia o endereço normalizado** (lowercase, sem http://, sem trailing slash).
   - Mesmo assim, o backend deve aplicar a mesma normalização ao armazenar/consultar (defesa em profundidade).
   - Implementação sugerida (pseudo-código):
     ```javascript
     function normalize(address) {
       return address.toLowerCase().trim()
         .replace(/^https?:\/\//, '')
         .replace(/\/$/, '');
     }
     ```
2. **Autenticação**: O endpoint `/license/validate` é público (sem autenticação).
   - Mitigar abuso com rate limiting (ex: 100 req/IP/hora).
2. **Normalização**: Normalizar `mkAuthAddress` antes de consultar o banco (lowercase, trim, remover trailing slash).
3. **Cálculo da graça**: `valid = status === 'active' || (status === 'expired' && NOW() < expires_at + 7 days)`.
4. **Admin**: Criar endpoints protegidos para gerenciar licenças (fora do escopo deste contrato).
