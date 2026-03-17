import { analyzeSentiment, detectState } from "./sentiment";
import type { Mention, MentionData, TimelinePoint, HashtagCount } from "./types";

const RAW_TWEETS = [
  "Van Hattem está certo! O STF precisa ser investigado urgentemente. Parabéns ao deputado pela coragem! #CPIdoSTF",
  "Parabéns ao @MarcelVanHattem por defender o povo brasileiro contra os abusos do STF 👏 #VanHattem",
  "Van Hattem liderando a luta pela CPI do STF. É isso que precisamos! Força, deputado! #ForaSTF",
  "Ótimo discurso do Van Hattem sobre os limites do STF. Precisamos de mais parlamentares assim.",
  "Apoio total ao Van Hattem e à CPI do STF. O povo está com você! 🇧🇷 #CPIdoSTF #VanHattemSenador",
  "Van Hattem apresentou hoje requerimento de CPI do STF com 89 assinaturas coletadas",
  "Van Hattem e outros deputados entregaram requerimento de CPI para investigar o STF",
  "Deputado Van Hattem discursou hoje na Câmara sobre a CPI do STF — confira o vídeo",
  "Van Hattem critica decisões do STF e cobra responsabilidade dos ministros",
  "Sessão na Câmara: Van Hattem apresenta requerimento de CPI do STF",
  "Que vergonha o Van Hattem atacando o STF com essa farsa de CPI #Golpistas",
  "Van Hattem e sua turma continuam com o discurso autoritário de sempre. Que absurdo!",
  "Inaceitável o que Van Hattem está fazendo, tentando intimidar o STF",
  "Van Hattem representa o retrocesso democrático. Precisamos resistir! #DemocraciaSimGolpeNão",
  "Extremismo puro do Van Hattem atacando as instituições do país. Vergonhoso!",
  "Van Hattem corajoso defende investigação do STF! O Brasil precisa disso aqui no RS 🇧🇷",
  "Porto Alegre apoia Van Hattem na luta pela CPI do STF! Gaúcho tem orgulho!",
  "Mineiro aqui apoiando Van Hattem! O STF precisa de investigação em Minas Gerais também",
  "Van Hattem vai ser um grande senador pelo Rio Grande do Sul! Parabéns pela luta! #VanHattemSenador",
  "SP apoia Van Hattem! Aqui em São Paulo todo mundo quer a CPI do STF #CPIdoSTF",
  "Van Hattem absurdo atacando o STF aqui no Rio de Janeiro também não passa",
  "Parana apoia Van Hattem! Deputado correto e honesto que defende a Constituição",
  "CPI do STF: Van Hattem já tem mais de 80 assinaturas coletadas, diz assessoria",
  "Van Hattem participa de evento em Porto Alegre sobre controle do judiciário",
  "Entrevista: Van Hattem explica a necessidade da CPI do STF",
  "Van Hattem lidera bancada conservadora em prol da accountability judicial",
  "O STF precisa de controle externo, diz Van Hattem em entrevista à rádio gaúcha",
  "Van Hattem: 'a CPI do STF é um direito constitucional dos parlamentares'",
  "Van Hattem sensacional! Só ele tem coragem de enfrentar o STF #VanHattemPresidente",
  "Que homem corajoso é o Van Hattem! Incrível como defende o povo brasileiro 👏👏",
  "Van Hattem honesto e correto como sempre. Diferente da maioria dos políticos!",
  "Admirável a postura do Van Hattem. O Brasil precisa de mais políticos assim",
  "Van Hattem é esperança para o Brasil! A CPI do STF vai mostrar tudo #BrasilComVanHattem",
  "Esse Van Hattem é um perigo para a democracia. Que horrível!",
  "Discordo totalmente do Van Hattem. A CPI do STF é golpismo puro",
  "Van Hattem é irresponsável ao atacar o judiciário. Péssimo deputado!",
  "Van Hattem e Bolsonaro são a mesma coisa: extremismo e ameaça à democracia",
  "Van Hattem fala sobre a CPI do STF em entrevista ao Jornal Nacional",
  "Câmara debate requerimento de Van Hattem para CPI do STF — votação prevista",
  "Van Hattem apresenta dados sobre decisões do STF em plenário",
];

