# 🚀 Guia de Hospedagem: B10 SaaS (Supabase + Netlify)

Siga este passo a passo para colocar seu sistema no ar de forma profissional e escalável.

---

## 🏗️ Passo 1: Configuração do Supabase (Banco de Dados e Auth)

1. **Criar Projeto**: Acesse [supabase.com](https://supabase.com), crie um novo projeto e escolha a região (ex: São Paulo).
2. **Rodar o SQL de SaaS**:
   - No menu lateral, clique em **SQL Editor**.
   - Clique em **New Query**.
   - Copie todo o conteúdo do arquivo `setup_saas.sql` do seu projeto e cole aqui.
   - Clique em **Run**. Isso criará as tabelas `restaurantes` e `usuarios_restaurante` e preparará as tabelas antigas.
3. **Configurar Autenticação**:
   - Vá em **Authentication** -> **Providers**.
   - Verifique se o login por E-mail está ativo (o padrão é sim).
   - *Dica*: Desative a confirmação de e-mail se quiser testar rápido, mas em produção é recomendado manter.
4. **Pegar as Chaves**:
   - Vá em **Project Settings** -> **API**.
   - Copie o **Project URL**.
   - Copie a **anon public key**.

---

## 📦 Passo 2: Preparação do Repositório (Git)

Para que a Netlify consiga ler seu código, ele deve estar no GitHub, GitLab ou Bitbucket.

1. **Inicializar Git**:
   ```bash
   git init
   git add .
   git commit -m "feat: migração para saas e variáveis de ambiente"
   ```
2. **Subir para o GitHub**:
   - Crie um repositório vazio no GitHub.
   - Siga as instruções para dar o `remote add` e `push`.

---

## 🌐 Passo 3: Deploy na Netlify

1. **Novo Site**: No painel da [Netlify](https://app.netlify.com), clique em **Add new site** -> **Import an existing project**.
2. **Conectar GitHub**: Escolha o repositório do seu projeto.
3. **Configurações de Build**:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. **Variáveis de Ambiente (CRÍTICO)**:
   - Clique em **Site configuration** -> **Environment variables**.
   - Adicione as seguintes chaves:
     - `VITE_SUPABASE_URL`: (Cole o URL que você copiou do Supabase)
     - `VITE_SUPABASE_ANON_KEY`: (Cole a chave anon que você copiou do Supabase)
5. **Deploy**: Clique em **Deploy site**.

---

## ✅ Passo 4: Primeiro Acesso

1. **Criar Usuário**: Use o painel do Supabase (Authentication -> Users -> Add User) para criar seu primeiro login manual ou use um formulário de cadastro se já tiver implementado.
2. **Vincular ao Restaurante**:
   - Após criar o usuário, pegue o `user_id` (UUID) dele.
   - No SQL Editor do Supabase, rode:
     ```sql
     INSERT INTO usuarios_restaurante (user_id, restaurante_id, cargo) 
     VALUES ('COLE_AQUI_O_UUID', 1, 'dono');
     ```
3. **Acessar**: Entre na URL fornecida pela Netlify e faça o login!

---

---

## 🛡️ Segurança: Row Level Security (RLS)

O B10 SaaS foi projetado com **Segurança Multilocatário** via Banco de Dados. Isso significa:
- **Isolamento Total**: Um restaurante "A" nunca verá os dados do restaurante "B".
- **Políticas Ativas**: O arquivo `setup_saas.sql` contém as regras que bloqueiam qualquer acesso não autorizado diretamente no motor do banco de dados.
- **Trigger Automático**: Ao inserir um novo produto ou comanda, o sistema identifica quem você é e vincula automaticamente ao seu restaurante, evitando erros humanos.

---

> [!TIP]
> **DRE e Dados**: Como usamos `DEFAULT 1` no script SQL, todos os seus dados antigos que já estavam no Supabase serão automaticamente vinculados ao "Restaurante 1 (Matriz)".

> [!WARNING]
> Nunca compartilhe seu arquivo `.env` publicamente. O arquivo `.env.example` serve apenas como referência de quais nomes usar na Netlify.

---
*B10 Gestão SaaS - Sistema de Alta Performance para Restaurantes*
