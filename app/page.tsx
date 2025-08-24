import Script from "next/script";

export default function Page() {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/iframe-resizer/js/iframeResizer.contentWindow.min.js"
        strategy="beforeInteractive"
      />
      {/* Hier kommt dein Grid-Layout */}
    </>
  );
}
export default function Home() {
  return (
    <main style={{fontFamily:'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif', padding:24}}>
      <h1>KPI Grid – Embed</h1>
      <p>Nutzung: <code>/widget/grid?config=&lt;base64(JSON)&gt;</code> oder <code>/widget/grid?preset=vertrieb</code></p>
    </main>
  );
}
