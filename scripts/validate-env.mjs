const productionDeployment =
  process.env.REQUIRE_PRODUCTION_ENV === "true" ||
  (process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production");

if (!productionDeployment) {
  process.exit(0);
}

const required = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "XENDIT_SECRET_KEY",
  "XENDIT_WEBHOOK_TOKEN",
  "XENDIT_BUSINESS_ID",
  "SUPPORT_EMAIL",
  "CRON_SECRET",
];
const missing = required.filter((name) => !process.env[name]?.trim());
const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

if (process.env.BILLING_ENABLED !== "true") {
  missing.push("BILLING_ENABLED=true");
}
if (appUrl && !appUrl.startsWith("https://")) {
  missing.push("NEXT_PUBLIC_APP_URL must use HTTPS");
}
if (missing.length) {
  console.error(`Production deployment blocked. Missing or invalid configuration: ${missing.join(", ")}`);
  process.exit(1);
}
