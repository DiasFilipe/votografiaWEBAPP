import { readFileSync } from "fs";
import { join } from "path";

export interface ClienteConfig {
  id: string;
  subdominio: string;
  nome: string;
  nomeCompleto: string;
  partido: string;
  estado: string;
  cargo: string;
  cor: string;
  corTexto: string;
  foto: string;
  senha: string;
  modulos: { painel: boolean; sentimento: boolean; mobilizacao: boolean };
}

const DATA_DIR = process.env.DATA_DIR ?? join(process.cwd(), "data");

let _cache: Record<string, ClienteConfig> | null = null;

function load(): Record<string, ClienteConfig> {
  if (_cache) return _cache;
  _cache = JSON.parse(readFileSync(join(DATA_DIR, "clientes.json"), "utf-8"));
  return _cache!;
}

export function getCliente(id: string): ClienteConfig | null {
  return load()[id] ?? null;
}

export function getAllClientes(): ClienteConfig[] {
  return Object.values(load());
}
