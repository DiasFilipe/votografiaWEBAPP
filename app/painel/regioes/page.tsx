import { headers } from "next/headers";
import Link from "next/link";
import { getMunicipios, getTotalVotos, getPotencial } from "@/lib/painel/data";

export const metadata = { title: "Regiões · Painel Eleitoral" };

export default async function RegioesPage() {
  const h = await headers();
  const clienteId = h.get("x-cliente-id") ?? "van-hattem";
  const municipios = getMunicipios(clienteId);
  const totalVotos = getTotalVotos(municipios);

  const grupos: Record<string, typeof municipios> = {};
  municipios.forEach((m) => {
    const r = m.regiao ?? "Interior";
    if (!grupos[r]) grupos[r] = [];
    grupos[r].push(m);
  });

  const regioes = Object.entries(grupos)
    .map(([nome, lista]) => {
      const votos = lista.reduce((a, m) => a + m.votos, 0);
      const total = lista.reduce((a, m) => a + m.total_dep_fed, 0);
      const pct = total > 0 ? (votos / total) * 100 : 0;
      const altos = lista.filter((m) => getPotencial(m) === "alto").length;
      return { nome, lista, votos, total, pct, altos };
    })
    .sort((a, b) => b.votos - a.votos);

  const maxVotos = regioes[0]?.votos ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Análise por Região</h1>
        <p className="text-gray-500 mt-1 text-sm">Performance consolidada por macrorregião</p>
      </div>

      <div className="grid gap-4">
        {regioes.map((r) => (
          <div key={r.nome} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{r.nome}</h2>
                <p className="text-gray-400 text-sm mt-0.5">{r.lista.length} municípios · {r.altos} com alto potencial 2026</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-amber-600">{r.pct.toFixed(1)}%</div>
                <div className="text-xs text-gray-400">do eleitorado regional</div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-full h-2 mb-4">
              <div className="h-2 rounded-full" style={{ width: `${(r.votos / maxVotos) * 100}%`, background: "linear-gradient(90deg,#f59e0b,#d97706)" }} />
            </div>
            <div className="flex flex-wrap gap-6 text-sm mb-4">
              <div><span className="text-gray-400">Votos totais: </span><span className="font-semibold text-gray-800">{r.votos.toLocaleString("pt-BR")}</span></div>
              <div><span className="text-gray-400">% do total: </span><span className="font-semibold text-gray-800">{((r.votos / totalVotos) * 100).toFixed(1)}%</span></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {r.lista.slice(0, 6).map((m) => (
                <Link key={m.slug} href={`/painel/municipio/${m.slug}`} className="text-xs bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-200 text-gray-600 hover:text-amber-700 px-2.5 py-1 rounded-lg transition">
                  {m.municipio} <span className="text-amber-600 font-semibold">{m.pct.toFixed(1)}%</span>
                </Link>
              ))}
              {r.lista.length > 6 && <span className="text-xs text-gray-400 self-center">+{r.lista.length - 6} municípios</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
