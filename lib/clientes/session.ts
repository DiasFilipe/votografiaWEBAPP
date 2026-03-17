// Utilitários de sessão — Node.js runtime (apenas em API routes)
import { createHmac } from "crypto";

const SECRET = process.env.SESSION_SECRET ?? "dev-secret-please-change-in-prod!";
export const SESSION_COOKIE = "vtg_sess";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 dias em segundos

export function createToken(clienteId: string): string {
  const ts = Date.now().toString();
  const payload = `${encodeURIComponent(clienteId)}.${ts}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}
