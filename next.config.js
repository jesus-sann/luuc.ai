/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

// Allowed origins for CORS (production should be explicit)
const allowedOrigins = process.env.NEXT_PUBLIC_APP_URL || 'https://luuc.ai';

// CSP configuration - stricter in production
const cspConfig = {
  development: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requiere en dev
    "style-src 'self' 'unsafe-inline'", // Tailwind requiere unsafe-inline
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.anthropic.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ],
  production: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // Remove unsafe-eval in production
    "style-src 'self' 'unsafe-inline'", // Tailwind still needs this
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://api.stripe.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https://checkout.stripe.com",
    "upgrade-insecure-requests", // Force HTTPS for all resources
  ],
};

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },

  // ============================================================================
  // SECURITY HEADERS
  // ============================================================================
  async headers() {
    return [
      // ============================================================================
      // CORS Configuration for API routes
      // ============================================================================
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: isDev ? '*' : allowedOrigins,
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400', // 24 hours
          },
        ],
      },
      // ============================================================================
      // Security Headers for all routes
      // ============================================================================
      {
        source: '/:path*',
        headers: [
          {
            // Content Security Policy (CSP)
            // Stricter in production, allows unsafe-eval in development
            key: 'Content-Security-Policy',
            value: (isDev ? cspConfig.development : cspConfig.production).join('; '),
          },
          {
            // Previene ataques de clickjacking
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Fuerza HTTPS en producción
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            // Previene MIME type sniffing
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Habilita protección XSS del navegador
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            // Controla qué información del Referer se envía
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Permissions Policy (anteriormente Feature Policy)
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'payment=()',
              'usb=()',
              'magnetometer=()',
            ].join(', '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
