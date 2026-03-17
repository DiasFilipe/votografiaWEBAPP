import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ClienteProvider, type ClientePublico } from "@/components/ClienteProvider";
import { getCliente } from "@/lib/clientes/registry";
import { getClienteId } from "@/lib/auth";

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
  const clienteId = await getClienteId();
  const c = clienteId === "admin" ? null : getCliente(clienteId);
  const nome = c?.nomeCompleto ?? "Votografia";
  return {
    title: `Votografia · ${nome}`,
    description: `Painel de inteligência política — ${nome}`,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const clienteId = await getClienteId();

  console.log(`[layout] clienteId=${clienteId} NODE_ENV=${process.env.NODE_ENV}`);

  let config: ClientePublico;
  if (clienteId === "admin") {
    config = ADMIN_CONFIG;
  } else {
    let c;
    try {
      c = getCliente(clienteId);
    } catch (err) {
      console.error(`[layout] getCliente(${clienteId}) ERRO:`, err);
      c = null;
    }
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
