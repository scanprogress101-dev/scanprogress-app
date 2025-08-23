/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/inbody",
        destination: "/api/inbodyapi",
      },
    ];
  },
};

module.exports = nextConfig;
