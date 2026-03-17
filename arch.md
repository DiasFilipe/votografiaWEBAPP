# Arquitetura · Votografia

Documentação técnica da plataforma multi-tenant de inteligência eleitoral.

---

## Visão geral

```
Browser
  │
  ▼
Server Components (App Router)
  │  requireAuth()/getClienteId() em lib/auth.ts
  │  resolve cliente por cookie/host (produção) ou cookie dev (dev)
  │  buscam dados (JSON local e/ou Postgres, dependendo do módulo)
  ▼
Client Components
  │  recebem dados via props
  │  fazem polling para dados ao vivo
  ▼
PostgreSQL (Railway)
```

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Runtime | React 19 + TypeScript 5 |
| Estilo | Tailwind CSS 4 |
| Mapas | Leaflet + react-leaflet |
| Gráficos | Recharts |
| Banco | PostgreSQL via `pg` |
| Deploy | Railway (standalone build) |

---

## Estrutura de arquivos

```
webapp/
├── app/                          # Rotas e páginas (App Router)
│   ├── layout.tsx                # Layout raiz — ClienteProvider + Sidebar
│   ├── page.tsx                  # Redireciona para /painel ou /admin
│   ├── login/                    # Página de login
│   ├── painel/                   # Módulo Painel Eleitoral
│   │   ├── layout.tsx            # Sub-navegação (Mapa / Ranking / Regiões)
│   │   ├── page.tsx              # Mapa coroplético
│   │   ├── ranking/page.tsx      # Ranking de municípios
│   │   ├── regioes/page.tsx      # Análise por macrorregião
│   │   └── municipio/[slug]/     # Detalhe de município
│   ├── sentimento/page.tsx       # Monitor de redes sociais
│   ├── mobilizacao/page.tsx      # Campanha de mobilização
│   ├── admin/page.tsx            # Painel admin (todos os clientes)
│   └── api/
│       ├── auth/login/           # POST — cria sessão
│       ├── auth/logout/          # POST — destrói sessão
│       ├── mentions/             # GET  — dados de sentimento (X API)
│       ├── contador/             # GET  — contagem de assinaturas
│       ├── assinar/              # POST — nova assinatura
│       ├── dev/clientes/         # GET  — lista clientes (dev only)
│       └── dev/switch/           # POST — troca cliente (dev only)
│
├── components/
│   ├── ClienteProvider.tsx       # Context com config do cliente ativo
│   ├── Sidebar.tsx               # Navegação lateral + dev switcher
│   ├── painel/                   # MapHomeClient, MapRS, RankingClient, StatsBar
│   ├── sentimento/               # Dashboard, MentionFeed, SentimentDonut, etc.
│   └── mobilizacao/              # ContadorLive, FormAssinatura, DeputadosList
│
├── lib/
│   ├── clientes/
│   │   ├── registry.ts           # getCliente() / getAllClientes() — async, lê do DB
│   │   ├── subdomains.ts         # Mapeamento subdomain → clienteId (estático)
│   │   └── session.ts            # createToken() — HMAC-SHA256
│   ├── painel/
│   │   ├── data.ts               # getMunicipios() — async, lê do DB, cache em memória
│   │   └── utils.ts              # getZona, getPotencial, getColor, formatVotos
│   ├── sentimento/
│   │   ├── sentiment.ts          # analyzeSentiment() — rule-based PT-BR
│   │   ├── mockData.ts           # Dados simulados para modo demo
│   │   └── types.ts              # Mention, SentimentStats, MentionData
│   └── mobilizacao/
│       └── db.ts                 # getCount() / incrementCount() — Postgres
│
├── db/
│   ├── client.ts                 # Singleton pg.Pool
│   ├── migrate.ts                # Script: npm run db:migrate
│   ├── seed.ts                   # Script: npm run db:seed
│   └── migrations/
│       └── 001_initial.sql       # Schema: clientes, municipios, assinaturas
│
├── data/                         # Arquivos JSON de referência local
│   ├── clientes.json             # Config de todos os clientes
│   ├── deputados.json            # Lista de deputados federais
│   └── {clienteId}/painel.json  # Votos por município (fonte para seed)
│
├── public/data/                  # GeoJSON por cliente
│   └── {clienteId}-municipios.geojson
│
├── lib/auth.ts                   # Auth + resolução de cliente (server-only)
└── next.config.ts                # output: standalone, turbopack.root
```

