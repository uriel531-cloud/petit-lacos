# Petit Laços — loja virtual

Loja de laços e acessórios infantis. O plano completo está em `../PROMPT-SITE-PETIT-LACOS.md` e a identidade visual em `../identidade-visual.html`.

## Rodar no computador

```bash
npm install              # instala dependências (gera o Prisma Client)
npm run db:dev           # liga o banco PostgreSQL local (deixe este terminal aberto)
npm run db:migrate       # cria/atualiza as tabelas
npm run db:seed          # dados iniciais (dono, categorias, produtos de exemplo)
npm run dev              # abre em http://localhost:3000
```

Na primeira vez, copie `.env.example` para `.env` e preencha `DATABASE_URL` com a URL que o `npm run db:dev` mostrar.

## Onde fica cada coisa no site

- **Loja:** http://localhost:3000
- **Painel:** http://localhost:3000/admin. O login do dono está no `.env` (`SEED_OWNER_EMAIL` / `SEED_OWNER_PASSWORD`).
- **Editor de Aparência:** http://localhost:3000/admin/aparencia
  - Temas prontos (Petit Clássico, Minimal Premium estilo Apple, Candy Pastel, Natal sazonal com agendamento).
  - Cores, fontes, botões, cabeçalho, rodapé e barra de avisos.
  - Layout dos cards de produto e da página do produto.
  - Hero (textos, efeitos e fundo) e carrosséis.
  - Animações.
  - Seções da Home (arrastar e soltar).
  - Versões, importar/exportar e voltar ao padrão.
  - Tudo vai para um **rascunho** salvo sozinho; a loja só muda ao clicar em **Publicar**.

> Imagens enviadas pelo editor ficam em `public/uploads/` e funcionam só rodando no computador. Na hospedagem, elas passam a ir para o Cloudinary (Fase 2).

## Comandos úteis

| Comando | O que faz |
|---|---|
| `npm run dev` | Site em modo desenvolvimento |
| `npm run build` | Gera a versão de produção |
| `npm run typecheck` | Confere os tipos TypeScript |
| `npm run lint` | Confere o padrão do código |
| `npm run db:studio` | Abre uma tela para ver/editar o banco |
| `npm run db:migrate` | Aplica mudanças do `prisma/schema.prisma` |

## Tecnologias

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · shadcn/ui · Prisma 7 + PostgreSQL · Zod.

## Estrutura

```
prisma/
  schema.prisma        # modelo de dados (dinheiro sempre em centavos)
  seed.ts              # dados iniciais
src/
  app/                 # páginas (loja e, a partir da Fase 2, /admin)
  components/ui/       # componentes base (shadcn/ui)
  config/site.ts       # nome, slogan e logos da marca
  generated/prisma/    # Prisma Client (gerado, fora do git)
  lib/
    db.ts              # conexão com o banco
    env.ts             # variáveis de ambiente validadas
    money.ts           # formatação de R$ e descontos
    password.ts        # hash de senhas (scrypt)
    permissions.ts     # permissões padrão por perfil
public/brand/          # logos otimizadas
```

## Regras do projeto

- **Venda Local é o modo padrão.** "Vender para todo o Brasil" fica desligado em `StoreSettings.nationwideShippingEnabled`.
- Cores, fontes e raios vêm das variáveis em `src/app/globals.css`. Não use cores fixas nos componentes, porque o Editor de Aparência (Fase 3) vai sobrescrever essas variáveis.
- Valores em dinheiro são inteiros em centavos (`1490` = R$ 14,90).
