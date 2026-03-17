import fs from "node:fs";
import path from "node:path";

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(path.dirname(dest));
  fs.cpSync(src, dest, { recursive: true, force: true });
}

const root = process.cwd();
const standaloneRoot = path.join(root, ".next", "standalone");

if (!fs.existsSync(standaloneRoot)) {
  throw new Error(
    `Standalone output not found at ${standaloneRoot}. Check next.config.ts output:"standalone".`
  );
}

copyDir(path.join(root, "public"), path.join(standaloneRoot, "public"));
copyDir(
  path.join(root, ".next", "static"),
  path.join(standaloneRoot, ".next", "static")
);
copyDir(path.join(root, "data"), path.join(standaloneRoot, "data"));

console.log("✓ postbuild: copied public/.next/static/data into .next/standalone");
