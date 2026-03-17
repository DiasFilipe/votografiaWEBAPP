import { getCount } from "@/lib/mobilizacao/db";
import ContadorLive from "@/components/mobilizacao/ContadorLive";
import FormAssinatura from "@/components/mobilizacao/FormAssinatura";
import ShareButtons from "@/components/mobilizacao/ShareButtons";
import DeputadosList from "@/components/mobilizacao/DeputadosList";
import deputadosData from "@/data/deputados.json";

export const dynamic = "force-dynamic";

const RAZOES = [
  { icon: "⚖️", titulo: "Accountability Judicial", desc: "O STF precisa responder pelos seus atos. Uma CPI garantiria transparência e controle democrático sobre o Judiciário." },
  { icon: "📜", titulo: "Direito Constitucional", desc: "A abertura de uma CPI é um direito previsto na Constituição. Basta 1/3 dos deputados — 171 assinaturas — para abri-la." },
  { icon: "🗳️", titulo: "Vontade Popular", desc: "Milhões de brasileiros querem investigação. Sua assinatura diz ao seu deputado que o povo exige que o STF preste contas." },
  { icon: "🏛️", titulo: "Equilíbrio entre Poderes", desc: "Nenhum poder da República pode agir sem controle. A CPI restauraria o equilíbrio entre Legislativo, Executivo e Judiciário." },
];

export default async function MobilizacaoPage() {
  const count = getCount();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at 50% 0%, #854d0e 0%, transparent 70%)" }} />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="flex justify-center mb-6">
            <span className="bg-green-700 text-green-100 text-xs font-bold px-5 py-2 rounded-full uppercase tracking-widest">
              🇧🇷 Campanha Nacional · CPI do STF
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-center leading-tight mb-4">
            ASSINE A{" "}
            <span style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              CPI DO STF
            </span>
          </h1>
          <p className="text-xl text-gray-300 text-center max-w-2xl mx-auto mb-12 leading-relaxed">
            O senador <strong className="text-white">Marcel van Hattem</strong> lidera a luta pela investigação dos abusos do STF. Precisa de{" "}
            <strong className="text-yellow-400">171 deputados</strong> para abrir a CPI. Pressione o seu!
          </p>
          <ContadorLive initialCount={count} meta={100_000} />
          <div className="mt-10">
            <FormAssinatura />
          </div>
        </div>
      </section>

      {/* ── POR QUE ASSINAR ──────────────────────────── */}
      <section className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-3">Por que a CPI do STF importa?</h2>
          <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">Entenda a importância desta investigação para a democracia brasileira.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {RAZOES.map((r) => (
              <div key={r.titulo} className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 hover:border-yellow-700 transition-colors">
                <div className="text-4xl mb-4">{r.icon}</div>
                <h3 className="font-bold text-white mb-2">{r.titulo}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRESSO ────────────────────────────────── */}
      <section className="py-16 bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-black text-center mb-10">Progresso das assinaturas na Câmara</h2>
          <div className="space-y-6">
            <ProgressBar label="Meta para abertura da CPI" value={89} total={171} color="#f59e0b" />
            <ProgressBar label="Bancada do PL" value={61} total={99} color="#16a34a" />
            <ProgressBar label="Bancada Conservadora" value={89} total={250} color="#2563eb" />
          </div>
          <p className="text-gray-500 text-xs text-center mt-6">* Dados ilustrativos. Atualizar conforme o requerimento avança.</p>
        </div>
      </section>

      {/* ── PRESSIONE SEU DEPUTADO ───────────────────── */}
      <section className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black mb-3">
              Pressione seu <span className="text-yellow-400">Deputado Federal</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">Encontre os deputados do seu estado e envie uma mensagem pronta pedindo que assinem o requerimento.</p>
          </div>
          <DeputadosList deputados={deputadosData} />
        </div>
      </section>

      {/* ── COMPARTILHE ──────────────────────────────── */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-3">Espalhe a palavra!</h2>
          <p className="text-gray-400 mb-10 max-w-xl mx-auto">Compartilhe com seus amigos e familiares. Cada assinatura conta!</p>
          <ShareButtons />
        </div>
      </section>
    </div>
  );
}

function ProgressBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = Math.round((value / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-400">{value}/{total} ({pct}%)</span>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
