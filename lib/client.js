// Client half: a "智能体编排" tab inside dsh-better-sidebar's right column.
// The tab hosts the canvas page and feeds it the live Session tree; a session
// header button opens/focuses that same tab.

// One-shot repair: an earlier build registered a native right-sidebar tab kind
// and the persisted layout can still name it, which leaves the column blank.
// Drop the saved layout once (it only holds tab arrangement) and reload.
try {
  if (typeof localStorage !== "undefined" && !localStorage.getItem("wc-layout-reset-v1")) {
    const stale = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.indexOf("dsh.sidebar-right.v1.") === 0) stale.push(key);
    }
    localStorage.setItem("wc-layout-reset-v1", "1");
    if (stale.length > 0) {
      for (const key of stale) localStorage.removeItem(key);
      location.reload();
    }
  }
} catch {}

try {
  const send = (step, data) => {
    try {
      fetch("/workflow-canvas/api/log", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ step, ...(data || {}) }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  };

  send("bundle-executed", { loader: !!window.__ModuleLoader__ });

  window.__ModuleLoader__.load({
    id: "dsh-workflow-canvas",
    factory: (require) => {
      const react = require("react");
      const h = react.createElement;
      const TAB_ID = "workflow-canvas";

      const STATUS = {
        done: { word: "已完成", tone: "ok" },
        running: { word: "进行中", tone: "run" },
        idle: { word: "待命", tone: "idle" },
        error: { word: "阻塞", tone: "err" },
        queued: { word: "排队", tone: "idle" },
        blocked: { word: "阻塞", tone: "err" },
      };

      const shortDir = (cwd) => {
        if (typeof cwd !== "string" || cwd === "") return "";
        return cwd.split(/[\\/]/).filter(Boolean).slice(-2).join("/");
      };

      /* ── live graph from the Session tree ───────────────── */
      function buildGraph(ctx, sessionId) {
        try {
          const list = ctx.sessions?.list;
          const snap = list?.getSnapshot?.();
          if (!snap) return null;
          const raw = snap.byId;
          const all = raw instanceof Map ? [...raw.values()] : Object.values(raw ?? {});
          if (all.length === 0) return null;
          const bySession = new Map(all.map((s) => [s.id, s]));

          let rootId = sessionId && bySession.has(sessionId) ? sessionId : all[0].id;
          for (let i = 0; i < 32 && bySession.get(rootId)?.parentId; i++) rootId = bySession.get(rootId).parentId;

          const kids = new Map();
          for (const s of all) {
            if (!s.parentId) continue;
            if (!kids.has(s.parentId)) kids.set(s.parentId, []);
            kids.get(s.parentId).push(s);
          }

          const order = [];
          const seen = new Set();
          const queue = [rootId];
          while (queue.length) {
            const id = queue.shift();
            if (seen.has(id)) continue;
            seen.add(id);
            const s = bySession.get(id);
            if (s) order.push(s);
            for (const kid of kids.get(id) || []) queue.push(kid.id);
          }

          const depthOf = (s) => {
            let depth = 0;
            let cur = s;
            while (cur?.parentId && depth < 32) {
              depth += 1;
              cur = bySession.get(cur.parentId);
            }
            return depth;
          };

          const levels = new Map();
          for (const s of order) {
            const depth = depthOf(s);
            if (!levels.has(depth)) levels.set(depth, []);
            levels.get(depth).push(s);
          }

          const nodes = [];
          const edges = [];
          const COL = 300;
          const ROW = 190;
          for (const [depth, items] of [...levels.entries()].sort((a, b) => a[0] - b[0])) {
            items.forEach((s, index) => {
              const leaf = !(kids.get(s.id) || []).length;
              nodes.push({
                id: s.id,
                role: depth === 0 ? "input" : leaf ? "output" : "exec",
                exec: "builder",
                name: s.displayTitle || String(s.id).slice(0, 8),
                status: s.running ? "running" : "done",
                x: 260 + (index - (items.length - 1) / 2) * COL,
                y: 120 + depth * ROW,
                icon: depth === 0 ? "download" : leaf ? "upload" : "code",
                msg: shortDir(s.cwd),
                tools: [],
                tokens: "",
                time: "",
                files: 0,
                tasks: [],
              });
            });
          }
          for (const s of order) {
            if (!s.parentId || !seen.has(s.parentId)) continue;
            edges.push({ id: `e${edges.length + 1}`, from: s.parentId, to: s.id, label: "委派", payload: "" });
          }

          const root = bySession.get(rootId);
          const now = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
          return {
            meta: {
              title: root?.displayTitle || "当前会话",
              subtitle: "DSH 实时执行图 · 随会话变化",
              session: String(rootId).slice(0, 8),
              run: now,
              updated: now,
            },
            status: STATUS,
            nodes,
            edges,
            flow: edges.map((e) => e.id),
          };
        } catch (e) {
          send("graph-err", { error: String(e?.message ?? e) });
          return null;
        }
      }

      /* ── tab body ───────────────────────────────────────── */
      const CanvasTab = (props) => {
        const frameRef = react.useRef(null);
        const sessionId = props?.scope?.sessionId ?? "";
        react.useEffect(() => {
          let alive = true;
          const post = () => {
            if (!alive) return;
            const frame = frameRef.current;
            if (!frame || !frame.contentWindow) return;
            const graph = buildGraph(props.ctx, sessionId);
            if (!graph) return;
            try {
              frame.contentWindow.postMessage({ type: "wc-graph", graph }, "*");
              send("graph-posted", { nodes: graph.nodes.length, edges: graph.edges.length });
            } catch (e) {
              send("graph-post-err", { error: String(e?.message ?? e) });
            }
          };
          const onMessage = (event) => {
            if (event?.data?.type === "wc-ready") post();
          };
          window.addEventListener("message", onMessage);
          const timer = setInterval(post, 2500);
          return () => {
            alive = false;
            window.removeEventListener("message", onMessage);
            clearInterval(timer);
          };
        }, [sessionId]);

        return h("iframe", {
          ref: frameRef,
          src: "/workflow-canvas/?live=1",
          title: "智能体编排画布",
          onLoad: () => {
            const frame = frameRef.current;
            if (!frame || !frame.contentWindow) return;
            const graph = buildGraph(props.ctx, sessionId);
            if (graph) frame.contentWindow.postMessage({ type: "wc-graph", graph }, "*");
          },
          style: { display: "block", width: "100%", height: "100%", border: "0", background: "#000" },
          allow: "clipboard-write",
        });
      };

      /* ── header button ──────────────────────────────────── */
      const GraphIcon = (props) => {
        const size = typeof props?.size === "number" ? props.size : 16;
        return h(
          "svg",
          { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true },
          h("circle", { cx: 3.5, cy: 8, r: 1.5, fill: "currentColor" }),
          h("circle", { cx: 12.5, cy: 3.5, r: 1.5, fill: "currentColor" }),
          h("circle", { cx: 12.5, cy: 12.5, r: 1.5, fill: "currentColor" }),
          h("path", { d: "M5 7.4 11 4.2M5 8.6l6 3.2", stroke: "currentColor", strokeWidth: 1.1, strokeLinecap: "round" }),
        );
      };

      const inject = ["slots", "sessions", "betterSidebar"];

      function apply(ctx) {
        send("apply-entered", {
          slots: typeof ctx?.slots,
          sessions: typeof ctx?.sessions,
          betterSidebar: typeof ctx?.betterSidebar,
        });

        try {
          ctx.effect(() => {
            const service = ctx.betterSidebar;
            if (!service || typeof service.registerTab !== "function") {
              send("tab-missing", {});
              return () => {};
            }
            const dispose = service.registerTab({
              id: TAB_ID,
              title: () => "智能体编排",
              description: () => "把当前会话的 agent 树画成可交互的节点图",
              icon: (size) => h(GraphIcon, { size }),
              order: 60,
              single: true,
              component: (tabProps) => h(CanvasTab, tabProps),
            });
            send("tab-ok", {});
            return typeof dispose === "function" ? dispose : () => {};
          }, "workflow-canvas: sidebar tab");
        } catch (e) {
          send("tab-err", { error: String(e?.message ?? e) });
        }

        try {
          const OpenAction = (props) => {
            const open = () => {
              try {
                const service = props?.ctx?.get?.("betterSidebar") ?? null;
                const scope = props?.sessionId ? { sessionId: props.sessionId } : undefined;
                service?.openTab?.({ type: TAB_ID }, scope);
                send("open-tab", {});
              } catch (e) {
                send("open-tab-err", { error: String(e?.message ?? e) });
              }
            };
            return h(
              "button",
              {
                type: "button",
                onClick: open,
                title: "智能体编排：在右侧栏打开",
                "aria-label": "智能体编排",
                style: {
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  height: 28,
                  padding: "0 9px",
                  borderRadius: 8,
                  border: "1px solid var(--dsw-alias-border-l2, #2a2a30)",
                  background: "transparent",
                  color: "var(--dsw-alias-label-secondary, #a1a1a9)",
                  font: "inherit",
                  fontSize: 12,
                  cursor: "pointer",
                },
              },
              h(GraphIcon, { size: 14 }),
              h("span", null, "编排"),
            );
          };

          ctx.effect(
            () =>
              ctx.slots.inject("conversation.session.header.actions", () =>
                ctx.slots.register({ name: "conversation.session.header.actions", id: "workflow-canvas-open", order: 40 }, OpenAction),
              ),
            "workflow-canvas: header button",
          );
          send("header-ok", {});
        } catch (e) {
          send("header-err", { error: String(e?.message ?? e) });
        }
      }

      return { apply, inject };
    },
  });
} catch (e) {
  try {
    fetch("/workflow-canvas/api/log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ step: "bundle-bootstrap-err", error: String(e?.message ?? e) }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
