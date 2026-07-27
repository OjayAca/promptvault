import {expect, test} from "@playwright/test";

test("visitor can browse the truthful launch catalog without receiving premium bodies", async ({page, request}) => {
  const response = await page.goto("/");
  await expect(page.getByRole("heading", {name: /AI Prompt Library/i})).toBeVisible();
  await expect(page.getByText("13", {exact: true}).first()).toBeVisible();
  await expect(page.getByText("Launch Prompts", {exact: true}).first()).toBeVisible();
  await expect(page.getByRole("heading", {name: "30-Day Content Calendar"}).first()).toBeVisible();
  await expect(page.getByRole("button", {name: "Locked"}).first()).toBeDisabled();

  const html = await response?.text();
  expect(html).not.toContain("Create a 30-day social media content calendar for");

  const health = await request.get("/api/health");
  expect(health.ok()).toBe(true);
  expect(health.headers()["x-content-type-options"]).toBe("nosniff");
});

test("auth recovery and legal pages are reachable", async ({page}) => {
  await page.goto("/signup");
  await expect(page.getByRole("heading", {name: "Create your account"})).toBeVisible();
  await expect(page.getByLabel("Full name")).toBeVisible();

  await page.goto("/login");
  await page.getByRole("link", {name: "Forgot your password?"}).click();
  await expect(page.getByRole("heading", {name: /Reset your password/i})).toBeVisible();

  for (const path of ["/privacy", "/terms", "/cancellation-refunds", "/support"]) {
    const response = await page.goto(path);
    expect(response?.ok()).toBe(true);
  }
});
