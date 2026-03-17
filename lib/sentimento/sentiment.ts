// Rule-based Portuguese political sentiment analyzer
const POSITIVE: string[] = [
  "parabéns", "apoio", "apoia", "excelente", "ótimo", "boa", "bom",
  "correto", "certo", "concordo", "bravo", "corajoso", "patriota",
  "verdade", "defender", "defende", "luta", "honesto", "justo",
  "importante", "necessário", "essencial", "favorável", "acerto",
  "brilhante", "herói", "esperança", "liberdade", "democracia",
  "transparência", "investigação", "cobrar", "fiscalizar", "responsabilidade",
  "melhor", "ótima", "admiro", "apoiamos", "incrível",
  "fantástico", "sensacional", "precisa",
];

const NEGATIVE: string[] = [
  "absurdo", "vergonha", "errado", "péssimo", "lamentável", "ridículo",
  "inaceitável", "horrível", "terrível", "fascista", "golpista",
  "mentiroso", "inconstitucional", "irresponsável", "perigoso",
  "autoritário", "anti-democrático", "extremista", "radicais",
  "ameaça", "retrocesso", "destruindo", "contra", "criticar",
  "discordo", "não concordo", "ataque", "pior",
  "vergonhoso", "inadmissível", "louco",
];

export function analyzeSentiment(text: string): {
  sentiment: "positivo" | "negativo" | "neutro";
  score: number;
} {
  const lower = text.toLowerCase();
  let score = 0;

  for (const word of POSITIVE) {
    if (lower.includes(word)) score += 1;
  }
  for (const word of NEGATIVE) {
    if (lower.includes(word)) score -= 1;
  }

  const normalized = Math.max(-1, Math.min(1, score / 3));

  if (normalized > 0.15) return { sentiment: "positivo", score: normalized };
  if (normalized < -0.15) return { sentiment: "negativo", score: normalized };
  return { sentiment: "neutro", score: normalized };
}

const STATE_PATTERNS: Record<string, string[]> = {
  RS: ["rio grande do sul", "porto alegre", "gaúcho", "gaúcha", "rs"],
  SP: ["são paulo", "paulistano", "sp"],
  MG: ["minas gerais", "mineiro", "belo horizonte", "mg"],
  RJ: ["rio de janeiro", "carioca", "rj"],
  PR: ["paraná", "curitiba", "paranaense", "pr"],
  SC: ["santa catarina", "florianópolis", "catarinense", "sc"],
  GO: ["goiás", "goiânia", "go"],
  BA: ["bahia", "salvador", "baiano", "ba"],
  PE: ["pernambuco", "recife", "pernambucano", "pe"],
  CE: ["ceará", "fortaleza", "cearense", "ce"],
  DF: ["brasília", "distrito federal", "df"],
};

export function detectState(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const [uf, patterns] of Object.entries(STATE_PATTERNS)) {
    if (patterns.some((p) => lower.includes(p))) return uf;
  }
  return undefined;
}
