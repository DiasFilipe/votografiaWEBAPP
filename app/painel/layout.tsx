import Link from "next/link";

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 space-y-6">
      {/* Sub-nav */}
      <nav className="flex items-center gap-1 border-b border-gray-200 pb-4">
        <Link href="/painel" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition">
          Mapa
        </Link>
        <Link href="/painel/ranking" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition">
          Ranking
        </Link>
        <Link href="/painel/regioes" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition">
          Regiões
        </Link>
      </nav>
      {children}
    </div>
  );
}
