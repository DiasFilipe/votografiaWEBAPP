import { NextResponse } from "next/server";
import { generateMockMentions } from "@/lib/sentimento/mockData";
import type { MentionData } from "@/lib/sentimento/types";

export const dynamic = "force-dynamic";

async function fetchRealMentions(bearerToken: string): Promise<MentionData> {
  const query = encodeURIComponent(
    '(Van Hattem OR "VanHattem" OR #VanHattem OR #CPIdoSTF) lang:pt -is:retweet'
  );
  const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=100&tweet.fields=created_at,public_metrics,author_id,geo&expansions=author_id&user.fields=name,username`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${bearerToken}` } });
  if (!res.ok) throw new Error(`X API error: ${res.status}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await res.json() as any;
  const usersMap: Record<string, { name: string; username: string }> = {};
  if (data.includes?.users) {
    for (const u of data.includes.users) {
      usersMap[u.id] = { name: u.name, username: u.username };
    }
  }

  const { analyzeSentiment, detectState } = await import("@/lib/sentimento/sentiment");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mentions = (data.data || []).map((t: any) => {
    const author = usersMap[t.author_id] || { name: "Usuário", username: "user" };
    const { sentiment, score } = analyzeSentiment(t.text);
    return {
      id: t.id,
      text: t.text,
      author: author.name,
      authorHandle: author.username,
      sentiment,
      score,
      timestamp: t.created_at,
      likes: t.public_metrics?.like_count || 0,
      retweets: t.public_metrics?.retweet_count || 0,
      state: detectState(t.text),
      url: `https://x.com/${author.username}/status/${t.id}`,
    };
  });

  const total = mentions.length;
  const positivo = mentions.filter((m: { sentiment: string }) => m.sentiment === "positivo").length;
  const negativo = mentions.filter((m: { sentiment: string }) => m.sentiment === "negativo").length;
  const neutro = mentions.filter((m: { sentiment: string }) => m.sentiment === "neutro").length;

  return {
    stats: {
      total, positivo, negativo, neutro,
      positivoPct: total ? Math.round((positivo / total) * 100) : 0,
      negativoPct: total ? Math.round((negativo / total) * 100) : 0,
      neutroPct: total ? Math.round((neutro / total) * 100) : 0,
      avgScore: total ? mentions.reduce((a: number, m: { score: number }) => a + m.score, 0) / total : 0,
    },
    timeline: [],
    hashtags: [],
    mentions,
    lastUpdated: new Date().toISOString(),
    isDemo: false,
  };
}

export async function GET() {
  const bearerToken = process.env.X_API_BEARER_TOKEN;
  try {
    if (bearerToken) {
      const data = await fetchRealMentions(bearerToken);
      return NextResponse.json(data);
    }
  } catch (err) {
    console.error("X API error, falling back to mock:", err);
  }
  return NextResponse.json(generateMockMentions());
}
