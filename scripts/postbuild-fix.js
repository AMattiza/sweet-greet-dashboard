/**
 * Safari Fix v3.5 – Final Safe Rewrite
 * -------------------------------------
 * Entfernt problematische `.as`-Konstrukte in kompilierten Next.js-Bundles.
 * Behebt: SyntaxError: Unexpected string literal "as"
 *
 * Unterstützt auch Brotli- und Gzip-Dateien.
 */

import fs from "fs";
import path from "path";
import zlib from "zlib";

const ROOT = ".next";
const TARGET_DIRS = [
  path.join(ROOT, "static", "chunks"),
  path.join(ROOT, "server", "chunks"),
  path.join(ROOT, "server", "app"),
];

console.log("🩹 Running Safari Fix v3.5 – Final Safe Rewrite...");

/** Haupt-Patchfunktion */
function patchContent(content) {
  return (
    content
      // 1️⃣ .as( → ["as"](   (Funktionsaufruf)
      .replace(/\.as(?=\s*\()/g, '["as"]')
      // 2️⃣ { as: → { "as":   (Objektliteral)
      .replace(/(\{[^{}]*?)\bas(?=\s*:)/g, '$1"as"')
      // 3️⃣ as: → "as":  (Fallback für Minify-Kombinationen)
      .replace(/([\{,]\s*)as(?=\s*:)/g, '$1"as"')
      // 4️⃣ as =  → "as" =  (Zuweisungen)
      .replace(/(\s)as(?=\s*=)/g, '$1"as"')
  );
}

/** Patcht einzelne Datei (JS, BR, GZ) */
function patchFile(filePath) {
  const ext = path.extname(filePath);
  try {
    let content;
    if (ext === ".br") {
      content = zlib.brotliDecompressSync(fs.readFileSync(filePath)).toString("utf8");
      const patched = patchContent(content);
      if (patched !== content) {
        fs.writeFileSync(filePath, zlib.brotliCompressSync(Buffer.from(patched)));
        console.log("✅ Patched Brotli:", filePath);
      }
    } else if (ext === ".gz") {
      content = zlib.gunzipSync(fs.readFileSync(filePath)).toString("utf8");
      const patched = patchContent(content);
      if (patched !== content) {
        fs.writeFileSync(filePath, zlib.gzipSync(Buffer.from(patched)));
        console.log("✅ Patched Gzip:", filePath);
      }
    } else if (filePath.endsWith(".js")) {
      content = fs.readFileSync(filePath, "utf8");
      const patched = patchContent(content);
      if (patched !== content) {
        fs.writeFileSync(filePath, patched, "utf8");
        console.log("✅ Patched JS:", filePath);
      }
    }
  } catch (err) {
    console.warn("⚠️ Patch failed for:", filePath, err.message);
  }
}

/** Läuft rekursiv durch Verzeichnisse */
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath);
    } else if (/\.(js|js\.br|js\.gz)$/.test(file)) {
      patchFile(filePath);
    }
  }
}

// Start
for (const dir of TARGET_DIRS) walk(dir);

console.log("🚀 Safari Fix v3.5 completed – all problematic '.as' usages rewritten.");
