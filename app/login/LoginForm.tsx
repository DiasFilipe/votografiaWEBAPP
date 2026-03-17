"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ clienteId, cor }: { clienteId: string; cor: string }) {
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId, senha }),
      });
      if (res.ok) {
        router.replace(clienteId === "admin" ? "/admin" : "/painel");
      } else {
        const data = await res.json().catch(() => ({}));
        setErro(data.error ?? "Senha incorreta.");
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-400 text-sm mb-1.5">Senha de acesso</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 text-sm"
        />
      </div>

      {erro && (
        <p className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !senha}
        className="w-full py-3 rounded-xl font-bold text-sm transition disabled:opacity-50"
        style={{ backgroundColor: cor, color: cor === "#1d4ed8" ? "#fff" : "#000" }}
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
