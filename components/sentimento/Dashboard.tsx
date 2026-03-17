"use client";

import { useState, useEffect, useCallback } from "react";
import StatsCards from "./StatsCards";
import SentimentDonut from "./SentimentDonut";
import TimelineChart from "./TimelineChart";
import MentionFeed from "./MentionFeed";
import HashtagRanking from "./HashtagRanking";
import type { MentionData } from "@/lib/sentimento/types";

const REFRESH_INTERVAL = 5 * 60 * 1000;

const SENTIMENT_FILTERS = [
  { value: "todos", label: "Todos" },
  { value: "positivo", label: "Positivos" },
  { value: "negativo", label: "Negativos" },
  { value: "neutro", label: "Neutros" },
] as const;

type Filter = (typeof SENTIMENT_FILTERS)[number]["value"];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function Dashboard({ initial }: { initial: MentionData }) {
  const [data, setData] = useState<MentionData>(initial);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>("todos");
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mentions", { cache: "no-store" });
      if (res.ok) {
        setData(await res.json());
        setCountdown(REFRESH_INTERVAL / 1000);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    const tick = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : REFRESH_INTERVAL / 1000)), 1000);
    return () => clearInterval(tick);
  }, []);

  const filteredMentions = filter === "todos" ? data.mentions : data.mentions.filter((m) => m.sentiment === filter);

  return (
    <div className="space-y-6">
      {/* Sub-header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-gray-500 text-xs">
            Atualizado às {formatTime(data.lastUpdated)} · Próx. em {countdown}s
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data.isDemo && (
            <span className="bg-yellow-100 border border-yellow-300 text-yellow-700 text-xs font-bold px-3 py-1.5 rounded-full">
              MODO DEMO
            </span>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <span className={loading ? "animate-spin inline-block" : ""}>↻</span>
            {loading ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
      </div>

      <StatsCards stats={data.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SentimentDonut stats={data.stats} />
        <TimelineChart data={data.timeline} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-400">Filtrar menções:</span>
        {SENTIMENT_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f.value ? "bg-yellow-500 text-black" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
            {f.value !== "todos" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({f.value === "positivo" ? data.stats.positivo : f.value === "negativo" ? data.stats.negativo : data.stats.neutro})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1"><HashtagRanking hashtags={data.hashtags} /></div>
        <div className="lg:col-span-2"><MentionFeed mentions={filteredMentions} /></div>
      </div>

      {data.isDemo && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-sm text-blue-800">
          <p className="font-bold text-blue-900 mb-1">Como ativar dados reais do X/Twitter</p>
          <p className="text-blue-600">
            Configure <code className="bg-blue-100 px-2 py-0.5 rounded font-mono text-blue-800">X_API_BEARER_TOKEN</code> no <code className="bg-blue-100 px-1 rounded font-mono text-blue-800">.env.local</code> com o token do X API v2.
          </p>
        </div>
      )}
    </div>
  );
}
