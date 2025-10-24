/**
 * Extended Safari 'as' Fix (v2.2)
 * -------------------------------------
 * Dieses Script durchsucht alle .js-, .js.br- und .js.gz-Dateien
 * im .next-Ordner nach problematischen "as"-Konstruktionen und
 * ersetzt sie durch valide Syntax für Safari (WebKit).
 *
 * Es behebt:
 *   - SyntaxError: Unexpected string literal "as"
 *   - Safari .as() Parsefehler in minifizierten Builds
 *   - Auch komprimierte .br / .gz Dateien werden gepatcht
 */

import fs from "fs";
import path from "path";
import zlib from "zlib";

const ROOT = ".next";
const TARGET_DIRS = [
  path.join(ROOT, "static", "chunks"),
  path.join(ROOT, "server", "chunks"),
  path.join(ROOT, "server", "app")
];

// Hilfsfunktion: Patcht Textinhalt
function patchContent(content) {
  return content
    // { as: "style" } → {"as": "style"}
    .replace(/(\{[^}]*?)\bas(?=\s*:)/g, '$1"as"')
    //  (as=...) oder { as=... } → ("as"=...)
    .replace(/(\s|\(|\{)as(\s*[=:])/g, '$1"as"$2');
}

// Hauptfunktion: Patchen von Dateien
function patchFilesIn(dir) {
  if (!fs.existsSync(dir)) return;

  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      patchFilesIn(filePath);
      continue;
    }

    // Nur relevante Dateien patchen
    if (file.endsWith(".js")) {
      const original = fs.readFileSync(filePath, "utf8");
      const patched = patchContent(original);
      if (patched !== original) {
        fs.writeFileSync(filePath, patched, "utf8");
        console.log("✅ Patched JS:", filePath);
      }
    }

    // Brotli-komprimierte Dateien
    else if (file.endsWith(".js.br")) {
      const buffer = fs.readFileSync(filePath);
      const unzipped = zlib.brotliDecompressSync(buffer).toString("utf8");
      const patched = patchContent(unzipped);
      if (patched !== unzipped) {
        const recompressed = zlib.brotliCompressSync(Buffer.from(patched));
        fs.writeFileSync(filePath, recompressed);
        console.log("✅ Patched Brotli:", filePath);
      }
    }

    // Gzip-komprimierte Dateien
    else if (file.endsWith(".js.gz")) {
      const buffer = fs.readFileSync(filePath);
      const unzipped = zlib.gunzipSync(buffer).toString("utf8");
      const patched = patchContent(unzipped);
      if (patched !== unzipped) {
        const recompressed = zlib.gzipSync(Buffer.from(patched));
        fs.writeFileSync(filePath, recompressed);
        console.log("✅ Patched Gzip:", filePath);
      }
    }
  }
}

// Log-Ausgabe für bessere Nachvollziehbarkeit
console.log("🩹 Running EXTENDED Safari 'as' deep fix...");

for (const dir of TARGET_DIRS) {
  patchFilesIn(dir);
}

console.log("🚀 Safari fix deep completed.");
