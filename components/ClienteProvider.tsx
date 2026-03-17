"use client";

import { createContext, useContext } from "react";

export interface ClientePublico {
  id: string;
  nome: string;
  partido: string;
  estado: string;
  cargo: string;
  cor: string;
  corTexto: string;
  foto: string;
  modulos: { painel: boolean; sentimento: boolean; mobilizacao: boolean };
}

const ClienteContext = createContext<ClientePublico | null>(null);

export function ClienteProvider({
  config,
  children,
}: {
  config: ClientePublico;
  children: React.ReactNode;
}) {
  return <ClienteContext.Provider value={config}>{children}</ClienteContext.Provider>;
}

export function useCliente(): ClientePublico {
  const ctx = useContext(ClienteContext);
  if (!ctx) throw new Error("useCliente deve ser usado dentro de ClienteProvider");
  return ctx;
}
