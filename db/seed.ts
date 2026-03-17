import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getPool } from "./client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");

interface ClienteJSON {
  id: string; subdominio: string; nome: string; nomeCompleto: string;
  partido: string; estado: string; cargo: string;
  cor: string; corTexto: string; foto: string; senha: string;
  wikipedia?: string;
  modulos: { painel: boolean; sentimento: boolean; mobilizacao: boolean };
}

interface MunicipioJSON {
  municipio: string; cod_tse: string;
  votos: number; total_dep_fed: number; pct: number;
}

async function seed() {
  const pool = getPool();
  const clientes: Record<string, ClienteJSON> = JSON.parse(
    readFileSync(join(DATA_DIR, "clientes.json"), "utf-8")
  );

  for (const c of Object.values(clientes)) {
    await pool.query(
      `INSERT INTO clientes
         (id, subdominio, nome, nome_completo, partido, estado, cargo,
          cor, cor_texto, foto, senha, wikipedia,
          modulo_painel, modulo_sentimento, modulo_mobilizacao)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (id) DO UPDATE SET
         subdominio=EXCLUDED.subdominio, nome=EXCLUDED.nome,
         nome_completo=EXCLUDED.nome_completo, partido=EXCLUDED.partido,
         estado=EXCLUDED.estado, cargo=EXCLUDED.cargo,
         cor=EXCLUDED.cor, cor_texto=EXCLUDED.cor_texto, foto=EXCLUDED.foto,
         senha=EXCLUDED.senha, wikipedia=EXCLUDED.wikipedia,
         modulo_painel=EXCLUDED.modulo_painel,
         modulo_sentimento=EXCLUDED.modulo_sentimento,
         modulo_mobilizacao=EXCLUDED.modulo_mobilizacao`,
      [
        c.id, c.subdominio, c.nome, c.nomeCompleto, c.partido, c.estado, c.cargo,
        c.cor, c.corTexto, c.foto, c.senha, c.wikipedia ?? null,
        c.modulos.painel, c.modulos.sentimento, c.modulos.mobilizacao,
      ]
    );
    console.log(`  ✓ cliente: ${c.id}`);

    const painelPath = join(DATA_DIR, c.id, "painel.json");
    let municipios: MunicipioJSON[];
    try {
      municipios = JSON.parse(readFileSync(painelPath, "utf-8"));
    } catch {
      console.log(`  ⚠ sem painel.json para ${c.id}, pulando municípios`);
      continue;
    }

    for (const m of municipios) {
      await pool.query(
        `INSERT INTO municipios (cliente_id, municipio, cod_tse, votos, total_dep_fed, pct)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (cliente_id, cod_tse) DO UPDATE SET
           municipio=EXCLUDED.municipio, votos=EXCLUDED.votos,
           total_dep_fed=EXCLUDED.total_dep_fed, pct=EXCLUDED.pct`,
        [c.id, m.municipio, m.cod_tse, m.votos, m.total_dep_fed, m.pct]
      );
    }
    console.log(`  ✓ ${municipios.length} municípios: ${c.id}`);
  }

  console.log("\n✓ Seed concluído");
  await pool.end();
}

seed().catch((err) => { console.error(err); process.exit(1); });
