"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getPotencial, getZona, type MunicipioData } from "@/lib/painel/utils";

interface Props {
  municipios: MunicipioData[];
}

const ZONA_LABEL = {
  fortaleza:   { label: "Fortaleza",   cls: "bg-amber-100 text-amber-700 border-amber-200" },
  crescimento: { label: "Crescimento", cls: "bg-blue-100 text-blue-700 border-blue-200" },
  fraco:       { label: "Baixo",       cls: "bg-gray-100 text-gray-500 border-gray-200" },
} as const;

const POT_LABEL = {
  alto:  { label: "Alto potencial",  cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  medio: { label: "Médio",           cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  baixo: { label: "Baixo",           cls: "bg-gray-100 text-gray-500 border-gray-200" },
} as const;

function Badge({ label, cls }: { label: string; cls: string }) {
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>{label}</span>;
}

type SortKey = "votos" | "pct" | "potencial" | "nome";

function SortBtn({ k, label, sort, setSort, setPage }: {
  k: SortKey;
  label: string;
  sort: SortKey;
  setSort: (k: SortKey) => void;
  setPage: (p: number) => void;
}) {
  return (
    <button onClick={() => { setSort(k); setPage(0); }} className={`text-xs font-medium transition ${sort === k ? "text-amber-600" : "text-gray-400 hover:text-gray-700"}`}>
      {label} {sort === k ? "↓" : ""}
    </button>
  );
}

export default function RankingClient({ municipios }: Props) {
  const [q, setQ] = useState("");
  const [zona, setZona] = useState<"all" | "fortaleza" | "crescimento" | "fraco">("all");
  const [potencial, setPotencial] = useState<"all" | "alto" | "medio" | "baixo">("all");
  const [sort, setSort] = useState<SortKey>("votos");
  const [page, setPage] = useState(0);
  const PER_PAGE = 50;

  const filtered = useMemo(() => {
    let list = municipios.map((m) => ({ ...m, zona: getZona(m.pct), pot: getPotencial(m) }));
    if (q) {
      const qn = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      list = list.filter((m) => m.municipio.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(qn));
    }
    if (zona !== "all") list = list.filter((m) => m.zona === zona);
    if (potencial !== "all") list = list.filter((m) => m.pot === potencial);
    list.sort((a, b) => {
      if (sort === "votos") return b.votos - a.votos;
      if (sort === "pct") return b.pct - a.pct;
      if (sort === "potencial") { const order = { alto: 0, medio: 1, baixo: 2 }; return order[a.pot] - order[b.pot]; }
      return a.municipio.localeCompare(b.municipio);
    });
    return list;
  }, [municipios, q, zona, potencial, sort]);

  const page_data = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          type="text" placeholder="Buscar município..." value={q}
          onChange={(e) => { setQ(e.target.value); setPage(0); }}
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 w-56"
        />
        <select value={zona} onChange={(e) => { setZona(e.target.value as typeof zona); setPage(0); }}
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-amber-400">
          <option value="all">Todas as zonas</option>
          <option value="fortaleza">Fortaleza (&gt;10%)</option>
          <option value="crescimento">Crescimento (3–10%)</option>
          <option value="fraco">Baixo (&lt;3%)</option>
        </select>
        <select value={potencial} onChange={(e) => { setPotencial(e.target.value as typeof potencial); setPage(0); }}
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-amber-400">
          <option value="all">Todos os potenciais</option>
          <option value="alto">Alto potencial</option>
          <option value="medio">Médio potencial</option>
          <option value="baixo">Baixo potencial</option>
        </select>
        <span className="text-gray-400 text-sm self-center">{filtered.length} municípios</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-gray-400 font-medium w-8">#</th>
              <th className="px-4 py-3 text-left"><SortBtn k="nome" label="Município" sort={sort} setSort={setSort} setPage={setPage} /></th>
              <th className="px-4 py-3 text-right"><SortBtn k="votos" label="Votos" sort={sort} setSort={setSort} setPage={setPage} /></th>
              <th className="px-4 py-3 text-right"><SortBtn k="pct" label="% Eleit." sort={sort} setSort={setSort} setPage={setPage} /></th>
              <th className="px-4 py-3 text-center hidden md:table-cell">Zona</th>
              <th className="px-4 py-3 text-center hidden md:table-cell"><SortBtn k="potencial" label="Potencial 2026" sort={sort} setSort={setSort} setPage={setPage} /></th>
              <th className="px-4 py-3 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {page_data.map((m, i) => {
              const zi = ZONA_LABEL[m.zona];
              const pi = POT_LABEL[m.pot];
              return (
                <tr key={m.municipio} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-400 text-xs">{page * PER_PAGE + i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{m.municipio}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600">{m.votos.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3 text-right font-bold text-amber-600">{m.pct.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-center hidden md:table-cell"><Badge label={zi.label} cls={zi.cls} /></td>
                  <td className="px-4 py-3 text-center hidden md:table-cell"><Badge label={pi.label} cls={pi.cls} /></td>
                  <td className="px-4 py-3">
                    <Link href={`/painel/municipio/${m.slug}`} className="text-gray-300 hover:text-amber-500 transition text-lg">→</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm disabled:opacity-30 hover:bg-gray-50 transition">← Anterior</button>
            <span className="text-gray-400 text-sm">Página {page + 1} de {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm disabled:opacity-30 hover:bg-gray-50 transition">Próxima →</button>
          </div>
        )}
      </div>
    </div>
  );
}
