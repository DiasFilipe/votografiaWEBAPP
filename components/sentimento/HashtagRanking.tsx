import type { HashtagCount } from "@/lib/sentimento/types";

const SENTIMENT_STYLE: Record<string, { badge: string; bar: string }> = {
  positivo: { badge: "bg-green-100 text-green-700", bar: "#16a34a" },
  negativo: { badge: "bg-red-100 text-red-700",     bar: "#dc2626" },
  neutro:   { badge: "bg-yellow-100 text-yellow-700", bar: "#ca8a04" },
};

export default function HashtagRanking({ hashtags }: { hashtags: HashtagCount[] }) {
  const max = hashtags[0]?.count || 1;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-4">Top Hashtags</h3>
      <div className="space-y-3">
        {hashtags.map((ht, i) => {
          const style = SENTIMENT_STYLE[ht.sentiment];
          const pct = (ht.count / max) * 100;
          return (
            <div key={ht.tag} className="flex items-center gap-3">
              <span className="text-gray-400 text-xs w-4 tabular-nums">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800 truncate">{ht.tag}</span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${style.badge}`}>{ht.sentiment}</span>
                    <span className="text-xs text-gray-400 tabular-nums w-6 text-right">{ht.count}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: style.bar }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
