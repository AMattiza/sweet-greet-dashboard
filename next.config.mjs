/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  compress: true,
  experimental: { esmExternals: false },

  // 👉 Erzwingt neue Build-ID bei jedem Deploy
  generateBuildId: async () =>
    `build-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

  // 👉 Deaktiviert Browser- und CDN-Caching vollständig
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "X-Frame-Options", value: "ALLOWALL" },
          { key: "Content-Encoding", value: "" },
        ],
      },
    ];
  },
};

export default nextConfig;
