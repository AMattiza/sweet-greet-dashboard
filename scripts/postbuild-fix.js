// scripts/postbuild-fix.js
import fs from "fs";
import path from "path";

const ROOTS = [".next"]; // durchsucht alles unter .next
const FILE_EXT = ".js";
const AS_PROP_REGEX = /([,{]\s*)as\s*:/g;

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
  console.log("🩹 Running global Safari 'as' fix across .next/");
  let patched = [];
  for (const root of ROOTS) {
    if (!fs.existsSync(root)) continue;
    patched = patched.concat(walkAndPatch(root));
  }
  if (patched.length) {
    console.log(`✅ Patched ${patched.length} JS file(s).`);
    patched.slice(0, 10).forEach(f => console.log("→", f));
  } else {
    console.log("ℹ️ No matches found. Nothing to patch.");
  }
  console.log("🚀 Safari fix complete.");
})();
