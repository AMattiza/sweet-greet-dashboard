/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false, // du willst keine Minify-Fehler riskieren
  compress: true,
  experimental: { esmExternals: false },

  // ✅ Jede Build-ID wird eindeutig – Safari bekommt neue Chunks
  generateBuildId: async () => Date.now().toString(),

  // ✅ Header bleiben erhalten
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "ALLOWALL" },
        { key: "Content-Encoding", value: "" } // verhindert doppelte Brotli-Angabe
      ]
    }
  ],

  // ✅ Erzwinge neue Dateinamen für Chunks (Cache-Bust)
  webpack: (config, { isServer }) => {
  // Nur für Client-Builds (Browser-Seite)
  if (!isServer) {
    config.output.filename = "static/chunks/[name].[contenthash].js";
    config.output.chunkFilename = "static/chunks/[name].[contenthash].js";
  }
  return config;
},
};

export default nextConfig;
