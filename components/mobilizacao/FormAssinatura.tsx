"use client";

import { useState } from "react";

const UFS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG",
  "MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR",
  "RS","SC","SE","SP","TO",
];

export default function FormAssinatura({ onSigned }: { onSigned?: (count: number) => void }) {
  const [nome, setNome] = useState("");
  const [uf, setUf] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !uf) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/assinar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), uf }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        onSigned?.(data.count);
      } else {
        setErrorMsg(data.error || "Erro ao assinar");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Erro de conexão. Tente novamente.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="w-full max-w-md mx-auto bg-green-900/30 border border-green-700 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-green-400 mb-2">Assinatura confirmada!</h3>
        <p className="text-gray-300 mb-6">Obrigado, <strong>{nome}</strong>! Sua voz conta.</p>
        <button
          onClick={() => {
            const msg = encodeURIComponent(`Acabei de assinar o requerimento da CPI do STF! Junte-se a nós: ${window.location.href} #CPIdoSTF`);
            window.open(`https://wa.me/?text=${msg}`, "_blank");
          }}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl transition-colors"
        >
          📱 Compartilhar no WhatsApp
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto bg-gray-900/60 border border-gray-700 rounded-2xl p-6 space-y-4">
      <h3 className="text-xl font-bold text-center text-white mb-2">Assine agora — é gratuito</h3>
      <div>
        <label className="block text-sm text-gray-400 mb-1" htmlFor="nome">Seu nome completo</label>
        <input
          id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: João da Silva" required minLength={2}
          className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1" htmlFor="uf">Estado</label>
        <select
          id="uf" value={uf} onChange={(e) => setUf(e.target.value)} required
          className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
        >
          <option value="">Selecione seu estado</option>
          {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
      {status === "error" && <p className="text-red-400 text-sm text-center">{errorMsg}</p>}
      <button
        type="submit" disabled={status === "loading" || !nome.trim() || !uf}
        className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-black text-lg py-4 rounded-xl transition-colors uppercase tracking-wider"
      >
        {status === "loading" ? "Assinando..." : "✍️ ASSINAR AGORA"}
      </button>
      <p className="text-xs text-gray-500 text-center">Seus dados são usados apenas para registro desta petição.</p>
    </form>
  );
}
