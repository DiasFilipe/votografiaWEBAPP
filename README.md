# Votografia · Webapp

Painel de inteligência política para deputados federais brasileiros. Cada candidato acessa o próprio subdomínio e enxerga dados personalizados — resultados eleitorais, monitoramento de redes sociais e ferramentas de mobilização.

---

## O que o site faz

### Painel Eleitoral

O módulo principal. Exibe um **mapa coroplético** do estado do candidato com os resultados da eleição de deputado federal de 2022, município a município.

A lógica central é: *onde estão os votos e onde há espaço para crescer em 2026?*

Cada município recebe uma **zona de desempenho**:
- **Fortaleza** (>10% do eleitorado) — base sólida, prioridade de manutenção
- **Crescimento** (3–10%) — potencial de ganho expressivo
- **Baixo** (<3%) — presença ainda fraca

E um **score de potencial 2026**, calculado cruzando o tamanho do eleitorado com a penetração atual. Municípios grandes com penetração baixa têm alto potencial — mais retorno por esforço de campanha.

O candidato pode navegar pelo **ranking** de municípios (filtrável por zona e potencial), pela **análise por macrorregião**, e entrar no **detalhe de cada município** para ver contexto estratégico e municípios similares.

### Monitor de Sentimento

Acompanha em tempo real o que as pessoas estão falando sobre o candidato nas redes sociais.

Usa a **API v2 do X/Twitter** para buscar menções e classifica cada uma como positiva, negativa ou neutra com um analisador rule-based em português. Se o token da API não estiver configurado, exibe dados simulados realistas para demonstração.

O dashboard mostra: distribuição de sentimento (donut), evolução ao longo do dia (linha), top hashtags e feed das últimas menções.

### Mobilização

Landing page de campanha para pressionar deputados federais a assinarem um requerimento de CPI.

O visitante pode **assinar a petição** (formulário simples com nome e estado), acompanhar o **contador ao vivo** de assinaturas, e enviar mensagens diretamente para deputados via WhatsApp ou e-mail com texto pré-preenchido.

O contador é persistido no banco de dados — não perde dados entre deploys.

---

## Multi-tenancy

Um único codebase serve múltiplos candidatos. Cada um acessa pelo próprio subdomínio:

```
vanhattem.votografia.com.br    →  Van Hattem (RS)
carolsponza.votografia.com.br  →  Carol Sponza (RJ)
sostenes.votografia.com.br     →  Sóstenes Cavalcante (RJ)
lindbergh.votografia.com.br    →  Lindbergh Farias (RJ)
```

O cliente ativo é resolvido no servidor via [`lib/auth.ts`](./lib/auth.ts): em produção, pelo **cookie de sessão** (`vtg_sess`) e pelo **host/subdomínio**; em desenvolvimento, o login é bypassado e o cookie `dev_cliente_id` permite alternar o cliente na UI.

Cada candidato tem uma senha própria e só acessa seus próprios dados.

---

## Módulos por candidato

Nem todos os módulos fazem sentido para todos os candidatos. A configuração fica no banco de dados:

```
Van Hattem    →  Painel ✓  Sentimento ✓  Mobilização ✓
Carol Sponza  →  Painel ✓  Sentimento ✓  Mobilização —
Sóstenes      →  Painel ✓  Sentimento ✓  Mobilização —
Lindbergh     →  Painel ✓  Sentimento ✓  Mobilização —
```

A sidebar se adapta automaticamente — itens desabilitados não aparecem.

---

## Desenvolvimento local

```bash
npm install
cp .env.example .env.local   # preencha DATABASE_URL e SESSION_SECRET
npm run dev                  # http://localhost:3010
```

Em desenvolvimento, o login é bypassado automaticamente. Para trocar de candidato, clique no **avatar** no canto superior esquerdo da sidebar — um dropdown mostra todos os candidatos disponíveis (grava o cookie `dev_cliente_id`).

### Banco de dados

```bash
npm run db:migrate   # cria as tabelas
npm run db:seed      # popula com os dados de data/clientes.json e data/*/painel.json
```

---

## Adicionar novo candidato

1. Inserir entrada em `data/clientes.json`
2. Adicionar mapeamento em `lib/clientes/subdomains.ts`
3. Criar `data/{id}/painel.json` com os dados eleitorais
4. Adicionar `public/data/{id}-municipios.geojson` com as geometrias
5. Rodar `npm run db:seed`
6. Configurar novo serviço no Railway apontando para este repositório

Para detalhes técnicos da arquitetura, ver [`arch.md`](./arch.md).
