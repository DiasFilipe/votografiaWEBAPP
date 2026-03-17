import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/clientes/session";

export async function POST() {
  const res = NextResponse.redirect("/login");
  res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
