# Autenticação de Funcionários

## Fluxo de Autenticação

### Endpoint de Login
**Rota:** `POST /sessions`

**Payload:**
```json
{
  "login": "usuario",
  "password": "senha123"
}
```

### Processo de Validação

#### 1. Busca do Usuário
- Busca na tabela PostgreSQL `sis_acesso` pelo campo `login`
- Modelo: `User` em `src/app/models/User.js`

#### 2. Validação de Senha (SHA-256 + bcrypt)

**Algoritmo:**
```
Senha do usuário → SHA-256 → bcrypt.compareSync(hash_sha256, hash_armazenado)
```

**Implementação em `User.checkPassword()`:**
```javascript
checkPassword(password) {
  // 1. Aplica SHA-256 na senha fornecida
  const sha256Hash = sha256(password);
  
  // 2. Verifica backward compatibility (hash SHA-256 puro)
  if (sha256Hash === this.sha) {
    return true;
  }
  
  // 3. Verifica bcrypt (SHA-256 → bcrypt com 10 rounds)
  let hashToCompare = this.sha;
  
  // Converte $2y$ (PHP) para $2a$ (Node.js) se necessário
  if (hashToCompare && hashToCompare.startsWith('$2y$')) {
    hashToCompare = hashToCompare.replace(/^\$2y\$/, '$2a$');
  }
  
  // bcrypt.compareSync extrai o salt do hash e compara
  return bcrypt.compareSync(sha256Hash, hashToCompare);
}
```

**Configuração bcrypt:**
- **Rounds:** 10 (2^10 = 1024 iterações)
- **Formato do hash:** `$2a$10$[salt 22 chars][hash 31 chars]`
- O salt está embutido no próprio hash armazenado

#### 3. Verificação de Funcionário
- Após validar a senha, verifica se o email existe na tabela `Employee`
- Retorna erro se não for funcionário

#### 4. Geração do Token JWT

**Token contém:**
```javascript
jwt.sign(
  { idacesso },           // Payload: ID do usuário
  authConfig.secret,      // Secret: AUTH_SECRET ou 'updsuportesecretkey'
  { expiresIn: '7d' }     // Expiração: 7 dias
)
```

**Resposta de sucesso:**
```json
{
  "user": {
    "idacesso": "123",
    "nome": "Nome do Funcionário",
    "employee_id": 456,
    "isAdmin": false,
    "tenant_id": "789"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Middleware de Autenticação

**Arquivo:** `src/app/middlewares/auth.js`

**Uso:** Protege rotas que requerem autenticação

```javascript
// Header obrigatório
Authorization: Bearer <token>
```

**Validação:**
1. Verifica presença do header `Authorization`
2. Extrai o token após `Bearer `
3. Valida o token JWT usando o secret
4. Injeta `req.idacesso` com o ID do usuário
5. Retorna 401 se token inválido ou expirado

## Arquivos Relevantes

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/app/controllers/SessionController.js` | Endpoint de login (`store` método) |
| `src/app/models/User.js` | Validação de senha SHA-256 + bcrypt |
| `src/app/models/Employee.js` | Validação se é funcionário |
| `src/app/middlewares/auth.js` | Middleware de proteção de rotas |
| `src/config/auth.js` | Configurações JWT (secret, expiresIn) |
| `src/routes.js` | Rota `POST /sessions` |

## Variáveis de Ambiente

```env
AUTH_SECRET=seu_secret_jwt        # Secret para assinar tokens
AUTH_EXPIRESIN=7d                 # Tempo de expiração do token
```

## Importante: Como Funciona o bcrypt

O bcrypt **não gera valores diferentes** a cada verificação porque:

1. O **salt** está armazenado no próprio hash: `$2a$10$[SALT][HASH]`
2. O `bcrypt.compareSync()` extrai o salt do hash armazenado
3. Usa o mesmo salt para hashear a senha fornecida
4. Compara os dois hashes resultantes

**Exemplo:**
```javascript
// Hash armazenado no banco:
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
       └─────────────────┬──────────────────┘
                    Salt (sempre o mesmo)

// Na validação, bcrypt usa ESTE salt para hashear a senha fornecida
// Por isso sempre gera o mesmo resultado para a mesma senha
```

## Segurança

### Proteção Contra Ataques
- **Rainbow Tables:** Ineficazes devido ao salt único por hash
- **Brute Force:** Dificultado pelos 10 rounds do bcrypt (1024 iterações)
- **Timing Attacks:** `bcrypt.compareSync` tem tempo constante

### Dupla Hash (SHA-256 + bcrypt)
1. **SHA-256:** Normaliza entrada para 256 bits (evita problema de senhas longas no bcrypt)
2. **bcrypt:** Adiciona salt único e custo computacional (rounds)

### Backward Compatibility
O código suporta dois formatos:
- Hash SHA-256 puro (legado)
- Hash bcrypt de SHA-256 (atual)
