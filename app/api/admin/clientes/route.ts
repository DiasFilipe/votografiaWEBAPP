import { NextResponse } from "next/server";
import { getClienteId } from "@/lib/auth";
import { getAllClientes } from "@/lib/clientes/registry";

export async function GET() {
  const clienteId = await getClienteId();
  if (clienteId !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const lista = getAllClientes().map(({ id, nome, partido, estado, cor, corTexto, subdominio }) => ({
    id,
    nome,
    partido,
    estado,
    cor,
    corTexto,
    subdominio,
  }));

  return NextResponse.json(lista);
}
