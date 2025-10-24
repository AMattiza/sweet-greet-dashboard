/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  compress: true,
  experimental: { esmExternals: false },

  // Erzwinge komplett neue Build-ID bei jedem Deploy
  generateBuildId: async () =>
    `build-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

  // Deaktiviere Browser- und CDN-Cache für JS
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "Cache-Control", value: "no-store" },
        { key: "X-Frame-Options", value: "ALLOWALL" },
        { key: "Content-Encoding", value: "" },
      ],
    },
  ],

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // neue Dateinamen erzwingen – Safari kann nichts mehr cachen
      config.output.filename = "static/chunks/[name].[contenthash:8].mjs";
      config.output.chunkFilename = "static/chunks/[name].[contenthash:8].mjs";
    }
    return config;
  },
};

export default nextConfig;
