import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAllClientes } from "@/lib/clientes/registry";
import { getMunicipios, getTotalVotos } from "@/lib/painel/data";

export default async function AdminPage() {
  const h = await headers();
  const clienteId = h.get("x-cliente-id");
  if (clienteId !== "admin") redirect("/painel");

  const clientes = getAllClientes();

  const stats = clientes.map((c) => {
    try {
      const municipios = getMunicipios(c.id);
      const totalVotos = getTotalVotos(municipios);
      return { ...c, municipios: municipios.length, totalVotos };
    } catch {
      return { ...c, municipios: 0, totalVotos: 0 };
    }
  });

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-100">Painel Admin</h1>
        <p className="text-slate-400 mt-1">Visão geral de todos os clientes ativos</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((c) => (
          <div key={c.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0"
                style={{ backgroundColor: c.cor, color: c.corTexto }}
              >
                {c.nome.charAt(0)}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{c.nomeCompleto}</p>
                <p className="text-gray-400 text-xs">{c.cargo} · {c.partido}/{c.estado}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900/60 rounded-xl p-3">
                <div className="text-xl font-black" style={{ color: c.cor }}>
                  {c.totalVotos.toLocaleString("pt-BR")}
                </div>
                <div className="text-gray-500 text-xs">votos 2022</div>
              </div>
              <div className="bg-gray-900/60 rounded-xl p-3">
                <div className="text-xl font-black text-white">{c.municipios}</div>
                <div className="text-gray-500 text-xs">municípios</div>
              </div>
            </div>

            {/* Módulos */}
            <div className="flex gap-2 flex-wrap">
              {c.modulos.painel && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">Painel</span>}
              {c.modulos.sentimento && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">Sentimento</span>}
              {c.modulos.mobilizacao && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">Mobilização</span>}
            </div>

            {/* Subdomain link */}
            <p className="text-gray-600 text-xs font-mono">
              {c.subdominio}.votografia.com.br
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
