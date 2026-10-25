// Host half: serve the static canvas page under /workflow-canvas/ plus one
// diagnostic endpoint used while wiring the client half.
// Fail-safe: any error is swallowed so we never crash the DSH host.
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const webDir = normalize(join(here, "..", "web"));
const BASE = "/workflow-canvas";
const PACKAGE = "dsh-workflow-canvas";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
};

async function trySend(res, abs) {
  try {
    const s = await stat(abs);
    if (!s.isFile()) return false;
    res.writeHead(200, {
      "content-type": MIME[extname(abs).toLowerCase()] ?? "application/octet-stream",
      "content-length": s.size,
      "cache-control": "no-cache",
    });
    res.end(await readFile(abs));
    return true;
  } catch {
    return false;
  }
}

/** Everything the client-modules service can tell us about our own row. */
function diagnose(ctx) {
  const out = { package: PACKAGE, at: new Date().toISOString() };
  try {
    const cm = ctx.get("clientModules");
    if (!cm) return { ...out, error: "clientModules service missing" };
    out.clientPath = typeof cm.clientPath === "function" ? cm.clientPath(PACKAGE) : undefined;
    out.baseline = typeof cm.artifactBaseline === "function" ? cm.artifactBaseline(PACKAGE) : undefined;
    if (typeof cm.graph === "function") {
      const graph = cm.graph();
      out.release = graph?.release;
      const rows = Array.isArray(graph?.entries) ? graph.entries : Array.isArray(graph?.rows) ? graph.rows : [];
      out.totalRows = rows.length;
      out.ownRows = rows.filter((row) => JSON.stringify(row).includes("workflow-canvas"));
      const topKeys = graph && typeof graph === "object" ? Object.keys(graph) : [];
      out.graphKeys = topKeys;
    }
  } catch (e) {
    out.error = String(e?.stack ?? e);
  }
  return out;
}

function makeHandler(ctx) {
  return async function handler(req, res) {
    try {
      const url = new URL(req.url ?? "/", "http://dsh.internal");
      const rest = decodeURIComponent(url.pathname.slice(BASE.length));
      if (rest === "/api/diag") {
        const body = JSON.stringify(diagnose(ctx), null, 2);
        res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-cache" });
        res.end(body);
        return;
      }
      const want = rest === "" || rest === "/" ? "/index.html" : rest;
      const abs = normalize(join(webDir, want));
      if (abs !== webDir && !abs.startsWith(webDir + sep)) {
        res.writeHead(403, { "content-type": "text/plain" });
        res.end("forbidden");
        return;
      }
      const ok = await trySend(res, abs);
      if (!ok) await trySend(res, join(webDir, "index.html"));
    } catch (e) {
      try {
        res.writeHead(500, { "content-type": "text/plain" });
        res.end("workflow-canvas: " + (e?.message ?? "error"));
      } catch {}
    }
  };
}

export const name = "dsh-workflow-canvas";
export const inject = ["webServer"];

export function apply(ctx) {
  try {
    const ws = ctx.get("webServer");
    if (!ws || typeof ws.register !== "function") {
      console.warn("[workflow-canvas] webServer not available; host route skipped");
      return;
    }
    ws.register({ kind: "prefix", path: BASE, handler: makeHandler(ctx) });
  } catch (e) {
    console.warn("[workflow-canvas] host route registration failed:", e?.message ?? e);
  }
}
