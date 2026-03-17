import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getPool } from "./client";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const pool = getPool();
  const files = ["001_initial.sql", "002_wikipedia.sql"];
  for (const file of files) {
    const sql = readFileSync(join(__dirname, "migrations", file), "utf-8");
    await pool.query(sql);
    console.log(`  ✓ ${file}`);
  }
  console.log("✓ Migrations concluídas");
  await pool.end();
}

migrate().catch((err) => { console.error(err); process.exit(1); });
