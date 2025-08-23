/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        // allow embedding as iframe
        { key: "X-Frame-Options", value: "ALLOWALL" }
      ]
    }
  ]
};
export default nextConfig;
