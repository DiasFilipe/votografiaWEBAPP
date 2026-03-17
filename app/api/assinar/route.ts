import { NextRequest, NextResponse } from "next/server";
import { incrementCount } from "@/lib/mobilizacao/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, uf } = body as { nome?: string; uf?: string };

    if (!nome || nome.trim().length < 2) {
      return NextResponse.json({ error: "Nome inválido" }, { status: 400 });
    }
    if (!uf || uf.length !== 2) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const newCount = incrementCount();
    return NextResponse.json({ success: true, count: newCount });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
