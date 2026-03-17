"use client";

import { useEffect, useState, useRef } from "react";

interface Props {
  initialCount: number;
  meta?: number;
}

function formatNumber(n: number): string {
  return n.toLocaleString("pt-BR");
}

export default function ContadorLive({ initialCount, meta = 100_000 }: Props) {
  const [count, setCount] = useState(initialCount);
  const [animate, setAnimate] = useState(false);
  const prevRef = useRef(initialCount);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/contador", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.count !== prevRef.current) {
            prevRef.current = data.count;
            setCount(data.count);
            setAnimate(true);
            setTimeout(() => setAnimate(false), 400);
          }
        }
      } catch { /* silent */ }
    }, 5_000);
    return () => clearInterval(interval);
  }, []);

  const pct = Math.min(100, Math.round((count / meta) * 100));

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div className="text-center">
        <div
          className={`text-7xl md:text-8xl font-black tabular-nums transition-transform ${animate ? "scale-105" : "scale-100"}`}
          style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          {formatNumber(count)}
        </div>
        <p className="text-gray-400 text-lg mt-1">assinaturas coletadas</p>
      </div>
      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{pct}% da meta</span>
          <span>Meta: {formatNumber(meta)}</span>
        </div>
        <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, #16a34a 0%, #22c55e 100%)", boxShadow: "0 0 12px rgba(34,197,94,0.5)" }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        Atualizado em tempo real
      </div>
    </div>
  );
}
