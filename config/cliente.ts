// Configuração do cliente ativo — lida por variáveis de ambiente.
// Cada político tem seu próprio .env.local na pasta clientes/<nome>/.env.local
// Para rodar localmente: copie o .env.local do cliente para webapp/.env.local

export type Modulos = {
  painel: boolean;
  sentimento: boolean;
  mobilizacao: boolean;
};

export type ClienteConfig = {
  id: string;
  nome: string;
  nomeCompleto: string;
  partido: string;
  estado: string;
  cargo: string;
  cor: string;          // hex — cor primária do cliente (usado em acentos e sidebar)
  corTexto: string;     // hex — texto sobre a cor primária (branco ou preto)
  foto: string;         // path relativo a /public
  modulos: Modulos;
};

// Servidor: lê process.env diretamente
export function getClienteConfig(): ClienteConfig {
  return {
    id:          process.env.CLIENTE_ID          || "van-hattem",
    nome:        process.env.CLIENTE_NOME        || "Van Hattem",
    nomeCompleto:process.env.CLIENTE_NOME_COMPLETO || "Marcel van Hattem",
    partido:     process.env.CLIENTE_PARTIDO     || "Novo",
    estado:      process.env.CLIENTE_ESTADO      || "RS",
    cargo:       process.env.CLIENTE_CARGO       || "Deputado Federal",
    cor:         process.env.CLIENTE_COR         || "#f59e0b",
    corTexto:    process.env.CLIENTE_COR_TEXTO   || "#000000",
    foto:        process.env.CLIENTE_FOTO        || "/foto.jpg",
    modulos: {
      painel:      process.env.MODULO_PAINEL      !== "false",
      sentimento:  process.env.MODULO_SENTIMENTO  !== "false",
      mobilizacao: process.env.MODULO_MOBILIZACAO !== "false",
    },
  };
}

// Cliente (browser): apenas variáveis NEXT_PUBLIC_*
// Estas são injetadas em build-time — necessário ter no .env.local
export const clientePublico = {
  nome:     process.env.NEXT_PUBLIC_CLIENTE_NOME     || "Van Hattem",
  partido:  process.env.NEXT_PUBLIC_CLIENTE_PARTIDO  || "Novo",
  estado:   process.env.NEXT_PUBLIC_CLIENTE_ESTADO   || "RS",
  cargo:    process.env.NEXT_PUBLIC_CLIENTE_CARGO    || "Deputado Federal",
  cor:      process.env.NEXT_PUBLIC_CLIENTE_COR      || "#f59e0b",
  corTexto: process.env.NEXT_PUBLIC_CLIENTE_COR_TEXTO || "#000000",
  foto:     process.env.NEXT_PUBLIC_CLIENTE_FOTO     || "/foto.jpg",
  modulos: {
    painel:      process.env.NEXT_PUBLIC_MODULO_PAINEL      !== "false",
    sentimento:  process.env.NEXT_PUBLIC_MODULO_SENTIMENTO  !== "false",
    mobilizacao: process.env.NEXT_PUBLIC_MODULO_MOBILIZACAO !== "false",
  },
};
