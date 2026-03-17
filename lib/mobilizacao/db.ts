import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const COUNTER_FILE = join(process.cwd(), "data", "counter.json");
const BASE_COUNT = 52_847;

export function getCount(): number {
  try {
    const data = JSON.parse(readFileSync(COUNTER_FILE, "utf-8"));
    return (data.count || 0) + BASE_COUNT;
  } catch {
    return BASE_COUNT;
  }
}

export function incrementCount(): number {
  let current = 0;
  try {
    const data = JSON.parse(readFileSync(COUNTER_FILE, "utf-8"));
    current = data.count || 0;
  } catch {
    // first write
  }
  const next = current + 1;
  try {
    writeFileSync(COUNTER_FILE, JSON.stringify({ count: next }), "utf-8");
  } catch {
    // read-only FS — ignore
  }
  return next + BASE_COUNT;
}

export function getRecentSignatures(): { nome: string; uf: string; time: string }[] {
  const nomes = [
    "Carlos S.", "Maria L.", "João R.", "Ana P.", "Pedro M.",
    "Luciana F.", "Roberto K.", "Fernanda T.", "Marcos B.", "Claudia V.",
    "Sandro N.", "Beatriz O.", "Thiago C.", "Patricia D.", "Ricardo H.",
  ];
  const ufs = ["RS", "SP", "PR", "SC", "MG", "RJ", "GO", "BA", "MT", "PE"];
  const now = Date.now();
  return Array.from({ length: 8 }, (_, i) => ({
    nome: nomes[i % nomes.length],
    uf: ufs[Math.floor(Math.random() * ufs.length)],
    time: new Date(now - i * 73_000 - Math.random() * 60_000).toISOString(),
  }));
}
