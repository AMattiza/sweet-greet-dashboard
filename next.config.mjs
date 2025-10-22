/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // wichtig: deaktiviert SWC-Minify, um ES2020-Syntax zu vermeiden
  swcMinify: false,

  // zwingt Next, alles in CJS-kompatiblem Modus zu bauen
  experimental: {
    esmExternals: false
  },

  // iFrame-Header freigeben (Softr-Einbettung)
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "ALLOWALL" }
      ]
    }
  ]
};

export default nextConfig;
