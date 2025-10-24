/**
 * Safari 'as' Hot Patch (after Vercel compression)
 * -------------------------------------------------
 * Repariert problematische .js.br-Dateien, die Safari sonst
 * mit "Unexpected string literal 'as'" ablehnt.
 *
 * Läuft nur, wenn das Environment auf Vercel aktiv ist.
 */

import fs from "fs";
import path from "path";
import zlib from "zlib";

if (!process.env.VERCEL) {
  console.log("🟡 Skip Safari post-compression fix (local build).");
  process.exit(0);
}

const OUT = ".next/static/chunks";

console.log("🧩 Running Safari post-compression fix...");

function patch(content) {
  return content
    .replace(/(\{[^}]*?)\bas(?=\s*:)/g, '$1"as"')
    .replace(/(\s|\(|\{)as(\s*[=:])/g, '$1"as"$2');
}

if (fs.existsSync(OUT)) {
  for (const file of fs.readdirSync(OUT)) {
    const filePath = path.join(OUT, file);
    if (file.endsWith(".js.br")) {
      try {
        const raw = fs.readFileSync(filePath);
        const dec = zlib.brotliDecompressSync(raw).toString("utf8");
        const patched = patch(dec);
        if (patched !== dec) {
          const compressed = zlib.brotliCompressSync(Buffer.from(patched));
          fs.writeFileSync(filePath, compressed);
          console.log("✅ Patched Brotli:", file);
        }
      } catch (e) {
        console.warn("⚠️ Failed to patch:", file, e.message);
      }
    }
  }
}

console.log("🚀 Safari post-compression fix complete.");
