import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import {
  extname,
  isAbsolute,
  join,
  normalize,
  relative as relativePath,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../dist", import.meta.url)));
const port = Number.parseInt(process.env.PORT ?? "3001", 10);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".mp4", "video/mp4"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

function resolveStaticPath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const requestedPath = normalize(decoded).replace(/^([/\\])+/, "");
  const candidate = resolve(root, requestedPath);
  const fromRoot = relativePath(root, candidate);

  if (fromRoot === ".." || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot)) {
    return null;
  }

  if (existsSync(candidate) && statSync(candidate).isFile()) {
    return candidate;
  }

  const indexFile = join(candidate, "index.html");
  if (existsSync(indexFile) && statSync(indexFile).isFile()) {
    return indexFile;
  }

  return null;
}

function sendFile(response, filePath, method) {
  response.statusCode = 200;
  response.setHeader(
    "Content-Type",
    contentTypes.get(extname(filePath).toLowerCase()) ?? "application/octet-stream",
  );

  if (method === "HEAD") {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
}

const server = createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.statusCode = 405;
    response.setHeader("Allow", "GET, HEAD");
    response.end("Method Not Allowed");
    return;
  }

  try {
    const url = new URL(request.url ?? "/", "http://localhost");
    const staticFile = resolveStaticPath(url.pathname);

    if (staticFile) {
      sendFile(response, staticFile, request.method);
      return;
    }

    // SPA history fallback: unknown client-side routes hydrate from the app shell.
    sendFile(response, join(root, "index.html"), request.method);
  } catch {
    response.statusCode = 400;
    response.end("Bad Request");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Portfolio SPA listening on http://0.0.0.0:${port}`);
});
