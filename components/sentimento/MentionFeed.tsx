import type { Mention } from "@/lib/sentimento/types";

const SENTIMENT_STYLE = {
  positivo: { border: "border-green-200",  bg: "bg-green-50",  badge: "bg-green-100 text-green-700", dot: "bg-green-500" },
  negativo: { border: "border-red-200",    bg: "bg-red-50",    badge: "bg-red-100 text-red-700",     dot: "bg-red-500" },
  neutro:   { border: "border-yellow-200", bg: "bg-yellow-50", badge: "bg-yellow-100 text-yellow-700",dot: "bg-yellow-500" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

function MentionCard({ m }: { m: Mention }) {
  const style = SENTIMENT_STYLE[m.sentiment];
  return (
    <div className={`${style.bg} border ${style.border} rounded-xl p-4`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
          <div className="min-w-0">
            <span className="font-medium text-gray-900 text-sm">{m.author}</span>
            <span className="text-gray-400 text-xs ml-1">@{m.authorHandle}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {m.state && <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">{m.state}</span>}
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>{m.sentiment}</span>
        </div>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed mb-3">{m.text}</p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex gap-3">
          <span>❤️ {m.likes.toLocaleString("pt-BR")}</span>
          <span>🔁 {m.retweets.toLocaleString("pt-BR")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{timeAgo(m.timestamp)}</span>
          {m.url && <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 transition">Ver ↗</a>}
        </div>
      </div>
    </div>
  );
}

export default function MentionFeed({ mentions }: { mentions: Mention[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-4">
        Últimas Menções <span className="text-gray-400 font-normal text-sm">({mentions.length} exibidas)</span>
      </h3>
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {mentions.map((m) => <MentionCard key={m.id} m={m} />)}
      </div>
    </div>
  );
}
