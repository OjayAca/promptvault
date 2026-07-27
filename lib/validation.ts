const PH_MOBILE = /^\+639\d{9}$/;

export function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

export function normalizePhilippineMobile(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const compact = value.replace(/[\s()-]/g, "");
  const normalized = compact.startsWith("09") ? `+63${compact.slice(1)}` : compact;
  return PH_MOBILE.test(normalized) ? normalized : null;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function positiveIntegerId(value: string) {
  return /^\d+$/.test(value) && Number(value) > 0 ? Number(value) : null;
}

export function addCalendarMonth(date: Date) {
  const result = new Date(date);
  const originalDay = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + 1);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(originalDay, lastDay));
  return result;
}
