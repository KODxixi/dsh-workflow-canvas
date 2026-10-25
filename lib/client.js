// Client half: a session-header button toggles a right-docked canvas panel.
// Additive by design: it uses only the shipped `shell.overlay` seat, so it can
// neither replace nor break another plugin's right sidebar.
//
// Live data: the panel builds a graph from the client `sessions` service (the
// same Session tree the sidebar shows) and posts it into the iframe, which
// boots from that message instead of its sample data.
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

      const STATUS = {
        done: { word: "已完成", tone: "ok" },
        running: { word: "进行中", tone: "run" },
        idle: { word: "待命", tone: "idle" },
        error: { word: "阻塞", tone: "err" },
        queued: { word: "排队", tone: "idle" },
        blocked: { word: "阻塞", tone: "err" },
      };

      /* ── shared panel state ─────────────────────────────── */
      const store = {
        open: false,
        sessionId: null,
        iframe: null,
        timer: null,
        listeners: new Set(),
        set(next) {
          store.open = next;
          for (const listener of [...store.listeners]) {
            try {
              listener(next);
            } catch {}
          }
        },
        toggle() {
          store.set(!store.open);
        },
        subscribe(listener) {
          store.listeners.add(listener);
          return () => store.listeners.delete(listener);
        },
      };

      const useOpen = () => {
        const [open, setOpen] = react.useState(store.open);
        react.useEffect(() => store.subscribe(setOpen), []);
        return open;
      };

      /* ── live graph from the Session tree ───────────────── */
      const shortDir = (cwd) => {
        if (typeof cwd !== "string" || cwd === "") return "";
        const parts = cwd.split(/[\\/]/).filter(Boolean);
        return parts.slice(-2).join("/");
      };

      function buildGraph(ctx, sessionId) {
        try {
          const list = ctx.get("sessions")?.list;
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
          const ROW = 180;
          for (const [depth, items] of [...levels.entries()].sort((a, b) => a[0] - b[0])) {
            items.forEach((s, index) => {
              const leaf = !(kids.get(s.id) || []).length;
              const status = s.running ? "running" : "done";
              nodes.push({
                id: s.id,
                role: depth === 0 ? "input" : leaf ? "output" : "exec",
                exec: "builder",
                name: s.displayTitle || String(s.id).slice(0, 8),
                status,
                x: 260 + (index - (items.length - 1) / 2) * COL + depth * 0,
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
          return {
            meta: {
              title: root?.displayTitle || "当前会话",
              subtitle: "DSH 实时执行图 · 随会话变化",
              session: String(rootId).slice(0, 8),
              run: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
              updated: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
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

      function postGraph(ctx) {
        const frame = store.iframe;
        if (!frame || !frame.contentWindow) return;
        const graph = buildGraph(ctx, store.sessionId);
        if (!graph) return;
        try {
          frame.contentWindow.postMessage({ type: "wc-graph", graph }, "*");
          send("graph-posted", { nodes: graph.nodes.length, edges: graph.edges.length });
        } catch (e) {
          send("graph-post-err", { error: String(e?.message ?? e) });
        }
      }

      /* ── components ─────────────────────────────────────── */
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

      const OpenAction = (props) => {
        const open = useOpen();
        react.useEffect(() => {
          if (props?.sessionId) store.sessionId = props.sessionId;
        }, [props?.sessionId]);
        return h(
          "button",
          {
            type: "button",
            onClick: () => store.toggle(),
            title: open ? "收起编排画布" : "智能体编排：打开画布",
            "aria-label": "智能体编排",
            "aria-pressed": open,
            style: {
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 28,
              padding: "0 9px",
              borderRadius: 8,
              border: "1px solid var(--dsw-alias-border-l2, #2a2a30)",
              background: open ? "var(--dsw-alias-interactive-bg-hover, #1c1c22)" : "transparent",
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

      const CanvasPanel = (props) => {
        const open = useOpen();
        const frameRef = react.useRef(null);
        react.useEffect(() => {
          if (!open) {
            store.iframe = null;
            return undefined;
          }
          const onMessage = (event) => {
            const data = event?.data;
            if (data && data.type === "wc-ready") postGraph(props?.ctx);
          };
          window.addEventListener("message", onMessage);
          const onKey = (event) => {
            if (event.key === "Escape") store.set(false);
          };
          window.addEventListener("keydown", onKey);
          store.iframe = frameRef.current;
          const kick = () => postGraph(props?.ctx);
          const timer = setInterval(kick, 2500);
          kick();
          return () => {
            window.removeEventListener("message", onMessage);
            window.removeEventListener("keydown", onKey);
            clearInterval(timer);
            store.iframe = null;
          };
        }, [open]);

        if (!open) return null;
        return h(
          "div",
          {
            style: {
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(720px, 60vw)",
              minWidth: 440,
              zIndex: 40,
              display: "flex",
              flexDirection: "column",
              background: "#0b0b0d",
              borderLeft: "1px solid var(--dsw-alias-border-l2, #2a2a30)",
              boxShadow: "-24px 0 60px -30px #000",
            },
          },
          h(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 8,
                height: 38,
                padding: "0 10px",
                borderBottom: "1px solid var(--dsw-alias-border-l2, #26262b)",
                color: "var(--dsw-alias-label-secondary, #a1a1a9)",
                fontSize: 12,
              },
            },
            h(GraphIcon, { size: 14 }),
            h("span", { style: { flex: 1 } }, "智能体编排画布"),
            h(
              "button",
              {
                type: "button",
                onClick: () => store.set(false),
                title: "关闭",
                style: { border: 0, background: "transparent", color: "inherit", cursor: "pointer", fontSize: 16, lineHeight: 1 },
              },
              "×",
            ),
          ),
          h("iframe", {
            ref: frameRef,
            src: "/workflow-canvas/?live=1",
            title: "智能体编排画布",
            onLoad: () => {
              store.iframe = frameRef.current;
              postGraph(props?.ctx);
            },
            style: { flex: 1, width: "100%", border: "0", background: "#000" },
            allow: "clipboard-write",
          }),
        );
      };

      const inject = ["slots", "sessions"];

      function apply(ctx) {
        send("apply-entered", { slots: typeof ctx?.slots, sessions: typeof ctx?.sessions });

        try {
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

        try {
          ctx.effect(
            () =>
              ctx.slots.inject("shell.overlay", () =>
                ctx.slots.register({ name: "shell.overlay", id: "workflow-canvas-panel", order: 60 }, (props) =>
                  h(CanvasPanel, { ...props, ctx }),
                ),
              ),
            "workflow-canvas: overlay panel",
          );
          send("panel-ok", {});
        } catch (e) {
          send("panel-err", { error: String(e?.message ?? e) });
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
