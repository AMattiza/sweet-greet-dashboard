import fs from "fs";
import path from "path";

const ROOT = ".next";
const TARGET_DIRS = [
  path.join(ROOT, "static", "chunks"),
  path.join(ROOT, "server", "chunks"),
  path.join(ROOT, "server", "app")
];

function patchFilesIn(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      patchFilesIn(filePath);
    } else if (file.endsWith(".js")) {
      let content = fs.readFileSync(filePath, "utf8");
      const original = content;

      // === Safari Fix – erweitert für Inline-Fälle ===
      content = content
        // 1. {as:"style"} → {"as":"style"}
        .replace(/\{as:/g, '{"as":')
        // 2. { as: "..." } → {"as":"..."}
        .replace(/\{\s*as\s*:/g, '{"as":')
        // 3. (as:"") → ("as":"")
        .replace(/\(as\s*:/g, '("as":')
        // 4. o.default.preinit(e,{as:"style"}) → o.default.preinit(e,{"as":"style"})
        .replace(/preinit\(([^)]*?)\{as:/g, 'preinit($1{"as":')
        // 5. Sicherheitshalber doppelte Quotes normalisieren
        .replace(/"{2,}/g, '"');

      if (content !== original) {
        fs.writeFileSync(filePath, content, "utf8");
        console.log("✅ Patched:", filePath);
      }
    }
  }
}

console.log("🩹 Running EXTENDED Safari 'as' deep fix...");
TARGET_DIRS.forEach(patchFilesIn);
console.log("🚀 Safari fix deep completed.");