---

## Multi-tenancy

Cada candidato tem um subdomínio próprio. O mapeamento é estático em `lib/clientes/subdomains.ts`:

```
vanhattem.votografia.com.br   →  "van-hattem"
carolsponza.votografia.com.br →  "carol-sponza"
sostenes.votografia.com.br    →  "sostenes"
lindbergh.votografia.com.br   →  "lindbergh"
admin.votografia.com.br       →  "admin"
localhost:3010                →  DEV_CLIENTE_ID ou "van-hattem"
```

Não existe header `x-cliente-id`: o servidor resolve o cliente via `lib/auth.ts`, usando o host/subdomínio e (em produção) o cookie de sessão `vtg_sess`.

---

## Autenticação

### Fluxo de login

```
1. POST /api/auth/login  {clienteId, senha}
       │
       ├─ clienteId === "admin" → compara ADMIN_PASSWORD (env)
       └─ else → getCliente(id), compara senha no banco
       │
       ▼
   createToken(clienteId)
   → payload: encodeURIComponent(id).timestamp
   → assina com HMAC-SHA256 (SESSION_SECRET)
   → formato: {encId}.{ts}.{sig}
       │
       ▼
   Cookie vtg_sess (httpOnly, secure em prod, 7 dias)
```

### Verificação por requisição (server-only)

```
verifyToken(token)
  1. Split em 3 partes: encId, ts, sig
  2. Reconstrói payload: encId.ts
  3. Web Crypto API (Edge runtime): verifica HMAC-SHA256
  4. Checa expiração: Date.now() - ts ≤ 7 dias
  5. Retorna decodeURIComponent(encId) ou null
```

O token é assinado/verificado com HMAC-SHA256 via **Node.js `crypto`** (server components e route handlers em runtime Node).

### Autorização

| Sessão | Subdomínio | Resultado |
|--------|-----------|-----------|
| `van-hattem` | `vanhattem.*` | ✓ Acesso |
| `van-hattem` | `carolsponza.*` | ✗ Redirect /login |
| `admin` | qualquer | ✓ Acesso (recebe clienteId do subdomínio) |
| ausente/inválida | qualquer | ✗ Redirect /login |

### Dev mode

Em `NODE_ENV=development`:
- Verificação de sessão completamente ignorada
- Cookie `dev_cliente_id` permite trocar de cliente via UI
- Página de login redireciona direto para `/`

---

## Banco de dados

### Schema

