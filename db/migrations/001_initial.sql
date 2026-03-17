CREATE TABLE IF NOT EXISTS clientes (
  id              TEXT PRIMARY KEY,
  subdominio      TEXT NOT NULL UNIQUE,
  nome            TEXT NOT NULL,
  nome_completo   TEXT NOT NULL,
  partido         TEXT NOT NULL,
  estado          TEXT NOT NULL,
  cargo           TEXT NOT NULL,
  cor             TEXT NOT NULL,
  cor_texto       TEXT NOT NULL,
  foto            TEXT NOT NULL DEFAULT '/foto.jpg',
  senha           TEXT NOT NULL,
  modulo_painel       BOOLEAN NOT NULL DEFAULT true,
  modulo_sentimento   BOOLEAN NOT NULL DEFAULT false,
  modulo_mobilizacao  BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS municipios (
  id              SERIAL PRIMARY KEY,
  cliente_id      TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  municipio       TEXT NOT NULL,
  cod_tse         TEXT NOT NULL,
  votos           INTEGER NOT NULL,
  total_dep_fed   INTEGER NOT NULL,
  pct             NUMERIC(6,2) NOT NULL,
  UNIQUE(cliente_id, cod_tse)
);

CREATE TABLE IF NOT EXISTS assinaturas (
  id         SERIAL PRIMARY KEY,
  nome       TEXT,
  uf         CHAR(2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
