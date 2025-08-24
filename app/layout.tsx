import "./globals.css";
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        {children}
        {/* Wichtig: Client-Skript für Auto-Höhe */}
        <Script
          src="https://cdn.jsdelivr.net/npm/iframe-resizer/js/iframeResizer.contentWindow.min.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
