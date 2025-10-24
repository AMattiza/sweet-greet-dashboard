/**
 * Safari 'as' Deep Patch (after Vercel compression)
 * -------------------------------------------------
 * Repariert ALLE Brotli- (.br) und Gzip- (.gz) Dateien im .next-Output,
 * die Safari sonst mit „Unexpected string literal 'as'“ ablehnt.
 *
 * Läuft automatisch auf Vercel nach der Kompression.
 */

import fs from "fs";
import path from "path";
import zlib from "zlib";

if (!process.env.VERCEL) {
  console.log("🟡 Skip Safari post-compression fix (local build).");
  process.exit(0);
}

const TARGET_DIRS = [
  ".next/static/chunks",
  ".next/static/chunks/app",
  ".next/server/chunks",
  ".next/server/app"
];

console.log("🧩 Running Safari Deep Patch (post-compression)...");

function patch(content) {
  return content
    // { as: "x" } → { "as": "x" }
    .replace(/(\{[^}]*?)\bas(?=\s*:)/g, '$1"as"')
    // .as("x") → ["as"]("x")
    .replace(/\.as(?=\s*\()/g, '["as"]')
    // as= → "as"=
    .replace(/(\s)as(?=\s*=)/g, '$1"as"');
}

function patchFile(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    let decoded;
    if (filePath.endsWith(".br")) decoded = zlib.brotliDecompressSync(buf).toString("utf8");
    else if (filePath.endsWith(".gz")) decoded = zlib.gunzipSync(buf).toString("utf8");
    else return;

    const patched = patch(decoded);
    if (patched !== decoded) {
      const rec = filePath.endsWith(".br")
        ? zlib.brotliCompressSync(Buffer.from(patched))
        : zlib.gzipSync(Buffer.from(patched));
      fs.writeFileSync(filePath, rec);
      console.log("✅ Patched:", filePath);
    }
  } catch (e) {
    console.warn("⚠️ Failed:", filePath, e.message);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p);
    else if (f.endsWith(".js.br") || f.endsWith(".js.gz")) patchFile(p);
  }
}

for (const dir of TARGET_DIRS) walk(dir);

console.log("🚀 Safari Deep Patch (post-compression) complete.");
