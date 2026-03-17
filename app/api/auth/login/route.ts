import { NextRequest, NextResponse } from "next/server";
import { getCliente } from "@/lib/clientes/registry";
import { createToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/clientes/session";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin-mude-em-producao";

export async function POST(req: NextRequest) {
  const { clienteId, senha } = await req.json().catch(() => ({}));

  if (!clienteId || !senha) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  let authorized = false;

  if (clienteId === "admin") {
    authorized = senha === ADMIN_PASSWORD;
  } else {
    const cliente = getCliente(clienteId);
    authorized = !!cliente && cliente.senha === senha;
  }

  if (!authorized) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const token = createToken(clienteId);
  const res = NextResponse.json({ ok: true });

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return res;
}
