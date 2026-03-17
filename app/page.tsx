import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const h = await headers();
  const clienteId = h.get("x-cliente-id") ?? "";
  if (clienteId === "admin") redirect("/admin");
  redirect("/painel");
}
