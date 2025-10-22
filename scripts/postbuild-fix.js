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
      // Patch problematische "as" Konstruktionen
      content = content
  // "as" innerhalb von Objekten, z. B. { as: "style" }
  .replace(/(\{[^}]*?)\bas(?=\s*:)/g, '$1"as"')
  // "as" nach Klammern oder Leerzeichen
  .replace(/(\s|\(|\{)as(\s*[=:])/g, '$1"as"$2');
      if (content !== original) {
        fs.writeFileSync(filePath, content, "utf8");
        console.log("✅ Patched:", filePath);
      }
    }
  }
}

console.log("🩹 Running extended Safari 'as' fix...");
TARGET_DIRS.forEach(patchFilesIn);
console.log("🚀 Extended Safari fix complete.");
