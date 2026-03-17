import { NextRequest, NextResponse } from "next/server";

// Middleware mínimo para debug — sem lógica, só passa
export function middleware(request: NextRequest) {
  console.log("[middleware-debug] request:", request.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
