/**
 * Server-only auth helpers — Node.js runtime (server components + API routes).
 * Replaces the old middleware.ts approach.
 */
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac } from "crypto";
import { SUBDOMAIN_TO_CLIENTE } from "./clientes/subdomains";

export const SESSION_COOKIE = "vtg_sess";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 dias em segundos

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET missing (required in production)");
  }
  return "dev-secret-please-change-in-prod!";
}

export function createToken(clienteId: string): string {
  const ts = Date.now().toString();
  const payload = `${encodeURIComponent(clienteId)}.${ts}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifyToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const payload = `${parts[0]}.${parts[1]}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  if (sig !== parts[2]) return null;
  const ts = parseInt(parts[1], 10);
  if (isNaN(ts) || Date.now() - ts > SESSION_MAX_AGE * 1000) return null;
  return decodeURIComponent(parts[0]);
}

function resolveClienteFromHost(host: string): string {
  if (
    process.env.NODE_ENV === "development" ||
    host.startsWith("localhost") ||
    host.startsWith("127.")
  ) {
    return process.env.DEV_CLIENTE_ID ?? "van-hattem";
  }
  if (host.includes("railway.app")) {
    return process.env.DEFAULT_CLIENTE_ID ?? "van-hattem";
  }
  const sub = host.split(".")[0];
  if (sub === "admin") return "admin";
  return SUBDOMAIN_TO_CLIENTE[sub] ?? "van-hattem";
}

/**
 * Retorna o clienteId a partir do cookie de sessão (ou fallback por host).
 * NÃO redireciona — seguro para uso em layouts e páginas públicas.
 */
export async function getClienteId(): Promise<string> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const id = verifyToken(token);
    if (id) return id;
  }
  // Dev: dev switcher usa dev_cliente_id cookie
  if (process.env.NODE_ENV === "development") {
    const devId = jar.get("dev_cliente_id")?.value;
    if (devId) return devId;
  }
  const h = await headers();
  return resolveClienteFromHost(h.get("host") ?? "");
}

/**
 * Retorna o clienteId se autenticado. Redireciona para /login se não.
 * Em desenvolvimento, bypassa a autenticação.
 */
export async function requireAuth(): Promise<string> {
  const jar = await cookies();

  // Em dev, bypassa auth mas ainda respeita o dev_cliente_id cookie
  if (process.env.NODE_ENV === "development") {
    const devId = jar.get("dev_cliente_id")?.value;
    if (devId) return devId;
    const h = await headers();
    return resolveClienteFromHost(h.get("host") ?? "");
  }

  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const id = verifyToken(token);
    if (id) return id;
  }
  redirect("/login");
}
