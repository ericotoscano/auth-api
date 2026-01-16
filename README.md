# 🔐 Auth API

Projeto de portfólio que implementa um sistema de autenticação completo, com foco em segurança, boas práticas e fluxos reais de aplicação.

Demonstra o uso correto de controle de sessão no backend, rotação de refresh tokens, verificação por email, reset de senha seguro e logout com revogação efetiva.

---

## ✨ Funcionalidades

- ✅ Cadastro de usuário (Sign Up)
- 📧 Verificação de conta por email (token de uso único)
- 🔑 Login com JWT
- 🔄 Refresh token com **rotação**
- 🚪 Logout com revogação real de sessão
- 🔐 Reset de senha seguro via email
- 🧱 Hash de tokens sensíveis no banco
- 🛡️ Proteção contra replay attack
- 🚫 Sem vazamento de existência de usuário
- 🧪 Arquitetura pronta para testes e expansão

---

## 🧠 Arquitetura de Tokens

A API trabalha com **quatro tipos de token**, cada um com função e nível de proteção específicos.

| Token | Função | Onde fica | Duração |
|------|------|----------|--------|
| Verification | Confirmar conta | Email → body | Curta |
| Reset Password | Autorizar troca de senha | Email → Authorization | Curta |
| Access | Autorizar chamadas à API | Authorization header | Curta |
| Refresh | Manter sessão ativa | Cookie httpOnly | Longa |

---

## 🔐 Segurança

- 🔒 Refresh tokens **hashados no banco**
- 🔄 **Refresh token rotation** (token antigo morre imediatamente)
- 🚫 Tokens de email são **single-use**
- 🔐 Tokens sensíveis **nunca são armazenados em texto puro**
- 🍪 Refresh token em **cookie httpOnly**
- 🧼 Logout remove token do banco + limpa cookie
- ❌ Nenhuma rota vaza se usuário existe ou não
- ⏱️ Tokens sempre expiram

---

## 🔁 Fluxos Principais

### 📌 Sign Up + Verification

1. Usuário se cadastra
2. API cria usuário **sem token**
3. Gera verification token em memória
4. Envia email com link de verificação
5. Salva **hash do token** no banco
6. Usuário clica no link
7. Token é validado (JWT + banco)
8. Conta é verificada
9. Token é removido

---

### 🔑 Login

1. Usuário envia credenciais
2. API valida senha
3. Gera:
   - access token
   - refresh token
4. Refresh token:
   - é hashado no banco
   - enviado via cookie httpOnly
5. Access token é retornado no body

---

### 🔄 Refresh Token

1. Access token expira
2. Frontend chama `/token/refresh`
3. API valida:
   - JWT do refresh
   - hash no banco (`bcrypt.compare`)
4. Gera:
   - novo access token
   - novo refresh token
5. Atualiza hash no banco
6. Envia novo cookie
7. Token antigo é invalidado

---

### 🚪 Logout

1. Frontend chama `/logout`
2. API valida refresh token
3. Remove refresh token do banco
4. Limpa cookie
5. Sessão encerrada definitivamente

---

### 🔐 Reset Password

1. Usuário solicita reset
2. API gera token em memória
3. Envia email com link
4. Salva **hash do token**
5. Usuário define nova senha
6. Token é validado (JWT + banco)
7. Senha é atualizada
8. Token é removido

---

## 📍 Endpoints Principais

### Auth

POST /auth/signup
POST /auth/login
POST /auth/verify
POST /auth/password/forgot
POST /auth/password/reset
POST /token/refresh
POST /logout

---

## 🧩 Middlewares Importantes

- `validateSchema` – valida e normaliza dados de entrada
- `validateToken(type)` – valida tokens por tipo
- `getTokenFromRequest` – define a origem correta de cada token

---

## 🗂️ Estrutura do Projeto

src/
├── auth/
│ ├── auth.controller.ts
│ ├── auth.service.ts
│ ├── auth.routes.ts
│
├── user/
│ ├── user.model.ts
│ ├── user.service.ts
│
├── token/
│ ├── token.types.ts
│ ├── token.service.ts
│
├── middlewares/
│ ├── validateToken.ts
│ ├── validateSchema.ts
│
├── config/
│ ├── env.ts
│ ├── CustomError.ts
│
└── app.ts

---

---

## ⚙️ Variáveis de Ambiente

```env
APP_ORIGIN=http://localhost
API_PORT=3000

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EMAIL_SECRET=...

ACCESS_TOKEN_DURATION_MINUTES=15
REFRESH_TOKEN_DURATION_MINUTES=43200
VERIFICATION_TOKEN_DURATION_MINUTES=30
RESET_PASSWORD_TOKEN_DURATION_MINUTES=15

REFRESH_TOKEN_COOKIE_NAME=refreshToken

NODE_ENV=development

---

## ▶️ Rodando o Projeto

# instalar dependências
npm install

# rodar em desenvolvimento
npm run dev

# build
npm run build

# produção
npm start

---

## 📄 Documentação da API

A API é documentada com Swagger / OpenAPI.

GET /api-docs

Inclui:

Schemas
Exemplos de request/response
Autenticação por rota
Códigos de erro padronizados

---

## 🧪 Testes (planejado)

Testes unitários de services
Testes de fluxo de autenticação
Testes de segurança (token inválido, replay, expiração)

---

## 🏁 Conclusão

Esta API foi projetada para ser:

🔐 Segura por padrão
🧠 Fácil de entender
🧱 Fácil de evoluir
🚀 Pronta para produção




