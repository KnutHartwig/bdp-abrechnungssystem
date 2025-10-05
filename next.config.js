/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Compiler deaktiviert (benötigt babel-plugin-react-compiler)
  // experimental: {
  //   reactCompiler: true,
  // },
  
  // Turbopack für schnelleres Dev
  // (wird automatisch mit --turbopack flag verwendet)
  
  // Output-Optionen
  output: 'standalone',
  
  // Image-Optimierung
  images: {
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Sicherheits-Header
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
    ];
  },
  
  // Webpack-Konfiguration für Puppeteer
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        puppeteer: 'puppeteer',
      });
    }
    return config;
  },
};

export default nextConfig;
