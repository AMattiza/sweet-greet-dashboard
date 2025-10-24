/**
 * Deep Debugger für Safari ".as"-Fehler
 * -------------------------------------
 * Sucht in allen kompilierten JS-Dateien nach problematischen
 * ".as", "as:" oder ähnlichen Mustern und schreibt Treffer in
 * ./public/as-debug.log, damit sie nach dem Deploy einsehbar sind.
 */

import fs from "fs";
import path from "path";
import zlib from "zlib";

console.log("🔍 Running Safari '.as' Deep Debug scan...");

// Konfiguration
const ROOT = ".next";
const TARGET_DIRS = [
  path.join(ROOT, "static", "chunks"),
  path.join(ROOT, "server", "chunks"),
  path.join(ROOT, "server", "app"),
];
const LOGFILE = "public/as-debug.log";
const matches = [];

/**
 * Scannt den Inhalt einer Datei nach problematischen ".as" Mustern.
 */
function scan(content, filePath) {
  const lines = content.split("\n");
  lines.forEach((line, idx) => {
    if (/\.\s*["']as["']/.test(line) || /\.as\s*["']/.test(line)) {
      matches.push({
        file: filePath,
        line: idx + 1,
        snippet: line.slice(0, 200),
      });
    }
  });
}

/**
 * Liest Dateiinhalt – unterstützt .js, .js.br und .js.gz
 */
function readFileContent(file) {
  if (file.endsWith(".br")) {
    return zlib.brotliDecompressSync(fs.readFileSync(file)).toString("utf8");
  } else if (file.endsWith(".gz")) {
    return zlib.gunzipSync(fs.readFileSync(file)).toString("utf8");
  } else {
    return fs.readFileSync(file, "utf8");
  }
}

/**
 * Durchläuft alle Dateien in einem Verzeichnis rekursiv.
 */
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full);
    } else if (/\.(js|js\.br|js\.gz)$/.test(f)) {
      try {
        const content = readFileContent(full);
        scan(content, full);
      } catch (err) {
        console.warn("⚠️ Failed to read:", full, err.message);
      }
    }
  }
}

// Hauptausführung
for (const dir of TARGET_DIRS) walk(dir);

// ✅ Stelle sicher, dass ./public existiert
const logDir = path.dirname(LOGFILE);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Schreibe Logdatei oder gib "ok" aus
if (matches.length > 0) {
  fs.writeFileSync(LOGFILE, JSON.stringify(matches, null, 2));
  console.log(`❗ Found ${matches.length} suspicious lines. Written to ${LOGFILE}`);
  matches.forEach((m) =>
    console.log(`🧠 ${m.file}:${m.line} → ${m.snippet.slice(0, 120)}...`)
  );
} else {
  console.log("✅ No suspicious '.as' syntax found in compiled code.");
}

console.log("🚀 Safari '.as' Deep Debug complete.");
