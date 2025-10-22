import fs from "fs";
import path from "path";

const ROOTS = [".next/static/chunks", ".next/server/app"];

function fixSafariBug(file) {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, "utf8");
  const original = code;

  // Skip source maps and JSON
  if (file.endsWith(".map") || file.endsWith(".json")) return;

  // Replace all unquoted "as:" keys
  // Catches {as:"..."}, ,as:"...", (as:"..."), preinit(e,{as:"..."})
  code = code.replace(
    /([\{,\(])\s*as\s*:/g,
    '$1 "as":'
  );

  if (code !== original) {
    fs.writeFileSync(file, code, "utf8");
    console.log("✅ Patched:", file);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (entry.endsWith(".js")) fixSafariBug(full);
  }
}

console.log("🩹 Running advanced Safari syntax fix…");
ROOTS.forEach(walk);
console.log("🚀 Safari fix complete.");
