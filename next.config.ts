import type {NextConfig} from "next";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://api.xendit.co",
  ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  {key: "Content-Security-Policy", value: csp},
  {key: "Referrer-Policy", value: "strict-origin-when-cross-origin"},
  {key: "X-Content-Type-Options", value: "nosniff"},
  {key: "X-Frame-Options", value: "DENY"},
  {key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)"},
  ...(process.env.NODE_ENV === "production"
    ? [{key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload"}]
    : []),
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  poweredByHeader: false,
  async headers() {
    const privateHeaders = [{key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate"}];
    return [
      {source: "/(.*)", headers: securityHeaders},
      {source: "/app/:path*", headers: privateHeaders},
      {source: "/account/:path*", headers: privateHeaders},
      {source: "/billing/:path*", headers: privateHeaders},
      {source: "/admin/:path*", headers: privateHeaders},
      {source: "/auth/:path*", headers: privateHeaders},
    ];
  },
};

export default nextConfig;
