import { NextResponse } from "next/server";
import { getCount } from "@/lib/mobilizacao/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ count: getCount() });
}
