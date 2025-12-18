/** @type {import('next').NextConfig} */
const nextConfig = {
  // Görsel optimizasyonu için FAL AI domain'ini ekleyin
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fal.media',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.fal.media',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'queue.fal.run',
        pathname: '/**',
      },
    ],
    // Daha iyi performans için
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
  },

  // CORS Headers - ÇOK ÖNEMLİ!
  async headers() {
    const securityHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'off',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      // 🆕 CORS Headers - FAL AI görselleri için
      {
        key: 'Access-Control-Allow-Origin',
        value: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000' 
          : 'https://yourdomain.com', // Production domain'iniz
      },
      {
        key: 'Access-Control-Allow-Methods',
        value: 'GET, POST, PUT, DELETE, OPTIONS',
      },
      {
        key: 'Access-Control-Allow-Headers',
        value: 'Content-Type, Authorization, X-Requested-With',
      },
      {
        key: 'Access-Control-Allow-Credentials',
        value: 'true',
      },
    ];

    if (process.env.NODE_ENV === 'production') {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      });
    }

    return [
      {
        // Tüm rotalar için
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // API rotaları için ek CORS headers
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      {
        // Proxy image endpoint için özel headers
        source: '/api/proxy/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=3600' },
        ],
      },
    ];
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // 🆕 Rewrites - Görseller için proxy (alternatif çözüm)
  async rewrites() {
    return [
      {
        source: '/fal-image/:path*',
        destination: 'https://fal.media/:path*',
      },
      {
        source: '/fal-queue/:path*',
        destination: 'https://queue.fal.run/:path*',
      },
    ];
  },

  // 🆕 React Strict Mode (geliştirme sırasında yardımcı olur)
  reactStrictMode: true,

  // 🆕 Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;