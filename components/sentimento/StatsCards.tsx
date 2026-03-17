import type { SentimentStats } from "@/lib/sentimento/types";

function ScoreBar({ score }: { score: number }) {
  const pct = ((score + 1) / 2) * 100;
  const color = score > 0.15 ? "#16a34a" : score < -0.15 ? "#dc2626" : "#ca8a04";
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs text-gray-400 tabular-nums w-12 text-right">
        {score >= 0 ? "+" : ""}{score.toFixed(2)}
      </span>
    </div>
  );
}

export default function StatsCards({ stats }: { stats: SentimentStats }) {
  const cards = [
    { label: "Total de Menções", value: stats.total.toLocaleString("pt-BR"), sub: "últimos 7 dias", color: "text-gray-900", bg: "bg-white", border: "border-gray-200", icon: "📊" },
    { label: "Positivas",        value: `${stats.positivo}`,                 sub: `${stats.positivoPct}% do total`, color: "text-green-700", bg: "bg-green-50",  border: "border-green-200", icon: "👍" },
    { label: "Negativas",        value: `${stats.negativo}`,                 sub: `${stats.negativoPct}% do total`, color: "text-red-700",   bg: "bg-red-50",    border: "border-red-200",   icon: "👎" },
    { label: "Neutras",          value: `${stats.neutro}`,                   sub: `${stats.neutroPct}% do total`,   color: "text-yellow-700",bg: "bg-yellow-50", border: "border-yellow-200",icon: "➡️" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className={`${c.bg} border ${c.border} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-sm">{c.label}</span>
            <span className="text-xl">{c.icon}</span>
          </div>
          <div className={`text-3xl font-black ${c.color} tabular-nums`}>{c.value}</div>
          <div className="text-xs text-gray-400 mt-1">{c.sub}</div>
          {c.label === "Total de Menções" && <ScoreBar score={stats.avgScore} />}
        </div>
      ))}
    </div>
  );
}
