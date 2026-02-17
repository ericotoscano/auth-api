# 🔐 Auth API

Projeto que implementa um sistema de autenticação completo, com foco em segurança, boas práticas e fluxos reais de aplicação. O objetivo é demonstrar o uso correto de controle de sessão no backend, rotação de refresh tokens, verificação por email, reset de senha seguro e logout com revogação efetiva.

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

| Token          | Função                   | Onde fica             | Duração |
| -------------- | ------------------------ | --------------------- | ------- |
| Verification   | Confirmar conta          | Email → body          | Curta   |
| Reset Password | Autorizar troca de senha | Email → Authorization | Curta   |
| Access         | Autorizar chamadas à API | Authorization header  | Curta   |
| Refresh        | Manter sessão ativa      | Cookie httpOnly       | Longa   |

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
2. Frontend chama `/auth/token/refresh`
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

1. Frontend chama `/auth/logout`
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

```http
POST /api/v1/auth/signup
POST /api/v1/auth/login
POST /api/v1/auth/verify
POST /api/v1/auth/verification/resend
POST /api/v1/auth/password/forgot
POST /api/v1/auth/password/reset
POST /api/v1/auth/token/refresh
POST /api/v1/auth/logout
```

### Users

```http
GET    /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
```

---

## 🧩 Middlewares Importantes

- `validateSchema` – valida e normaliza dados de entrada
- `validateToken(type)` – valida tokens por tipo
- `validateUserSelfPermission` – garante que usuário só altere seus próprios dados

---

## 🗂️ Estrutura do Projeto

```
src/
├── app.ts
├── index.ts
├── auth/
│   ├── services/
│   ├── controller.ts
│   └── routes.ts
│
├── users/
│   ├── model/
│   ├── controller.ts
│   └── routes.ts
│
├── infra/
│   ├── db/
│   ├── env/
│   ├── http/
│   ├── logger/
│   └── mail/
│
├── shared/
├── tests/
├── types/
└── errors/
```

---

## ⚙️ Variáveis de Ambiente

```env
APP_NAME=AuthAPI
APP_ORIGIN=http://localhost:3000
APP_PORT=3000
FRONTEND_ORIGIN=http://localhost:5173

NODE_ENV=development
LOG_LEVEL=info

DEV_DB_URI=mongodb://...
TEST_DB_URI=mongodb://...
PROD_DB_URI=mongodb://...

MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=...
MAIL_PASSWORD=...

VERIFICATION_TOKEN_SECRET_KEY=...
VERIFICATION_TOKEN_DURATION_MINUTES=30

RESET_PASSWORD_TOKEN_SECRET_KEY=...
RESET_PASSWORD_TOKEN_DURATION_MINUTES=15

ACCESS_TOKEN_SECRET_KEY=...
ACCESS_TOKEN_DURATION_MINUTES=15

REFRESH_TOKEN_SECRET_KEY=...
REFRESH_TOKEN_DURATION_MINUTES=60
REFRESH_TOKEN_COOKIE_NAME=refreshToken
```

---

## ▶️ Rodando o Projeto

```bash
# instalar dependências
npm install

# rodar em desenvolvimento
npm run dev

# build
npm run build

# produção
npm start

# testes
npm test
```

---

## 🏁 Conclusão

Esta API foi projetada para ser:

🔐 Segura por padrão
🧠 Fácil de entender
🧱 Fácil de evoluir
🚀 Pronta para produção
