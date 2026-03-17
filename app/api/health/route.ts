import { NextResponse } from "next/server";
import { existsSync } from "fs";
import { join } from "path";
import { getPool } from "@/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const cwd = process.cwd();
  const clientesPath = join(cwd, "data", "clientes.json");
  const clientesExists = existsSync(clientesPath);

  let dbOk = false;
  let dbError = null;
  try {
    const pool = getPool();
    await pool.query("SELECT 1");
    dbOk = true;
  } catch (err) {
    dbError = String(err);
  }

  let clientesData = null;
  if (clientesExists) {
    try {
      const { readFileSync } = await import("fs");
      const raw = readFileSync(clientesPath, "utf-8");
      clientesData = Object.keys(JSON.parse(raw));
    } catch (err) {
      clientesData = `ERRO: ${err}`;
    }
  }

  return NextResponse.json({
    ok: clientesExists && dbOk,
    cwd,
    clientesPath,
    clientesExists,
    clientesData,
    db: dbOk ? "ok" : dbError,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? "set" : "missing",
      SESSION_SECRET: process.env.SESSION_SECRET ? "set" : "missing (usando padrão)",
    },
  });
}
