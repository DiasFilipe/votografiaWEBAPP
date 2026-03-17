import { type MunicipioData } from "@/lib/painel/utils";

interface Props {
  municipios: MunicipioData[];
  totalVotos: number;
  estado: string;
}

export default function StatsBar({ municipios, totalVotos, estado }: Props) {
  const fortalezas = municipios.filter((m) => m.pct >= 10).length;
  const crescimento = municipios.filter((m) => m.pct >= 3 && m.pct < 10).length;
  const fracos = municipios.filter((m) => m.pct < 3).length;
  const topMun = [...municipios].sort((a, b) => b.pct - a.pct)[0];

  const stats = [
    { label: "Total de votos",        value: totalVotos.toLocaleString("pt-BR"), sub: "Deputado Federal 2022" },
    { label: "Municípios alcançados", value: municipios.length.toString(),        sub: `estado do ${estado}` },
    { label: "Fortalezas (>10%)",     value: fortalezas.toString(),               sub: "municípios dominantes" },
    { label: "Zona de crescimento",   value: crescimento.toString(),              sub: "3–10% do eleitorado" },
    { label: "Baixa penetração",      value: fracos.toString(),                   sub: "municípios (<3%)" },
    { label: "Maior % eleitoral",     value: topMun ? `${topMun.pct.toFixed(1)}%` : "—", sub: topMun?.municipio ?? "" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-black text-amber-600">{s.value}</div>
          <div className="text-xs text-gray-500 mt-1 leading-tight">{s.label}</div>
          <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}
