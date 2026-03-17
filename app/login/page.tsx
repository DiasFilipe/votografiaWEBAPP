import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SUBDOMAIN_TO_CLIENTE } from "@/lib/clientes/subdomains";
import { getCliente } from "@/lib/clientes/registry";
import LoginForm from "./LoginForm";

function resolveClienteId(host: string): string {
  if (host.startsWith("localhost") || host.startsWith("127.")) {
    return process.env.DEV_CLIENTE_ID ?? "van-hattem";
  }
  const sub = host.split(".")[0];
  if (sub === "admin") return "admin";
  return SUBDOMAIN_TO_CLIENTE[sub] ?? "van-hattem";
}

export default async function LoginPage() {
  // Dev: bypass de login
  if (process.env.NODE_ENV === "development") redirect("/");

  const h = await headers();
  const host = h.get("host") ?? "";
  const clienteId = resolveClienteId(host);

  const cliente =
    clienteId === "admin"
      ? { nome: "Admin · Votografia", cor: "#111827", corTexto: "#ffffff" }
      : (() => {
          const c = getCliente(clienteId);
          return c
            ? { nome: c.nomeCompleto, cor: c.cor, corTexto: c.corTexto }
            : { nome: "Votografia", cor: "#f59e0b", corTexto: "#000000" };
        })();

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / identidade */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black mb-4"
            style={{ backgroundColor: cliente.cor, color: cliente.corTexto }}
          >
            {cliente.nome.charAt(0)}
          </div>
          <h1 className="text-white text-xl font-bold text-center">{cliente.nome}</h1>
          <p className="text-gray-500 text-sm mt-1">Votografia · Inteligência Política</p>
        </div>

        <LoginForm clienteId={clienteId} cor={cliente.cor} />

        <p className="text-gray-700 text-xs text-center mt-6">
          Acesso restrito · © {new Date().getFullYear()} Votografia
        </p>
      </div>
    </div>
  );
}
