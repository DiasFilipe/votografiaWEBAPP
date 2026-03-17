import { NextResponse } from "next/server";
import { getAllClientes } from "@/lib/clientes/registry";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const lista = (await getAllClientes()).map(({ id, nome, partido, estado, cor, corTexto }) => ({
    id,
    nome,
    partido,
    estado,
    cor,
    corTexto,
  }));

  return NextResponse.json(lista);
}
