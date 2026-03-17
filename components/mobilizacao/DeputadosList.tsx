"use client";

import { useState, useMemo } from "react";

interface Deputado {
  id: number;
  nome: string;
  partido: string;
  uf: string;
  twitter?: string;
  assinou: boolean;
}

const UF_NOMES: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AM: "Amazonas", AP: "Amapá", BA: "Bahia",
  CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás",
  MA: "Maranhão", MG: "Minas Gerais", MS: "Mato Grosso do Sul",
  MT: "Mato Grosso", PA: "Pará", PB: "Paraíba", PE: "Pernambuco",
  PI: "Piauí", PR: "Paraná", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RO: "Rondônia", RR: "Roraima", RS: "Rio Grande do Sul",
  SC: "Santa Catarina", SE: "Sergipe", SP: "São Paulo", TO: "Tocantins",
};

const ALL_UFS = Object.keys(UF_NOMES).sort();

const MSG_TEMPLATE = (nome: string) =>
  `Olá, deputado(a) ${nome}! Como cidadão brasileiro, peço que assine o requerimento de abertura da CPI do STF. O Supremo Tribunal Federal precisa prestar contas ao povo. Por favor, use seu mandato para defender a transparência e o equilíbrio entre os Poderes! #CPIdoSTF`;

function DeputadoCard({ dep }: { dep: Deputado }) {
  const twitterUrl = dep.twitter ? `https://x.com/${dep.twitter}` : null;
  const whatsappMsg = encodeURIComponent(MSG_TEMPLATE(dep.nome));

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 transition-all ${dep.assinou ? "bg-green-950/40 border-green-800" : "bg-gray-900/60 border-gray-700 hover:border-gray-500"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm leading-tight truncate">{dep.nome}</p>
          <p className="text-gray-400 text-xs mt-0.5">{dep.partido} · {dep.uf}</p>
        </div>
        {dep.assinou ? (
          <span className="shrink-0 bg-green-700 text-green-100 text-xs font-bold px-2 py-1 rounded-full">✓ ASSINOU</span>
        ) : (
          <span className="shrink-0 bg-red-900/50 text-red-300 text-xs font-bold px-2 py-1 rounded-full">PENDENTE</span>
        )}
      </div>
      {!dep.assinou && (
        <div className="flex gap-2">
          {twitterUrl && (
            <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors text-center">
              𝕏 Contatar
            </a>
          )}
          <a href={`https://wa.me/?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-700 hover:bg-green-600 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors text-center">
            📱 WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}

export default function DeputadosList({ deputados }: { deputados: Deputado[] }) {
  const [selectedUf, setSelectedUf] = useState("RS");
  const [filter, setFilter] = useState<"todos" | "assinou" | "pendente">("todos");

  const filtered = useMemo(() => {
    return deputados
      .filter((d) => d.uf === selectedUf)
      .filter((d) => {
        if (filter === "assinou") return d.assinou;
        if (filter === "pendente") return !d.assinou;
        return true;
      });
  }, [deputados, selectedUf, filter]);

  const ufDeputados = deputados.filter((d) => d.uf === selectedUf);
  const assinaram = ufDeputados.filter((d) => d.assinou).length;
  const total = ufDeputados.length;
  const ufsDisponiveis = ALL_UFS.filter((uf) => deputados.some((d) => d.uf === uf));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <label className="block text-sm text-gray-400 mb-1">Selecione seu estado</label>
          <select value={selectedUf} onChange={(e) => setSelectedUf(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors w-full sm:w-64">
            {ufsDisponiveis.map((uf) => <option key={uf} value={uf}>{UF_NOMES[uf]} ({uf})</option>)}
          </select>
        </div>
        {total > 0 && (
          <div className="flex gap-3">
            <div className="bg-green-900/30 border border-green-800 rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-black text-green-400">{assinaram}</div>
              <div className="text-xs text-gray-400">Assinaram</div>
            </div>
            <div className="bg-red-900/20 border border-red-800/50 rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-black text-red-400">{total - assinaram}</div>
              <div className="text-xs text-gray-400">Pendentes</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {(["todos", "assinou", "pendente"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            {f === "todos" ? "Todos" : f === "assinou" ? "Assinaram" : "Pressionar"}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((dep) => <DeputadoCard key={dep.id} dep={dep} />)}
          </div>
          {filter === "pendente" && filtered.length > 0 && (
            <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 text-sm text-blue-300">
              💡 <strong>Dica:</strong> Use o botão WhatsApp para enviar uma mensagem pronta ao deputado pedindo que assine o requerimento.
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {total === 0 ? "Nenhum deputado cadastrado para este estado ainda." : "Nenhum resultado para este filtro."}
        </div>
      )}
    </div>
  );
}
