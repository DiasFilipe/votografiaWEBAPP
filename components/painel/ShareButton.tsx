"use client";

export default function ShareButton({ municipio }: { municipio: string }) {
  function share() {
    const url = window.location.href;
    const text = `Análise eleitoral de ${municipio} — Painel Eleitoral`;
    if (navigator.share) {
      navigator.share({ title: text, url });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copiado!");
    }
  }

  return (
    <button
      onClick={share}
      className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-2.5 rounded-xl text-sm transition"
    >
      Compartilhar link →
    </button>
  );
}
