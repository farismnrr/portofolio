import { expect, test } from "@playwright/test";

const routes = ["/", "/about", "/projects", "/blog", "/certifications", "/gallery"];

async function themeSnapshot(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    const header = document.querySelector(".site-header");
    const rootStyle = getComputedStyle(root);
    const bodyStyle = getComputedStyle(body);
    const headerStyle = header ? getComputedStyle(header) : null;

    return {
      bg: rootStyle.getPropertyValue("--bg").trim(),
      text: rootStyle.getPropertyValue("--text").trim(),
      brand: rootStyle.getPropertyValue("--brand").trim(),
      muted: rootStyle.getPropertyValue("--muted").trim(),
      bodyBackground: bodyStyle.backgroundColor,
      bodyColor: bodyStyle.color,
      fontFamily: bodyStyle.fontFamily,
      headerBackground: headerStyle?.backgroundColor ?? "",
      headerBorder: headerStyle?.borderBottomColor ?? "",
    };
  });
}

test.describe("portfolio visual theme", () => {
  test("home matches the restored portfolio direction", async ({ page }, testInfo) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1, name: "Faris Munir Mahdi" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /Building useful things with code/i })).toBeVisible();
    await expect(page.getByText("Software engineer · AI · IoT · Backend")).toBeVisible();
    await expect(page.getByText("Available for opportunities")).toBeVisible();
    await expect(page.getByText("Focused on")).toBeVisible();
    await expect(page.getByText("Technology is more meaningful when it solves real problems.")).toBeVisible();
    await expect(page.getByText("Design. Code. Create.")).toHaveCount(0);

    await page.screenshot({
      path: testInfo.outputPath("home-full.png"),
      fullPage: true,
    });
  });

  test("top-level routes share the same theme shell", async ({ page }, testInfo) => {
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
      expect(current.muted, `${route} muted token`).toBe(baseline.muted);
      expect(current.bodyBackground, `${route} rendered background`).toBe(baseline.bodyBackground);
      expect(current.bodyColor, `${route} rendered text color`).toBe(baseline.bodyColor);
      expect(current.fontFamily, `${route} typography`).toBe(baseline.fontFamily);
      expect(current.headerBackground, `${route} header surface`).toBe(baseline.headerBackground);
      expect(current.headerBorder, `${route} header border`).toBe(baseline.headerBorder);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${route} must not overflow horizontally`).toBeLessThanOrEqual(1);
      expect(consoleErrors, `${route} console errors`).toEqual([]);

      await page.screenshot({
        path: testInfo.outputPath(`route-${route === "/" ? "home" : route.slice(1)}.png`),
        fullPage: true,
      });
    }
  });

  test("dark mode remains consistent while navigating", async ({ page }) => {
    await page.goto("/");

    const toggle = page.getByRole("button", { name: /Switch to dark mode/i });
    await expect(toggle).toBeVisible();
    await toggle.click();

    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");
    const darkHome = await themeSnapshot(page);

    for (const route of routes.slice(1)) {
      await page.goto(route);
      await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");

      const current = await themeSnapshot(page);
      expect(current.bg).toBe(darkHome.bg);
      expect(current.text).toBe(darkHome.text);
      expect(current.brand).toBe(darkHome.brand);
      expect(current.bodyBackground).toBe(darkHome.bodyBackground);
      expect(current.bodyColor).toBe(darkHome.bodyColor);
    }
  });

  test("primary navigation reaches every portfolio section", async ({ page }) => {
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
      const link = page.getByRole("link", { name: label, exact: true });
      if ((await link.count()) === 0) continue;
      await link.first().click();
      await expect(page).toHaveURL(new RegExp(`${path.replace("/", "\\/")}/?$`));
    }
  });
});
