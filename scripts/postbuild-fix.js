const fs = require("fs");
const path = require("path");

function fixAsKeys(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      fixAsKeys(fullPath);
    } else if (file.endsWith(".js")) {
      let data = fs.readFileSync(fullPath, "utf8");

      // Nur wenn der Schlüssel `as:` vorkommt (z. B. {as:"style"})
      if (data.includes("as:")) {
        const fixed = data.replace(/\b(as):\s*("?[a-zA-Z0-9_-]+"?)/g, '"as": $2');
        if (fixed !== data) {
          fs.writeFileSync(fullPath, fixed, "utf8");
          console.log(`✅ Patched: ${fullPath}`);
        }
      }
    }
  }
}

const chunksDir = path.join(__dirname, "../.next/static/chunks");
if (fs.existsSync(chunksDir)) {
  fixAsKeys(chunksDir);
  console.log("🚀 Postbuild-Fix abgeschlossen.");
} else {
  console.warn("⚠️  Keine Chunks gefunden. Wurde `next build` bereits ausgeführt?");
}
