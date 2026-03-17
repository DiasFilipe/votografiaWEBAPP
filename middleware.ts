import { NextRequest, NextResponse } from "next/server";
import { SUBDOMAIN_TO_CLIENTE } from "@/lib/clientes/subdomains";

const SECRET = process.env.SESSION_SECRET ?? "dev-secret-please-change-in-prod!";
const COOKIE = "vtg_sess";

// Verifica token usando Web Crypto API (Edge runtime)
async function verifyToken(token: string): Promise<string | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [encId, ts, b64sig] = parts;
    const payload = `${encId}.${ts}`;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const sigBytes = Uint8Array.from(
      atob(b64sig.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(payload));
    if (!valid) return null;
    if (Date.now() - parseInt(ts) > 7 * 24 * 60 * 60 * 1000) return null;

    return decodeURIComponent(encId);
  } catch {
    return null;
  }
}

function resolveClienteId(host: string): string | null {
  // Desenvolvimento local — usa DEV_CLIENTE_ID ou padrão
  if (host.startsWith("localhost") || host.startsWith("127.")) {
    return process.env.DEV_CLIENTE_ID ?? "van-hattem";
  }
  // Domínio Railway (staging/teste) — usa DEFAULT_CLIENTE_ID ou van-hattem
  if (host.includes("railway.app")) {
    return process.env.DEFAULT_CLIENTE_ID ?? "van-hattem";
  }
  const sub = host.split(".")[0];
  if (sub === "admin") return "admin";
  return SUBDOMAIN_TO_CLIENTE[sub] ?? null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  // Caminhos públicos — sem autenticação
  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/data/") ||
    pathname === "/favicon.ico";

  const expectedClienteId = resolveClienteId(host);

  // Subdomínio desconhecido
  if (!expectedClienteId) {
    return NextResponse.redirect(new URL("https://www.votografia.com.br", request.url));
  }

  // Passa x-cliente-id para server components via request headers
  const forward = (clienteId: string) => {
    const reqHeaders = new Headers(request.headers);
    reqHeaders.set("x-cliente-id", clienteId);
    return NextResponse.next({ request: { headers: reqHeaders } });
  };

  if (isPublic) return forward(expectedClienteId);

  // Dev: bypass de autenticação + suporte ao switcher de cliente via cookie
  if (process.env.NODE_ENV === "development") {
    const devOverride = request.cookies.get("dev_cliente_id")?.value;
    return forward(devOverride ?? expectedClienteId);
  }

  // Produção: verifica sessão
  const token = request.cookies.get(COOKIE)?.value;
  const sessionClienteId = token ? await verifyToken(token) : null;

  if (!sessionClienteId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin pode acessar qualquer subdomínio
  if (sessionClienteId === "admin") {
    return forward(expectedClienteId === "admin" ? "admin" : expectedClienteId);
  }

  // Sessão do cliente deve corresponder ao subdomínio acessado
  if (sessionClienteId !== expectedClienteId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return forward(sessionClienteId);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
