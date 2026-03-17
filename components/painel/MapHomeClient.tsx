"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MapRSDynamic from "./MapRSDynamic";
import { type MunicipioData } from "@/lib/painel/utils";

interface Props {
  municipios: MunicipioData[];
  geojsonUrl: string;
}

const FILTERS = [
  { key: "all",         label: "Todos" },
  { key: "fortaleza",   label: "Fortalezas (>10%)" },
  { key: "crescimento", label: "Crescimento (3–10%)" },
  { key: "fraco",       label: "Baixa penetração (<3%)" },
] as const;

type Filter = (typeof FILTERS)[number]["key"];

const LEGEND = [
  { color: "#78350f", label: "> 20%" },
  { color: "#92400e", label: "15–20%" },
  { color: "#d97706", label: "10–15%" },
  { color: "#fbbf24", label: "5–10%" },
  { color: "#fde68a", label: "2–5%" },
  { color: "#d1d5db", label: "< 2%" },
];

export default function MapHomeClient({ municipios, geojsonUrl }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<MunicipioData | null>(null);
  const router = useRouter();

  const top = [...municipios].sort((a, b) => b.pct - a.pct).slice(0, 8);
  const max = top[0]?.pct ?? 1;

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === f.key
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Map */}
        <div className="lg:col-span-3">
          <MapRSDynamic filter={filter} onSelect={setSelected} geojsonUrl={geojsonUrl} />
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3">
            {LEGEND.map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="inline-block w-3 h-3 rounded-sm flex-shrink-0 border border-gray-200" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-3">
          {selected ? (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Selecionado</div>
              <div className="font-black text-lg text-gray-900 mb-3">{selected.municipio}</div>
              <div className="text-5xl font-black text-amber-600 leading-none mb-1">{selected.pct.toFixed(1)}%</div>
              <div className="text-xs text-gray-400 mb-4">do eleitorado dep. federal</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Votos</span>
                  <span className="font-semibold text-gray-900">{selected.votos.toLocaleString("pt-BR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total dep. federal</span>
                  <span className="font-semibold text-gray-900">{selected.total_dep_fed.toLocaleString("pt-BR")}</span>
                </div>
              </div>
              <button
                onClick={() => router.push(`/painel/municipio/${selected.slug}`)}
                className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-lg text-sm transition"
              >
                Análise completa →
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm">
              <div className="text-gray-400 text-sm">Clique em um município no mapa para ver os detalhes</div>
            </div>
          )}

          {/* Quick top */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-3">Top % eleitoral</div>
            <div className="space-y-2">
              {top.map((m) => (
                <div key={m.municipio}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-gray-700 truncate max-w-[120px]">{m.municipio}</span>
                    <span className="text-amber-600 font-semibold">{m.pct.toFixed(1)}%</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${(m.pct / max) * 100}%`, background: "linear-gradient(90deg,#f59e0b,#d97706)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
