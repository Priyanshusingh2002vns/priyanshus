/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats:['image/avif' , 'image/webp'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "preqty.webninjaz.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "preqty.webninjaz.com",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
          { key: "Content-Encoding", value: "identity" }
        ]
      },
      {
        source: "/.well-known/assetlinks.json",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
          { key: "Access-Control-Allow-Origin", value: "*" }
        ]
      }
    ];
  },

  async rewrites() {
    return [
      {
        source: "/.well-known/:path*",
        destination: "/.well-known/:path*"
      }
    ];
  }
};

export default nextConfig;
