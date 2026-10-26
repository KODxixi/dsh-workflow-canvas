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

      /* ── live graph: subagent catalog, session tree as fallback ── */
      function buildGraph(ctx, sessionId) {
        try {
          const list = ctx.sessions?.list;
          const snap = list?.getSnapshot?.();
          if (!snap) return null;
          const raw = snap.byId;
          const byId = raw instanceof Map ? new Map(raw) : new Map(Object.entries(raw ?? {}));
          if (byId.size === 0) return null;

          let rootId = sessionId && byId.has(sessionId) ? sessionId : [...byId.keys()][0];
          for (let i = 0; i < 32 && byId.get(rootId)?.parentId; i++) rootId = byId.get(rootId).parentId;

          const projections = snap.projectionsBySession;
          const catalogOf = (id) => {
            const entry = projections instanceof Map ? projections.get(id) : (projections ?? {})[id];
            const rows = entry?.values?.subagentCatalog;
            if (!Array.isArray(rows)) return [];
            return rows.slice().sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
          };

          const nodes = [];
          const edges = [];
          const seen = new Set();
          const depth = new Map([[rootId, 0]]);
          const queue = [rootId];

          const push = (id, d, extra) => {
            const s = byId.get(id) || {};
            nodes.push({
              id,
              role: d === 0 ? "input" : "exec",
              exec: "builder",
              name: s.displayTitle || String(id).slice(0, 8),
              status: s.running ? "running" : "done",
              x: 0,
              y: 0,
              icon: d === 0 ? "download" : "code",
              msg: shortDir(s.cwd),
              tools: [],
              tokens: "",
              time: "",
              files: 0,
              tasks: [],
              ...(extra || {}),
            });
          };

          while (queue.length) {
            const id = queue.shift();
            if (seen.has(id)) continue;
            seen.add(id);
            const d = depth.get(id) ?? 0;
            push(id, d);
            for (const child of catalogOf(id)) {
              if (!child || !child.id) continue;
              edges.push({ id: `e${edges.length + 1}`, from: id, to: child.id, label: "委派", payload: "" });
              if (!depth.has(child.id)) depth.set(child.id, d + 1);
              queue.push(child.id);
            }
          }

          // 没有子代理目录时退回会话父子树，保证页面不空
          if (edges.length === 0) {
            const kids = new Map();
            for (const s of byId.values()) {
              if (!s.parentId) continue;
              if (!kids.has(s.parentId)) kids.set(s.parentId, []);
              kids.get(s.parentId).push(s);
            }
            nodes.length = 0;
            const seen2 = new Set();
            const q2 = [rootId];
            const depth2 = new Map([[rootId, 0]]);
            while (q2.length) {
              const id = q2.shift();
              if (seen2.has(id)) continue;
              seen2.add(id);
              const d = depth2.get(id) ?? 0;
              push(id, d);
              for (const kid of kids.get(id) || []) {
                edges.push({ id: `e${edges.length + 1}`, from: id, to: kid.id, label: "派生", payload: "" });
                if (!depth2.has(kid.id)) depth2.set(kid.id, d + 1);
                q2.push(kid.id);
              }
            }
          }

          const root = byId.get(rootId);
          const now = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
          return {
            meta: {
              title: root?.displayTitle || "当前会话",
              subtitle: "DSH 实时执行图 · 子代理树",
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
        const sessionId = props?.scope?.sessionId ?? "";
        const [src, setSrc] = react.useState("/workflow-canvas/?live=1&v=2");
        const frameRef = react.useRef(null);
        react.useEffect(() => {
          let stopped = false;
          let tries = 0;
          // 首帧就把数据塞进 hash：页面启动时直接用它，不依赖 postMessage 时序。
          // sessions 快照是异步水合的，所以轮询到有数据为止（最多 ~15s）。
          const attempt = () => {
            if (stopped) return;
            const graph = buildGraph(props.ctx, sessionId);
            if (graph && graph.nodes.length > 0) {
              setSrc("/workflow-canvas/?live=1&v=2#" + encodeURIComponent(JSON.stringify(graph)));
              send("src-set", { nodes: graph.nodes.length, edges: graph.edges.length });
              return;
            }
            tries += 1;
            if (tries > 60) return;
            setTimeout(attempt, 250);
          };
          attempt();
          const onMsg = (ev) => {
            const d = ev && ev.data;
            if (!d) return;
            if (d.type === "wc-open" && d.id) {
              try {
                props.ctx.sessions.open?.(d.id);
                send("open-session", { id: d.id });
              } catch (e) {
                send("open-session-err", { error: String(e?.message ?? e) });
              }
              return;
            }
            if (d.type === "wc-send" && d.to) {
              send("send-request", { to: d.to });
              fetch("/workflow-canvas/api/send", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ from: sessionId, to: d.to, text: d.text }),
              })
                .then((r) => r.json())
                .then((out) => {
                  send(out && out.ok ? "send-ok" : "send-err", out || {});
                  try {
                    frameRef.current?.contentWindow?.postMessage({ type: "wc-send-result", ...(out || {}) }, "*");
                  } catch (e) {}
                })
                .catch((e) => {
                  send("send-fail", { error: String(e?.message ?? e) });
                  try {
                    frameRef.current?.contentWindow?.postMessage({ type: "wc-send-result", ok: false, error: String(e?.message ?? e) }, "*");
                  } catch (e2) {}
                });
            }
          };
          window.addEventListener("message", onMsg);
          return () => {
            stopped = true;
            window.removeEventListener("message", onMsg);
          };
        }, [sessionId]);

        return h("iframe", {
          ref: frameRef,
          src,
          title: "智能体编排画布",
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
            const tag = document.createElement("style");
            tag.dataset.plugin = "dsh-workflow-canvas";
            tag.textContent = [
              ".wc-open-btn{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 9px;border-radius:8px;",
              "border:1px solid var(--dsw-alias-border-l2,#2a2a30);background:transparent;color:var(--dsw-alias-label-secondary,#a1a1a9);",
              "font:inherit;font-size:12px;cursor:pointer;transition:background .15s,border-color .15s,color .15s}",
              ".wc-open-btn:hover{background:var(--dsw-alias-interactive-bg-hover,#1c1c22);color:var(--dsw-alias-label-primary,#f5f5f7);",
              "border-color:var(--dsw-alias-border-l3,#3a3a44)}",
              ".wc-open-btn:active{transform:translateY(.5px)}",
              ".wc-open-btn:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#7cc4ff);outline-offset:1px}",
            ].join("");
            document.head.appendChild(tag);
            return () => tag.remove();
          }, "workflow-canvas: button styles");
        } catch (e) {
          send("style-err", { error: String(e?.message ?? e) });
        }

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
                let service = ctx.betterSidebar ?? null;
                if (!service) {
                  try { service = props?.ctx?.get?.("betterSidebar") ?? null; } catch (e) { service = null; }
                }
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
                className: "wc-open-btn",
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









