export interface Mention {
  id: string;
  text: string;
  author: string;
  authorHandle: string;
  sentiment: "positivo" | "negativo" | "neutro";
  score: number; // -1 to 1
  timestamp: string;
  likes: number;
  retweets: number;
  state?: string;
  url?: string;
}

export interface SentimentStats {
  total: number;
  positivo: number;
  negativo: number;
  neutro: number;
  positivoPct: number;
  negativoPct: number;
  neutroPct: number;
  avgScore: number;
}

export interface TimelinePoint {
  date: string; // "DD/MM"
  positivo: number;
  negativo: number;
  neutro: number;
  total: number;
}

export interface HashtagCount {
  tag: string;
  count: number;
  sentiment: "positivo" | "negativo" | "neutro";
}

export interface MentionData {
  stats: SentimentStats;
  timeline: TimelinePoint[];
  hashtags: HashtagCount[];
  mentions: Mention[];
  lastUpdated: string;
  isDemo: boolean;
}
