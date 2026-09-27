import fs from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { chromium } from "@playwright/test";

const baselineBase = process.env.BASELINE_URL || "http://127.0.0.1:3100";
const candidateBase = process.env.CANDIDATE_URL || "http://127.0.0.1:3001";
const outDir = process.env.VISUAL_OUT || "visual-parity";
const maxDiffRatio = Number(process.env.MAX_VISUAL_DIFF_RATIO || "0.005");

const routes = [
  "/",
  "/about/",
  "/projects/",
  "/projects/sensio-notes/",
  "/blog/",
  "/blog/building-iotnet/",
  "/certifications/",
  "/gallery/",
];

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 412, height: 915 },
];

fs.mkdirSync(outDir, { recursive: true });

function safeName(route) {
  return route === "/" ? "home" : route.replace(/^\//, "").replace(/\/$/, "").replaceAll("/", "-");
}

async function capture(page, url, target) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    localStorage.removeItem("theme");
    document.documentElement.dataset.theme = "light";
  });
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.screenshot({ path: target, fullPage: true, animations: "disabled" });
}

const browser = await chromium.launch();
let failed = false;

try {
  for (const viewport of viewports) {
    const baselineContext = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      colorScheme: "light",
      reducedMotion: "reduce",
      deviceScaleFactor: 1,
    });
    const candidateContext = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      colorScheme: "light",
      reducedMotion: "reduce",
      deviceScaleFactor: 1,
    });

    const baselinePage = await baselineContext.newPage();
    const candidatePage = await candidateContext.newPage();

    for (const route of routes) {
      const name = `${viewport.name}-${safeName(route)}`;
      const baselinePath = path.join(outDir, `${name}-baseline.png`);
      const candidatePath = path.join(outDir, `${name}-candidate.png`);
      const diffPath = path.join(outDir, `${name}-diff.png`);

      await capture(baselinePage, baselineBase + route, baselinePath);
      await capture(candidatePage, candidateBase + route, candidatePath);

      const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
      const candidate = PNG.sync.read(fs.readFileSync(candidatePath));

      if (baseline.width !== candidate.width || baseline.height !== candidate.height) {
        console.error(
          `[visual] ${name}: dimensions differ baseline=${baseline.width}x${baseline.height} candidate=${candidate.width}x${candidate.height}`,
        );
        failed = true;
        continue;
      }

      const diff = new PNG({ width: baseline.width, height: baseline.height });
      const changed = pixelmatch(
        baseline.data,
        candidate.data,
        diff.data,
        baseline.width,
        baseline.height,
        { threshold: 0.1, includeAA: false },
      );
      const total = baseline.width * baseline.height;
      const ratio = changed / total;
      fs.writeFileSync(diffPath, PNG.sync.write(diff));

      console.log(
        `[visual] ${name}: changed=${changed}/${total} ratio=${(ratio * 100).toFixed(4)}%`,
      );

      if (ratio > maxDiffRatio) {
        console.error(
          `[visual] ${name}: exceeds allowed ${(maxDiffRatio * 100).toFixed(2)}%`,
        );
        failed = true;
      }
    }

    await baselineContext.close();
    await candidateContext.close();
  }
} finally {
  await browser.close();
}

if (failed) process.exit(1);
