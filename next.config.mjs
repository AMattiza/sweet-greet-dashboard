/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  swcMinify: false,

  experimental: {
    esmExternals: false
  },

  compiler: {
    removeConsole: false,
    styledComponents: true
  },

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
