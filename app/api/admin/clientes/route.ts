import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getAllClientes } from "@/lib/clientes/registry";

export async function GET() {
  const clienteId = (await headers()).get("x-cliente-id");
  if (clienteId !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const lista = (await getAllClientes()).map(({ id, nome, partido, estado, cor, corTexto, subdominio }) => ({
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