```sql
-- Configuração de cada candidato
CREATE TABLE clientes (
  id              TEXT PRIMARY KEY,          -- "van-hattem"
  subdominio      TEXT UNIQUE NOT NULL,      -- "vanhattem"
  nome            TEXT NOT NULL,             -- "Van Hattem"
  nome_completo   TEXT NOT NULL,             -- "Marcel van Hattem"
  partido         TEXT NOT NULL,
  estado          TEXT NOT NULL,             -- "RS"
  cargo           TEXT NOT NULL,
  cor             TEXT NOT NULL,             -- "#f59e0b"
  cor_texto       TEXT NOT NULL,             -- "#000000"
  foto            TEXT DEFAULT '/foto.jpg',
  senha           TEXT NOT NULL,
  modulo_painel       BOOLEAN DEFAULT true,
  modulo_sentimento   BOOLEAN DEFAULT false,
  modulo_mobilizacao  BOOLEAN DEFAULT false
);

-- Resultados eleitorais 2022 por município
CREATE TABLE municipios (
  id            SERIAL PRIMARY KEY,
  cliente_id    TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  municipio     TEXT NOT NULL,               -- "PORTO ALEGRE"
  cod_tse       TEXT NOT NULL,               -- código TSE
  votos         INTEGER NOT NULL,
  total_dep_fed INTEGER NOT NULL,            -- total de votos dep. federal no município
  pct           NUMERIC(6,2) NOT NULL,       -- votos / total_dep_fed * 100
  UNIQUE(cliente_id, cod_tse)
);

-- Assinaturas da petição (módulo mobilização)
CREATE TABLE assinaturas (
  id         SERIAL PRIMARY KEY,
  nome       TEXT,
  uf         CHAR(2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Conexão

`db/client.ts` expõe um singleton `pg.Pool` via `getPool()`. Todas as queries passam por este pool. A URL de conexão vem de `DATABASE_URL` (Railway injeta em produção; usar `DATABASE_PUBLIC_URL` localmente).

### Scripts

```bash
npm run db:migrate   # cria as tabelas (idempotente)
npm run db:seed      # popula clientes e municípios a partir dos JSON locais
```

---

## Fluxo de dados: requisição → página

### Painel Eleitoral

```
GET vanhattem.votografia.com.br/painel
  │
  ├─ app/painel/page.tsx (Server Component)
  │    requireAuth() → "van-hattem"
  │    getMunicipios("van-hattem")
  │      └─ SELECT * FROM municipios WHERE cliente_id = 'van-hattem'
  │      └─ cache em memória (Map por clienteId)
  │      └─ adiciona slug e regiao (MESOREGIAO lookup)
  │
  ├─ passa municipios[] como prop para MapHomeClient
  │
  └─ MapHomeClient (Client Component)
       └─ MapRSDynamic: fetch /data/van-hattem-municipios.geojson
          └─ Leaflet renderiza choropleth usando getColor(pct)
```

### Contador de assinaturas

```
GET /api/contador
  └─ SELECT COUNT(*)::int FROM assinaturas  →  n
  └─ retorna n + 52.847 (base histórica)

POST /api/assinar  {nome, uf}
  └─ INSERT INTO assinaturas (nome, uf)
  └─ retorna novo getCount()
```

### Sentimento

```
GET /api/mentions
  ├─ X_API_BEARER_TOKEN presente →
  │    fetch X API v2 (tweets/search/recent)
  │    analyzeSentiment(text) por tweet  →  positivo/negativo/neutro
  │    retorna MentionData
  │
  └─ sem token →
       generateMockMentions()  →  dados simulados com isDemo: true
```

---

## Módulos por cliente

Cada cliente em `clientes` tem flags `modulo_painel`, `modulo_sentimento`, `modulo_mobilizacao`. A Sidebar lê `useCliente().modulos` e oculta os itens desativados. As páginas não validam — confiam na config.

| Cliente | Painel | Sentimento | Mobilização |
|---------|--------|-----------|-------------|
| Van Hattem | ✓ | ✓ | ✓ |
| Carol Sponza | ✓ | ✓ | — |
| Sóstenes | ✓ | ✓ | — |
| Lindbergh | ✓ | ✓ | — |

---

## Dev client switcher

Exclusivo para `NODE_ENV=development`. Clique no avatar na Sidebar abre dropdown com todos os clientes. Ao selecionar:

1. `POST /api/dev/switch` → grava cookie `dev_cliente_id` (não-httpOnly)
2. `window.location.reload()` — recarrega a página
3. `lib/auth.ts` lê o cookie e passa a resolver o novo clienteId no servidor
4. Todos os server components usam o novo cliente

---

## Variáveis de ambiente

| Variável | Onde usada | Obrigatória |
|----------|-----------|-------------|
| `DATABASE_URL` | `db/client.ts` | Sim |
| `SESSION_SECRET` | `lib/auth.ts` | Sim (prod) |
| `ADMIN_PASSWORD` | `/api/auth/login` | Sim (prod) |
| `X_API_BEARER_TOKEN` | `/api/mentions` | Não (cai em mock) |
| `NODE_ENV` | `lib/auth.ts`, sidebar, login | Auto |
| `DEV_CLIENTE_ID` | `lib/auth.ts` (dev only) | Não |
| `DEFAULT_CLIENTE_ID` | `lib/auth.ts` (railway host fallback) | Não |
| `PORT` | `npm start` | Não (padrão 3010) |

Ver `webapp/.env.example` para a lista completa incluindo variáveis legadas single-tenant.
