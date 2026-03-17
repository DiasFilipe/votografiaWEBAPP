import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";

export default async function Home() {
  const clienteId = await requireAuth();
  if (clienteId === "admin") redirect("/admin");
  redirect("/painel");
}