const AUTHORS = [
  { name: "João Silva", handle: "joaosilva_rs" },
  { name: "Maria Fernandes", handle: "mariafe_br" },
  { name: "Pedro Oliveira", handle: "pedroliv" },
  { name: "Ana Costa", handle: "anacosta_sp" },
  { name: "Carlos Ribeiro", handle: "carlosrib" },
  { name: "Lucia Martins", handle: "luciamartins" },
  { name: "Roberto Souza", handle: "robertosouza_pr" },
  { name: "Fernanda Lima", handle: "fernandalima" },
  { name: "Marcos Alves", handle: "marcosalves_mg" },
  { name: "Patricia Nunes", handle: "patriciaN" },
  { name: "Thiago Campos", handle: "thiagocampos" },
  { name: "Claudia Vieira", handle: "claudiavieira" },
  { name: "Sandro Pereira", handle: "sandroperei" },
  { name: "Beatriz Gomes", handle: "beatrizgomes" },
  { name: "Ricardo Hora", handle: "ricardohora" },
  { name: "Jornalismo RS", handle: "jornalismors" },
  { name: "Câmara Federal", handle: "camaraoficial" },
  { name: "Política BR", handle: "politicabr" },
  { name: "Notícias RS", handle: "noticiasrs" },
  { name: "Portal Câmara", handle: "portalcamara" },
];

function seedRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function generateMockMentions(): MentionData {
  const rng = seedRandom(42);
  const now = Date.now();
  const mentions: Mention[] = [];

  for (let i = 0; i < RAW_TWEETS.length; i++) {
    const text = RAW_TWEETS[i];
    const { sentiment, score } = analyzeSentiment(text);
    const state = detectState(text);
    const hoursAgo = Math.floor(rng() * 168);
    const author = AUTHORS[i % AUTHORS.length];

    mentions.push({
      id: `mock_${i}`,
      text,
      author: author.name,
      authorHandle: author.handle,
      sentiment,
      score,
      timestamp: new Date(now - hoursAgo * 3_600_000).toISOString(),
      likes: Math.floor(rng() * 2000),
      retweets: Math.floor(rng() * 500),
      state,
      url: `https://x.com/${author.handle}/status/mock${i}`,
    });
  }

  mentions.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const total = mentions.length;
  const positivo = mentions.filter((m) => m.sentiment === "positivo").length;
  const negativo = mentions.filter((m) => m.sentiment === "negativo").length;
  const neutro = mentions.filter((m) => m.sentiment === "neutro").length;
  const avgScore = mentions.reduce((acc, m) => acc + m.score, 0) / total;

  const timeline: TimelinePoint[] = [];
  for (let d = 6; d >= 0; d--) {
    const dayStart = new Date(now - d * 86_400_000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 86_400_000);

    const dayMentions = mentions.filter((m) => {
      const t = new Date(m.timestamp).getTime();
      return t >= dayStart.getTime() && t < dayEnd.getTime();
    });

    timeline.push({
      date: dayStart.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      positivo: dayMentions.filter((m) => m.sentiment === "positivo").length,
      negativo: dayMentions.filter((m) => m.sentiment === "negativo").length,
      neutro: dayMentions.filter((m) => m.sentiment === "neutro").length,
      total: dayMentions.length,
    });
  }

  const hashtagMap: Record<string, { count: number; scores: number[] }> = {};
  for (const m of mentions) {
    const tags = m.text.match(/#[\w\u00C0-\u017E]+/g) || [];
    for (const tag of tags) {
      if (!hashtagMap[tag]) hashtagMap[tag] = { count: 0, scores: [] };
      hashtagMap[tag].count++;
      hashtagMap[tag].scores.push(m.score);
    }
  }

  const hashtags: HashtagCount[] = Object.entries(hashtagMap)
    .map(([tag, { count, scores }]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return {
        tag,
        count,
        sentiment: (avg > 0.15 ? "positivo" : avg < -0.15 ? "negativo" : "neutro") as "positivo" | "negativo" | "neutro",
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return {
    stats: {
      total,
      positivo,
      negativo,
      neutro,
      positivoPct: Math.round((positivo / total) * 100),
      negativoPct: Math.round((negativo / total) * 100),
      neutroPct: Math.round((neutro / total) * 100),
      avgScore,
    },
    timeline,
    hashtags,
    mentions,
    lastUpdated: new Date().toISOString(),
    isDemo: true,
  };
}
