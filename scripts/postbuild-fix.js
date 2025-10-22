const fs = require("fs");
const path = require("path");

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let data = fs.readFileSync(filePath, "utf8");
  const before = data;

  // Safari mag unquoted keys wie as: "style" nicht — hier alle Varianten abfangen:
  data = data
    // Variante: {as:"style"}
    .replace(/\{(\s*)as\s*:/g, '{"as":')
    // Variante: ,as:"style"
    .replace(/,(\s*)as\s*:/g, ',"as":')
    // Variante: (as:"style")
    .replace(/\((\s*)as\s*:/g, '("as":');

  if (data !== before) {
    fs.writeFileSync(filePath, data, "utf8");
    console.log("✅ Patched:", filePath);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (file.endsWith(".js")) fixFile(full);
  }
}

console.log("🩹 Running Safari syntax fix…");
walk(".next/static/chunks");
walk(".next/server/app");
console.log("🚀 Safari postbuild fix complete.");
