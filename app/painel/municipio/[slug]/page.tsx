import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMunicipios, getBySlug, getPotencial, getZona, getColor, getTotalVotos } from "@/lib/painel/data";
import ShareButton from "@/components/painel/ShareButton";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ slug: string }>; }

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-3xl font-black text-amber-600">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

export default async function MunicipioPage({ params }: Props) {
  const { slug } = await params;
  const h = await headers();
  const clienteId = h.get("x-cliente-id") ?? "van-hattem";

  const municipios = getMunicipios(clienteId);
  const bySlug = getBySlug(municipios);
  const totalVotos = getTotalVotos(municipios);

  const m = bySlug[slug];
  if (!m) notFound();

  const zona = getZona(m.pct);
  const pot = getPotencial(m);
  const rankByVotos = municipios.findIndex((x) => x.slug === slug) + 1;
  const rankByPct = [...municipios].sort((a, b) => b.pct - a.pct).findIndex((x) => x.slug === slug) + 1;
  const shareOfTotal = ((m.votos / totalVotos) * 100).toFixed(2);
  const similares = municipios.filter((x) => x.slug !== slug && getZona(x.pct) === zona).slice(0, 5);

  const ZONA_INFO = {
    fortaleza:   { label: "Fortaleza",       cls: "bg-amber-100 text-amber-700",  desc: "Município dominante — base eleitoral sólida." },
    crescimento: { label: "Crescimento",      cls: "bg-blue-100 text-blue-700",    desc: "Zona de crescimento — potencial de ganho expressivo." },
    fraco:       { label: "Baixa penetração", cls: "bg-gray-100 text-gray-600",    desc: "Presença ainda baixa — oportunidade de expansão." },
  };
  const POT_INFO = {
    alto:  { label: "Alto potencial para 2026",  cls: "bg-emerald-100 text-emerald-700" },
    medio: { label: "Médio potencial para 2026", cls: "bg-yellow-100 text-yellow-700" },
    baixo: { label: "Baixo potencial para 2026", cls: "bg-gray-100 text-gray-600" },
  };

  const zonaInfo = ZONA_INFO[zona];
  const potInfo = POT_INFO[pot];
  const barWidth = Math.min(100, (m.pct / 50) * 100);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/painel" className="hover:text-gray-700 transition">Mapa</Link>
        <span>/</span>
        <Link href="/painel/ranking" className="hover:text-gray-700 transition">Ranking</Link>
        <span>/</span>
        <span className="text-gray-700">{m.municipio}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900">{m.municipio}</h1>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${zonaInfo.cls}`}>{zonaInfo.label}</span>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${potInfo.cls}`}>{potInfo.label}</span>
          </div>
          <p className="text-gray-500 mt-3 max-w-lg text-sm">{zonaInfo.desc}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center min-w-[140px] shadow-sm">
          <div className="text-6xl font-black text-amber-600 leading-none">{m.pct.toFixed(1)}%</div>
          <div className="text-xs text-gray-400 mt-2">do eleitorado<br/>dep. federal</div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>% do eleitorado em dep. federal</span>
          <span>{m.pct.toFixed(2)}%</span>
        </div>
        <div className="bg-gray-100 rounded-full h-3">
          <div className="h-3 rounded-full" style={{ width: `${barWidth}%`, background: getColor(m.pct) }} />
        </div>
        <div className="flex justify-between text-xs text-gray-300 mt-1"><span>0%</span><span>50%</span></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Votos 2022" value={m.votos.toLocaleString("pt-BR")} sub="votos nominais" />
        <StatBox label="Total dep. federal" value={m.total_dep_fed.toLocaleString("pt-BR")} sub="todos os candidatos" />
        <StatBox label="Rank — votos" value={`#${rankByVotos}`} sub={`de ${municipios.length} municípios`} />
        <StatBox label="Rank — % eleitoral" value={`#${rankByPct}`} sub={`de ${municipios.length} municípios`} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-4">Contexto estratégico</h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Votos como % do total</span>
              <span className="font-semibold text-gray-800">{shareOfTotal}%</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Votos restantes no município</span>
              <span className="font-semibold text-gray-800">{(m.total_dep_fed - m.votos).toLocaleString("pt-BR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Código TSE</span>
              <span className="font-mono text-gray-600">{m.cod_tse}</span>
            </div>
          </div>
          <div>
            {pot === "alto" && <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-800 text-sm"><strong className="block mb-1">Alta prioridade para 2026</strong>Grande eleitorado com baixa penetração.</div>}
            {pot === "medio" && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm"><strong className="block mb-1">Potencial moderado</strong>Base razoável. Manutenção e ativação da base.</div>}
            {pot === "baixo" && <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-600 text-sm"><strong className="block mb-1">Prioridade menor</strong>Menor retorno marginal de campanha.</div>}
          </div>
        </div>
      </div>

      {similares.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-900 mb-4">Municípios similares</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {similares.map((s) => (
              <Link key={s.slug} href={`/painel/municipio/${s.slug}`} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-amber-300 hover:shadow-sm transition group">
                <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate">{s.municipio}</div>
                <div className="text-lg font-black text-amber-600 mt-1">{s.pct.toFixed(1)}%</div>
                <div className="text-xs text-gray-400">{s.votos.toLocaleString("pt-BR")} votos</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <p className="text-gray-600 text-sm mb-3">Compartilhe esta análise com o coordenador regional de <strong className="text-gray-900">{m.municipio}</strong></p>
        <ShareButton municipio={m.municipio} />
      </div>
    </div>
  );
}
