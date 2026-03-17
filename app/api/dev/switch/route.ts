import { NextRequest, NextResponse } from "next/server";
import { getAllClientes } from "@/lib/clientes/registry";

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const { clienteId } = await request.json();
  const ids = (await getAllClientes()).map((c) => c.id);

  if (!ids.includes(clienteId)) {
    return NextResponse.json({ error: "cliente inválido" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("dev_cliente_id", clienteId, { path: "/", httpOnly: false });
  return res;
}
