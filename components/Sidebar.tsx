"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useCliente } from "@/components/ClienteProvider";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  enabled: boolean;
};

type ClienteItem = {
  id: string;
  nome: string;
  partido: string;
  estado: string;
  cor: string;
  corTexto: string;
  subdominio: string;
};

function IconPainel() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function IconSentimento() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconMobilizacao() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconAdmin() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  );
}

function getClienteUrl(subdominio: string): string {
  const host = window.location.host;
  const isDev = host.startsWith("localhost") || host.startsWith("127.");
  if (isDev) return window.location.origin;
  const baseDomain = host.split(".").slice(1).join(".");
  return `https://${subdominio}.${baseDomain}`;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { id, nome, partido, estado, cargo, cor, foto, modulos } = useCliente();
  const isAdmin = id === "admin";
  const isDev = process.env.NODE_ENV === "development";

  const [clientes, setClientes] = useState<ClienteItem[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Carrega lista de clientes para admin (prod) ou dev switcher
  useEffect(() => {
    if (isAdmin) {
      fetch("/api/admin/clientes")
        .then((r) => r.ok ? r.json() : [])
        .then(setClientes)
        .catch(() => {});
    } else if (isDev) {
      fetch("/api/dev/clientes")
        .then((r) => r.ok ? r.json() : [])
        .then(setClientes)
        .catch(() => {});
    }
  }, [isAdmin, isDev]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function switchCliente(cliente: ClienteItem) {
    setDropdownOpen(false);
    if (isDev && !isAdmin) {
      await fetch("/api/dev/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId: cliente.id }),
      });
      window.location.reload();
    } else {
      // Admin em prod: navega para o subdomínio do cliente (sessão admin é aceita lá)
      window.location.assign(getClienteUrl(cliente.subdominio));
    }
  }

  const showSwitcher = isAdmin || isDev;

  const navItems: NavItem[] = isAdmin
    ? [{ href: "/admin", label: "Painel Admin", icon: <IconAdmin />, enabled: true }]
    : [
        { href: "/painel",      label: "Painel Eleitoral",      icon: <IconPainel />,      enabled: modulos.painel },
        { href: "/sentimento",  label: "Monitor de Sentimento", icon: <IconSentimento />,  enabled: modulos.sentimento },
        { href: "/mobilizacao", label: "Mobilização",           icon: <IconMobilizacao />, enabled: modulos.mobilizacao },
      ];

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-900 border-r border-gray-800">
      {/* Header do cliente */}
      <div className="flex flex-col items-center gap-3 px-5 py-6 border-b border-gray-800">
        <div className="relative" ref={dropdownRef}>
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-black overflow-hidden flex-shrink-0 ${showSwitcher ? "cursor-pointer ring-2 ring-transparent hover:ring-gray-600 transition-all" : ""}`}
            style={{ backgroundColor: cor, color: isAdmin ? "#fff" : "#000" }}
            onClick={() => showSwitcher && setDropdownOpen((o) => !o)}
            title={showSwitcher ? "Trocar cliente" : undefined}
          >
            {foto !== "/foto.jpg" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={foto} alt={nome} className="w-full h-full object-cover" />
            ) : (
              nome.charAt(0).toUpperCase()
            )}
          </div>

          {/* Dropdown de clientes */}
          {dropdownOpen && clientes.length > 0 && (
            <div className="absolute left-1/2 -translate-x-1/2 top-16 z-50 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl min-w-[200px] py-1 overflow-hidden">
              <p className="px-3 py-2 text-xs text-gray-500 font-medium uppercase tracking-wider border-b border-gray-700">
                {isAdmin ? "Acessar cliente" : "Trocar candidato"}
              </p>
              {clientes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => switchCliente(c)}
                  className="w-full text-left flex items-center gap-3 px-3 py-2.5 hover:bg-gray-700 transition-colors"
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: c.cor, color: c.corTexto }}
                  >
                    {c.nome.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{c.nome}</p>
                    <p className="text-gray-500 text-xs">{c.partido}/{c.estado}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-white font-bold text-sm leading-tight">{nome}</p>
          {!isAdmin && (
            <p className="text-gray-500 text-xs mt-0.5">{cargo} · {partido}/{estado}</p>
          )}
          {isAdmin && <p className="text-gray-500 text-xs mt-0.5">Administrador</p>}
          {isDev && !isAdmin && (
            <span className="inline-block mt-1 px-1.5 py-0.5 text-xs font-bold bg-yellow-400 text-black rounded">DEV</span>
          )}
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          if (!item.enabled) return null;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
              style={isActive ? { backgroundColor: cor + "25", color: cor } : {}}
            >
              <span style={isActive ? { color: cor } : {}}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      {process.env.NODE_ENV !== "development" && (
        <div className="px-3 pb-3">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sair
            </button>
          </form>
        </div>
      )}

      {/* Rodapé */}
      <div className="px-5 py-4 border-t border-gray-800">
        <p className="text-gray-600 text-xs text-center tracking-wide">Votografia · Inteligência Política</p>
      </div>
    </aside>
  );
}
