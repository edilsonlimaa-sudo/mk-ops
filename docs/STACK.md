# Stack MK-Auth Mobile

## 📦 Bibliotecas e Quando Usar

### **NativeWind (Tailwind CSS)**
**Propósito:** Estilização com classes utilitárias  
**Quando usar:** Para qualquer estilização de componentes
```tsx
<View className="flex-1 bg-white p-4">
  <Text className="text-lg font-bold text-gray-900">Título</Text>
</View>
```

### **Zustand**
**Propósito:** Estado global leve e simples  
**Quando usar:** Para dados compartilhados entre telas (auth, user, configurações)
```tsx
const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user })
}))
```

### **TanStack Query (React Query)**
**Propósito:** Cache inteligente de requisições HTTP  
**Quando usar:** Para TODAS as chamadas de API (GET, POST, PUT, DELETE)
```tsx
const { data, isLoading } = useQuery({
  queryKey: ['clientes'],
  queryFn: fetchClientes
})
```

### **Axios**
**Propósito:** Cliente HTTP com interceptors  
**Quando usar:** Base para todas as requisições (configurado em `services/api`)
- Interceptors adicionam token JWT automaticamente
- Timeout configurado
- Tratamento de erros centralizado

### **Expo SecureStore**
**Propósito:** Armazenamento seguro e criptografado  
**Quando usar:** APENAS para dados sensíveis (token JWT, credentials)
```tsx
await SecureStore.setItemAsync('authToken', token)
```
**NÃO usar para:** cache de dados, preferências não sensíveis (use AsyncStorage)

### **React Hook Form + Zod**
**Propósito:** Formulários performáticos com validação  
**Quando usar:** Para TODOS os formulários (login, cadastros, edições)
```tsx
const schema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Mínimo 6 caracteres')
})

const { control, handleSubmit } = useForm({
  resolver: zodResolver(schema)
})
```

## 🏗️ Arquitetura de Pastas

```
/app              → Rotas (Expo Router file-based)
/components       → Componentes reutilizáveis
/services/api     → Axios + endpoints do MK-Auth
/stores           → Zustand stores
/hooks            → Custom hooks (useAuth, useClientes, etc)
/types            → TypeScript types/interfaces
/constants        → Constantes e configs
/utils            → Funções utilitárias
```

## 🔐 Fluxo de Autenticação

1. Login → `services/api/auth.ts` (Axios)
2. Recebe token JWT (válido por 60min)
3. Salva em `SecureStore`
4. Armazena user em `useAuthStore` (Zustand)
5. Interceptor do Axios adiciona token em todas as requisições
6. TanStack Query faz cache das requisições autenticadas

## 📋 Regras de Uso

- **Estilização:** Sempre NativeWind (evitar StyleSheet)
- **Estado Global:** Zustand (não usar Context API para estado)
- **Chamadas API:** TanStack Query (não usar useEffect + fetch)
- **Formulários:** React Hook Form + Zod (não useState manual)
- **Dados Sensíveis:** Expo SecureStore (nunca AsyncStorage)
- **HTTP Client:** Axios via `services/api` (não fetch direto)
