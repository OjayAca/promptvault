import {describe, expect, it} from "vitest";
import {safeNextPath} from "@/lib/http";
import {addCalendarMonth, normalizePhilippineMobile} from "@/lib/validation";

describe("profile validation", () => {
  it("normalizes local Philippine mobile numbers", () => {
    expect(normalizePhilippineMobile("0917 123 4567")).toBe("+639171234567");
    expect(normalizePhilippineMobile("+639171234567")).toBe("+639171234567");
    expect(normalizePhilippineMobile("+12025550123")).toBeNull();
  });

  it("adds one calendar month without overflowing month-end", () => {
    expect(addCalendarMonth(new Date("2028-01-31T10:00:00Z")).toISOString()).toBe("2028-02-29T10:00:00.000Z");
  });
});

describe("safe redirects", () => {
  it("allows internal paths with query parameters", () => {
    expect(safeNextPath("/billing?checkout=success")).toBe("/billing?checkout=success");
  });

  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)"])(
    "rejects external or ambiguous redirect %s",
    (value) => expect(safeNextPath(value)).toBe("/app"),
  );
});
