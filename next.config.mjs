/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false, // verhindert fehlerhafte Minifizierung
  compress: true,
  experimental: { esmExternals: false },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "ALLOWALL" },
        { key: "Content-Encoding", value: "" } // verhindert doppelte Brotli-Angabe
      ]
    }
  ]
};
export default nextConfig;
