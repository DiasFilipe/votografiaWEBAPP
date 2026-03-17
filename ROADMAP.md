# Roadmap · Votografia

Estado atual e próximos passos da plataforma.
`[x]` implementado · `[ ]` pendente · `[~]` parcial

---

## Estado atual (março 2026)

### Infraestrutura
- [x] Next.js 16 + React 19 + TypeScript + Tailwind CSS 4
- [x] Multi-tenancy por subdomínio (`lib/clientes/subdomains.ts` + `lib/auth.ts`)
- [x] Autenticação HMAC-SHA256 com cookie `vtg_sess` (7 dias) via `lib/auth.ts`
- [x] `data/clientes.json` — configuração centralizada de todos os clientes
- [x] Módulos on/off por cliente (`modulos.painel`, `.sentimento`, `.mobilizacao`)
- [x] Sidebar responsiva com navegação dinâmica por módulos ativos
- [x] Deploy no Railway via `railway.json` na raiz
- [x] Admin dashboard em `admin.votografia.com.br`

### Painel Eleitoral
- [x] Mapa coroplético interativo (497 municípios RS / RJ)
- [x] Coloração por intensidade de votação (6 níveis)
- [x] Popup por município com votos, %, zona e potencial estimado
- [x] Classificação por zona: Fortaleza (>10%), Crescimento (3–10%), Baixo (<3%)
- [x] Score de potencial 2026 calculado automaticamente
- [x] StatsBar com totais por estado
- [x] Página de detalhe por município com contexto estratégico e municípios similares
- [x] Ranking com busca, filtros (zona/potencial), ordenação e paginação
- [x] Análise por macrorregião com top municípios

### Monitor de Sentimento
- [x] Dashboard com polling automático
- [x] Análise de sentimento rule-based em PT-BR
- [x] Feed de menções com score individual
- [x] Gráfico donut de distribuição de sentimento
- [x] Timeline de menções por hora
- [x] StatsCards e ranking de hashtags
- [~] Integração X/Twitter API v2 (implementada, depende de token por cliente)

### Mobilização
- [x] Contador de assinaturas ao vivo
- [x] Formulário de adesão (`/api/assinar`)
- [x] Barra de progresso com meta (100.000)
- [x] Lista de deputados por UF com WhatsApp e e-mail pré-preenchidos
- [x] Botões de compartilhamento social
- [~] Persistência do contador — atualmente in-memory (perde no restart/deploy)

### Clientes ativos
- [x] Van Hattem (RS) — todos os módulos
- [x] Carol Sponza (RJ) — Painel + Sentimento
- [x] Sóstenes Cavalcante (RJ) — Painel + Sentimento
- [x] Lindbergh Farias (RJ) — Painel + Sentimento

---

## Próximos passos

### P1 · Dados 2026

#### P1-A · Comparativo 2022 vs 2018 no mapa
- [ ] Processar CSVs TSE 2018 → `painel_2018.json` por cliente
- [ ] Adicionar campos `votos_2018`, `pct_2018` ao `MunicipioData`
- [ ] Toggle "2022 / 2018" no mapa com coloração dinâmica
- [ ] Popup exibindo ambos os anos com delta (▲▼)

#### P1-B · Score de prioridade 2026
- [ ] Campo `score_prioridade` combinando eleitorado, penetração atual e crescimento 2018→2022
- [ ] Camada dedicada no mapa ("Prioridade 2026") com legenda própria
- [ ] Top-20 municípios prioritários em destaque

#### P1-C · Dados eleitorais 2024
- [ ] Processar `dados/van-hattem/rs/rs-2024.csv` (eleições municipais) — vereadores e prefeitos
- [ ] Seção "2024" no painel com desempenho do partido por município

---

### P2 · Painel — melhorias

#### P2-A · Exportar CSV do ranking
- [ ] Botão "Exportar CSV" no ranking (respeita filtros e ordenação ativos)
- [ ] Colunas: município, votos, %, zona, potencial, score prioridade

#### P2-B · Mesorregiões completas
- [ ] Mapear todos os 497 municípios do RS para as 7 mesorregiões IBGE
- [ ] Filtro por mesorregião no ranking
- [ ] Atualizar `/painel/regioes` com as 7 mesorregiões completas

---

### P3 · Sentimento — melhorias

#### P3-A · Histórico persistido
- [ ] Salvar snapshots de sentimento periodicamente (SQLite ou arquivo JSON)
- [ ] Gráfico de linha histórico — últimos 7 dias
- [ ] Comparativo hoje vs ontem

#### P3-B · Alertas de sentimento negativo
- [ ] Threshold configurável (ex: >40% negativo nas últimas 2h)
- [ ] Webhook Discord/Slack ao ultrapassar o threshold
- [ ] Indicador visual de alerta no dashboard

#### P3-C · Múltiplas fontes
- [ ] YouTube Data API v3 — comentários em vídeos
- [ ] Agregação unificada com badge de fonte (X / YouTube)
- [ ] Filtro por fonte no feed

---

### P4 · Mobilização — melhorias

#### P4-A · Persistência do contador
- [ ] Migrar `lib/mobilizacao/db.ts` de in-memory para arquivo JSON gravado em disco (ou SQLite)
- [ ] Garantir que o contador sobrevive a restarts e redeploys

#### P4-B · Captura de e-mails
- [ ] Campo e-mail (opcional) no `FormAssinatura`
- [ ] Endpoint protegido `GET /api/admin/emails` para exportar lista
- [ ] Integração opcional Brevo/Mailchimp

#### P4-C · Segmentação por estado
- [ ] Capturar UF do assinante no formulário
- [ ] Contador por UF em `counter.json`
- [ ] Mapa do Brasil colorido por volume de assinaturas

---

### P5 · Infraestrutura

#### P5-A · Senhas com hash
- [ ] Substituir senhas em texto plano em `clientes.json` por hashes bcrypt
- [ ] Script `scripts/hash-password.ts` para gerar hashes

#### P5-B · PWA
- [ ] `manifest.json` com nome, ícone e cor dinâmicos por cliente
- [ ] Service worker básico (cache de assets estáticos)
- [ ] Meta tags apple-touch-icon

#### P5-C · Novos clientes
- [ ] Fluxo documentado de onboarding (README já tem os 5 passos)
- [ ] Script de scaffold para novos clientes (`scripts/novo-cliente.ts`)

---

## Dados disponíveis

| Arquivo | Conteúdo | Status |
|---------|----------|--------|
| `data/{id}/painel.json` | Votos dep. federal 2022 por município | ✅ em uso (4 clientes) |
| `dados/van-hattem/rs/rs-2022.csv` | Raw TSE 2022 RS | ✅ processado |
| `dados/van-hattem/rs/rs-2024.csv` | Eleições municipais 2024 RS | ⏳ não processado |
| `dados/van-hattem/rs/votacao_candidato_munzona_2022_RS.csv` | TSE detalhado 2022 RS | ⏳ não usado |
| dados dep. federal 2018 | Votos por município 2018 | ❌ falta baixar do TSE |
