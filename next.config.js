/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },

  // ============================================================================
  // SECURITY HEADERS
  // ============================================================================
  async headers() {
    return [
      {
        // Aplicar headers de seguridad a todas las rutas
        source: '/:path*',
        headers: [
          {
            // Content Security Policy (CSP)
            // Previene XSS, clickjacking, y otros ataques de inyección de código
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requiere unsafe-inline/eval en dev
              "style-src 'self' 'unsafe-inline'", // Tailwind requiere unsafe-inline
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://api.anthropic.com",
              "frame-ancestors 'none'", // Previene clickjacking
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
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
