import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const runtimeConfigPath = resolve(appRoot, "dist/runtime-config.js");

const agentationEnabled =
  String(process.env.AGENTATION_ENABLED ?? "false")
    .trim()
    .toLowerCase() === "true";

writeFileSync(
  runtimeConfigPath,
  `window.__PORTFOLIO_RUNTIME__ = ${JSON.stringify({ agentationEnabled })};\n`,
  "utf8",
);

await import("./serve-spa.mjs");
