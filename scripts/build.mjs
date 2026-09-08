import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "vite";

const root = process.cwd();
const dist = path.join(root, "dist");
const ssrDir = path.join(root, ".ssr");
fs.rmSync(dist, { recursive: true, force: true });
fs.rmSync(ssrDir, { recursive: true, force: true });

await build({ root });
await build({
  root,
  build: {
    ssr: "src/entry-server.ts",
    outDir: ".ssr",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: { output: { entryFileNames: "entry-server.js" } },
  },
});

const server = await import(
  `${pathToFileURL(path.join(ssrDir, "entry-server.js")).href}?t=${Date.now()}`
);
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

async function writeRoute(route, outputPath) {
  const { html, head } = await server.render(route);
  const page = template.replace("<!--app-head-->", head).replace("<!--app-html-->", html);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, page);
}

for (const route of server.staticRoutes) {
  const output =
    route === "/" ? path.join(dist, "index.html") : path.join(dist, route.slice(1), "index.html");
  await writeRoute(route, output);
}
await writeRoute("/404", path.join(dist, "404.html"));

const base = "https://farismnrr.com";
const urls = server.staticRoutes.map((route) => `${base}${route === "/" ? "" : route}`);
fs.writeFileSync(
  path.join(dist, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`,
);
fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}\n</urlset>\n`,
);
fs.rmSync(ssrDir, { recursive: true, force: true });
console.log(`static build complete: ${server.staticRoutes.length} routes + 404 -> dist/`);
