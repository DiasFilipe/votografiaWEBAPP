/**
 * Busca fotos dos candidatos no Wikipedia e salva em public/fotos/{id}.jpg
 * Depois atualiza o campo `foto` no banco de dados.
 *
 * Uso: npx tsx db/fetch-photos.ts
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getPool } from "@/db/client";

const FOTOS_DIR = join(process.cwd(), "public", "fotos");
const WIKI_API = "https://pt.wikipedia.org/w/api.php";

mkdirSync(FOTOS_DIR, { recursive: true });

interface ClienteRow {
  id: string;
  nome_completo: string;
  wikipedia: string | null;
}

async function getWikipediaPhotoUrl(title: string): Promise<string | null> {
  const url = `${WIKI_API}?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=500&piprop=thumbnail`;
  const res = await fetch(url, { headers: { "User-Agent": "Votografia/1.0 (contato@votografia.com.br)" } });
  if (!res.ok) return null;
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0] as any;
  return page?.thumbnail?.source ?? null;
}

async function downloadPhoto(photoUrl: string, destPath: string): Promise<boolean> {
  const res = await fetch(photoUrl, { headers: { "User-Agent": "Votografia/1.0 (contato@votografia.com.br)" } });
  if (!res.ok) return false;
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(destPath, buffer);
  return true;
}

async function main() {
  const pool = getPool();

  const { rows } = await pool.query<ClienteRow>(
    "SELECT id, nome_completo, wikipedia FROM clientes WHERE wikipedia IS NOT NULL"
  );

  if (rows.length === 0) {
    console.log("Nenhum cliente com campo wikipedia no banco. Rode db:seed primeiro.");
    process.exit(0);
  }

  for (const cliente of rows) {
    const { id, nome_completo, wikipedia } = cliente;
    console.log(`\n→ ${nome_completo} (${id})`);

    const photoUrl = await getWikipediaPhotoUrl(wikipedia!);
    if (!photoUrl) {
      console.log(`  ✗ Foto não encontrada no Wikipedia para "${wikipedia}"`);
      continue;
    }
    console.log(`  Foto: ${photoUrl}`);

    const ext = photoUrl.includes(".png") ? "png" : "jpg";
    const destPath = join(FOTOS_DIR, `${id}.${ext}`);
    const ok = await downloadPhoto(photoUrl, destPath);
    if (!ok) {
      console.log(`  ✗ Falha ao baixar foto`);
      continue;
    }

    const fotoPath = `/fotos/${id}.${ext}`;
    await pool.query("UPDATE clientes SET foto = $1 WHERE id = $2", [fotoPath, id]);
    console.log(`  ✓ Salvo em ${destPath}, banco atualizado → ${fotoPath}`);
  }

  await pool.end();
  console.log("\nConcluído.");
}

main().catch((e) => { console.error(e); process.exit(1); });
