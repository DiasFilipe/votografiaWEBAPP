import { generateMockMentions } from "@/lib/sentimento/mockData";
import Dashboard from "@/components/sentimento/Dashboard";

export const dynamic = "force-dynamic";

export default async function SentimentoPage() {
  const bearerToken = process.env.X_API_BEARER_TOKEN;
  let initial;

  if (bearerToken) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3010"}/api/mentions`,
        { cache: "no-store" }
      );
      initial = res.ok ? await res.json() : generateMockMentions();
    } catch {
      initial = generateMockMentions();
    }
  } else {
    initial = generateMockMentions();
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Monitor de Sentimento</h1>
        <p className="text-gray-500 text-sm mt-1">Menções nas redes sociais · Análise automática</p>
      </div>
      <Dashboard initial={initial} />
    </div>
  );
}
