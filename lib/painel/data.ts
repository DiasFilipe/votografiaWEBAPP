import { readFileSync } from "fs";
import { join } from "path";
import type { MunicipioData } from "./utils";

export type { MunicipioData };
export { getTotalVotos, getBySlug, getPotencial, getZona, getColor, formatVotos } from "./utils";

const DATA_DIR = process.env.DATA_DIR ?? join(process.cwd(), "data");

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const MESOREGIAO: Record<string, string> = {
  "PORTO ALEGRE": "Metropolitana",
  "CANOAS": "Metropolitana",
  "NOVO HAMBURGO": "Metropolitana",
  "SÃO LEOPOLDO": "Metropolitana",
  "GRAVATAÍ": "Metropolitana",
  "VIAMÃO": "Metropolitana",
  "ALVORADA": "Metropolitana",
  "CACHOEIRINHA": "Metropolitana",
  "SAPUCAIA DO SUL": "Metropolitana",
  "DOIS IRMÃOS": "Metropolitana",
  "IVOTI": "Metropolitana",
  "ESTÂNCIA VELHA": "Metropolitana",
  "CAXIAS DO SUL": "Serra Gaúcha",
  "BENTO GONÇALVES": "Serra Gaúcha",
  "GRAMADO": "Serra Gaúcha",
  "CANELA": "Serra Gaúcha",
  "FARROUPILHA": "Serra Gaúcha",
  "NOVA PETRÓPOLIS": "Serra Gaúcha",
  "SANTA MARIA": "Centro",
  "SANTA CRUZ DO SUL": "Centro",
  "LAJEADO": "Vale do Taquari",
  "ESTRELA": "Vale do Taquari",
  "PELOTAS": "Sul",
  "RIO GRANDE": "Sul",
  "BAGÉ": "Sul",
  "URUGUAIANA": "Fronteira",
  "SANTA ROSA": "Noroeste",
  "PASSO FUNDO": "Planalto",
  "ERECHIM": "Planalto",
  "IJUÍ": "Noroeste",
  // RJ
  "RIO DE JANEIRO": "Capital",
  "NITERÓI": "Metropolitana",
  "DUQUE DE CAXIAS": "Baixada Fluminense",
  "SÃO GONÇALO": "Metropolitana",
  "NOVA IGUAÇU": "Baixada Fluminense",
  "BELFORD ROXO": "Baixada Fluminense",
  "SÃO JOÃO DE MERITI": "Baixada Fluminense",
  "PETRÓPOLIS": "Serra",
  "VOLTA REDONDA": "Sul Fluminense",
  "NOVA FRIBURGO": "Serra",
  "ANGRA DOS REIS": "Costa Verde",
  "CAMPOS DOS GOYTACAZES": "Norte",
  "MACAÉ": "Norte",
};

function getRegiao(municipio: string): string {
  return MESOREGIAO[municipio] ?? "Interior";
}

// Cache por clienteId para evitar leitura repetida
const _cache = new Map<string, MunicipioData[]>();

export function getMunicipios(clienteId: string): MunicipioData[] {
  if (_cache.has(clienteId)) return _cache.get(clienteId)!;

  const raw = JSON.parse(
    readFileSync(join(DATA_DIR, clienteId, "painel.json"), "utf-8")
  ) as Omit<MunicipioData, "slug" | "regiao">[];

  const municipios = raw
    .map((d) => ({
      ...d,
      slug: toSlug(d.municipio),
      regiao: getRegiao(d.municipio),
    }))
    .sort((a, b) => b.votos - a.votos);

  _cache.set(clienteId, municipios);
  return municipios;
}
