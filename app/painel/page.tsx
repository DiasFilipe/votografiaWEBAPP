import { headers } from "next/headers";
import { getMunicipios, getTotalVotos } from "@/lib/painel/data";
import { getCliente } from "@/lib/clientes/registry";
import StatsBar from "@/components/painel/StatsBar";
import MapHomeClient from "@/components/painel/MapHomeClient";

export default async function PainelPage() {
  const h = await headers();
  const clienteId = h.get("x-cliente-id") ?? "van-hattem";

  const municipios = getMunicipios(clienteId);
  const totalVotos = getTotalVotos(municipios);
  const cliente = getCliente(clienteId);
  const estado = cliente?.estado ?? "RS";
  const geojsonUrl = `/data/${clienteId}-municipios.geojson`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-100">Mapa Eleitoral · {estado} 2022</h1>
        <p className="text-slate-400 mt-1">
          Distribuição de votos por município — base para a estratégia 2026
        </p>
      </div>
      <StatsBar municipios={municipios} totalVotos={totalVotos} estado={estado} />
      <MapHomeClient municipios={municipios} geojsonUrl={geojsonUrl} />
    </div>
  );
}
