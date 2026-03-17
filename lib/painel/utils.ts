// Client-safe utilities — no Node.js imports
export interface MunicipioData {
  municipio: string;
  cod_tse: string;
  votos: number;
  total_dep_fed: number;
  pct: number;
  slug: string;
  regiao?: string;
}

export function getTotalVotos(municipios: MunicipioData[]): number {
  return municipios.reduce((acc, m) => acc + m.votos, 0);
}

export function getBySlug(municipios: MunicipioData[]): Record<string, MunicipioData> {
  return Object.fromEntries(municipios.map((m) => [m.slug, m]));
}

export function getPotencial(m: MunicipioData): "alto" | "medio" | "baixo" {
  const score = m.total_dep_fed / 1000 / (m.pct + 1);
  if (score > 20) return "alto";
  if (score > 5) return "medio";
  return "baixo";
}

export function getZona(pct: number): "fortaleza" | "crescimento" | "fraco" {
  if (pct >= 10) return "fortaleza";
  if (pct >= 3) return "crescimento";
  return "fraco";
}

export function getColor(pct: number): string {
  if (pct > 20) return "#78350f";
  if (pct > 15) return "#92400e";
  if (pct > 10) return "#d97706";
  if (pct > 5)  return "#fbbf24";
  if (pct > 2)  return "#fde68a";
  return "#e2e8f0";
}

export function formatVotos(n: number): string {
  return n.toLocaleString("pt-BR");
}
