import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ClienteProvider, type ClientePublico } from "@/components/ClienteProvider";
import { getCliente } from "@/lib/clientes/registry";

const ADMIN_CONFIG: ClientePublico = {
  id: "admin",
  nome: "Admin",
  partido: "",
  estado: "",
  cargo: "Administrador",
  cor: "#111827",
  corTexto: "#ffffff",
  foto: "/foto.jpg",
  modulos: { painel: true, sentimento: true, mobilizacao: true },
};

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const clienteId = h.get("x-cliente-id") ?? "van-hattem";
  const c = clienteId === "admin" ? null : getCliente(clienteId);
  const nome = c?.nomeCompleto ?? "Votografia";
  return {
    title: `Votografia · ${nome}`,
    description: `Painel de inteligência política — ${nome}`,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const clienteId = h.get("x-cliente-id") ?? "van-hattem";

  let config: ClientePublico;
  if (clienteId === "admin") {
    config = ADMIN_CONFIG;
  } else {
    const c = getCliente(clienteId);
    config = c
      ? {
          id: c.id,
          nome: c.nome,
          partido: c.partido,
          estado: c.estado,
          cargo: c.cargo,
          cor: c.cor,
          corTexto: c.corTexto,
          foto: c.foto,
          modulos: c.modulos,
        }
      : ADMIN_CONFIG;
  }

  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <ClienteProvider config={config}>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </ClienteProvider>
      </body>
    </html>
  );
}
