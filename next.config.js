/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Erhöhte Limits für File-Uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // API Route Config
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '25mb',
  },

  // Webpack Config für Puppeteer
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        puppeteer: 'commonjs puppeteer',
      });
    }
    return config;
  },

  // Umgebungsvariablen die im Client verfügbar sein sollen
  env: {
    NEXT_PUBLIC_APP_NAME: 'BdP Abrechnungssystem',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
};

module.exports = nextConfig;
