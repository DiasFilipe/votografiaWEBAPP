import { requireAuth } from "@/lib/auth";
import { getMunicipios } from "@/lib/painel/data";
import RankingClient from "@/components/painel/RankingClient";

export const metadata = { title: "Ranking de Municípios · Painel Eleitoral" };

export default async function RankingPage() {
  const clienteId = await requireAuth();
  const municipios = getMunicipios(clienteId);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-100">Ranking de Municípios</h1>
        <p className="text-slate-400 mt-1">
          {municipios.length} municípios ordenados por performance eleitoral em 2022
        </p>
      </div>
      <RankingClient municipios={municipios} />
    </div>
  );
}
