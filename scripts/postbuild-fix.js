// scripts/postbuild-fix.js
import fs from "fs";
import path from "path";

const ROOT = path.resolve(".next/static");
const FILE_EXT = ".js";

// Ersetzt NUR Property-Keys `as:` in Objekt-Literalen => ({ as: ... }) oder (, as: ...)
// Damit vermeiden wir falsche Treffer (z.B. in Strings oder bei `import { x as y }` gibt's hier im Output ohnehin nicht).
const AS_PROP_REGEX = /([,{]\s*)as\s*:/g;

/**
 * Patch-Funktion: lies Datei, ersetze sichere Vorkommen, schreibe zurück (nur wenn geändert)
 */
function patchFile(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  if (!AS_PROP_REGEX.test(src)) return false;
  const patched = src.replace(AS_PROP_REGEX, '$1"as":');
  if (patched !== src) {
    fs.writeFileSync(filePath, patched, "utf8");
    return true;
  }
  return false;
}

/**
 * Gehe rekursiv durch .next/static und patche alle .js-Dateien
 */
function walkAndPatch(dir, patchedList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walkAndPatch(full, patchedList);
    } else if (e.isFile() && e.name.endsWith(FILE_EXT)) {
      if (patchFile(full)) patchedList.push(full);
    }
  }
  return patchedList;
}

(function main() {
  if (!fs.existsSync(ROOT)) {
    console.log(`⚠️  Not found: ${ROOT}`);
    process.exit(0);
  }
  console.log("🩹 Running wide Safari 'as' fix…");
  const patched = walkAndPatch(ROOT, []);
  if (patched.length === 0) {
    console.log("ℹ️  Nothing to patch.");
  } else {
    // kurze, lesbare Ausgabe – nicht alles spammen
    const head = patched.slice(0, 10).map(p => `✅ Patched: ${p}`).join("\n");
    console.log(head);
    if (patched.length > 10) {
      console.log(`…and ${patched.length - 10} more file(s).`);
    }
  }
  console.log("🚀 Safari fix complete.");
})();
