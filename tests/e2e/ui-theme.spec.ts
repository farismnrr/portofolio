import { expect, test } from "@playwright/test";

const routes = ["/", "/about", "/projects", "/blog", "/certifications", "/gallery"];

async function themeSnapshot(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    const rootStyle = getComputedStyle(root);
    const bodyStyle = getComputedStyle(body);

    return {
      bg: rootStyle.getPropertyValue("--bg").trim(),
      text: rootStyle.getPropertyValue("--text").trim(),
      brand: rootStyle.getPropertyValue("--brand").trim(),
      bodyBackground: bodyStyle.backgroundColor,
      bodyColor: bodyStyle.color,
      fontFamily: bodyStyle.fontFamily,
    };
  });
}

test.describe("Sep 8 portfolio baseline", () => {
  test("home matches the Sep 8 hero", async ({ page }, testInfo) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Design.");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Code.");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Create.");
    await expect(page.getByText(/Software engineering · AI · IoT/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /About me/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /View projects/i })).toBeVisible();
    await expect(page.getByText("Selected work")).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath("sep8-home-full.png"),
      fullPage: true,
    });
  });

  test("all public routes render with one shared theme", async ({ page }, testInfo) => {
    let baseline;

    for (const route of routes) {
      const consoleErrors = [];
      page.removeAllListeners("console");
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });

      const response = await page.goto(route);
      expect(response?.ok(), `${route} should return a successful response`).toBeTruthy();

      await expect(page.locator(".site-header")).toBeVisible();
      await expect(page.locator(".site-footer")).toBeVisible();

      const current = await themeSnapshot(page);
      baseline ??= current;

      expect(current.bg, `${route} background token`).toBe(baseline.bg);
      expect(current.text, `${route} text token`).toBe(baseline.text);
      expect(current.brand, `${route} brand token`).toBe(baseline.brand);
      expect(current.bodyBackground, `${route} rendered background`).toBe(baseline.bodyBackground);
      expect(current.bodyColor, `${route} rendered text color`).toBe(baseline.bodyColor);
      expect(current.fontFamily, `${route} typography`).toBe(baseline.fontFamily);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${route} must not overflow horizontally`).toBeLessThanOrEqual(1);
      expect(consoleErrors, `${route} console errors`).toEqual([]);

      await page.screenshot({
        path: testInfo.outputPath(`route-${route === "/" ? "home" : route.slice(1)}.png`),
        fullPage: true,
      });
    }
  });

  test("theme switch persists across routes", async ({ page }) => {
    await page.goto("/");

    const toggle = page.getByRole("button", { name: /Switch to dark mode|Switch to light mode/i });
    await expect(toggle).toBeVisible();
    await toggle.click();

    const selectedTheme = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(["light", "dark"]).toContain(selectedTheme);

    await page.goto("/projects");
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.theme))
      .toBe(selectedTheme);
  });

  test("desktop navigation reaches every section", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });

    const destinations = [
      ["Home", "/"],
      ["About", "/about"],
      ["Projects", "/projects"],
      ["Blog", "/blog"],
      ["Certifications", "/certifications"],
      ["Gallery", "/gallery"],
    ];

    for (const [label, path] of destinations) {
      await page.goto("/");
      const link = page.getByRole("link", { name: label, exact: true }).first();
      await expect(link).toBeVisible();
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${path.replace("/", "\\/")}/?$`));
    }
  });
});
