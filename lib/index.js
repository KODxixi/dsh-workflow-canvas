// Host half: serve the standalone canvas app over the DSH web carrier.
// Served at /workflow-canvas/ (deliberately outside /plugins/<id>, which is the
// client-bundle route owned by clientModules).
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webDir = resolve(here, "..", "web");
const BASE = "/workflow-canvas";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
};

export const name = "dsh-workflow-canvas";
export const inject = ["webServer"];

export function apply(ctx) {
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: "prefix",
        path: BASE,
        handler: async (req, res) => {
          try {
            const url = new URL(req.url ?? "/", "http://local");
            let rel = decodeURIComponent(url.pathname.slice(BASE.length));
            if (rel === "" || rel === "/") rel = "/index.html";
            const file = resolve(webDir, "." + rel);
            // Path traversal guard: the resolved file must stay inside web/.
            if (file !== webDir && !file.startsWith(webDir + sep)) {
              res.statusCode = 403;
              res.end("Forbidden");
              return;
            }
            const info = await stat(file);
            if (!info.isFile()) throw new Error("not a file");
            res.statusCode = 200;
            res.setHeader("content-type", MIME[extname(file).toLowerCase()] ?? "application/octet-stream");
            res.setHeader("content-length", String(info.size));
            res.setHeader("cache-control", "no-store");
            createReadStream(file).pipe(res);
          } catch {
            res.statusCode = 404;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("Not found");
          }
        },
      }),
    "workflow-canvas: static app route",
  );
}
