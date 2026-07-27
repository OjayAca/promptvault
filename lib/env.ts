const LOCAL_APP_URL = "http://localhost:3000";

function value(name: string) {
  return process.env[name]?.trim() || null;
}

export function getAppUrl() {
  const configured = value("NEXT_PUBLIC_APP_URL");

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_APP_URL is required in production.");
  }

  return LOCAL_APP_URL;
}

export function getSupabaseConfig() {
  const url = value("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = value("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return url && anonKey ? {url, anonKey} : null;
}

export function getSupabaseServiceConfig() {
  const config = getSupabaseConfig();
  const serviceRoleKey = value("SUPABASE_SERVICE_ROLE_KEY");

  return config && serviceRoleKey ? {...config, serviceRoleKey} : null;
}

export function getXenditConfig() {
  if (value("BILLING_ENABLED") !== "true") {
    return null;
  }

  const secretKey = value("XENDIT_SECRET_KEY");
  const webhookToken = value("XENDIT_WEBHOOK_TOKEN");
  const businessId = value("XENDIT_BUSINESS_ID");

  if (!secretKey || !webhookToken || !businessId) {
    return null;
  }

  return {
    secretKey,
    webhookToken,
    businessId,
    apiVersion: value("XENDIT_API_VERSION") ?? "2026-01-01",
  };
}

export function getSupportEmail() {
  return value("SUPPORT_EMAIL") ?? "support@promptvault.ph";
}

export function getCronSecret() {
  return value("CRON_SECRET");
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseConfig());
}

export function isBillingEnabled() {
  return Boolean(getXenditConfig());
}

export function getReadiness() {
  const missing: string[] = [];

  if (!value("NEXT_PUBLIC_APP_URL")) missing.push("NEXT_PUBLIC_APP_URL");
  if (!value("NEXT_PUBLIC_SUPABASE_URL")) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!value("NEXT_PUBLIC_SUPABASE_ANON_KEY")) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!value("SUPABASE_SERVICE_ROLE_KEY")) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!value("SUPPORT_EMAIL")) missing.push("SUPPORT_EMAIL");

  if (value("BILLING_ENABLED") === "true") {
    if (!value("XENDIT_SECRET_KEY")) missing.push("XENDIT_SECRET_KEY");
    if (!value("XENDIT_WEBHOOK_TOKEN")) missing.push("XENDIT_WEBHOOK_TOKEN");
    if (!value("XENDIT_BUSINESS_ID")) missing.push("XENDIT_BUSINESS_ID");
    if (!value("CRON_SECRET")) missing.push("CRON_SECRET");
  }

  return {ready: missing.length === 0, missing, billingEnabled: value("BILLING_ENABLED") === "true"};
}
