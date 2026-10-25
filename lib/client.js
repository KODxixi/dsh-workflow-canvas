// Client half: a session-header button toggles a right-docked canvas panel.
// Deliberately additive: it uses only the shipped `shell.overlay` seat and
// `slots`, so it can neither replace nor break another plugin's right sidebar.
// Every step reports to /workflow-canvas/api/log for host-side diagnosis.
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
      send("factory-entered", {});
      const react = require("react");
      const h = react.createElement;
      const TAG = "[workflow-canvas]";

      /** Panel open state shared by the header button and the overlay seat. */
      const store = {
        open: false,
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

      /** Header action: open / close the canvas panel. */
      const OpenAction = () => {
        const open = useOpen();
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

      /** Frame-wide right-docked panel hosting the canvas page. */
      const CanvasPanel = () => {
        const open = useOpen();
        react.useEffect(() => {
          if (!open) return undefined;
          const onKey = (event) => {
            if (event.key === "Escape") store.set(false);
          };
          window.addEventListener("keydown", onKey);
          return () => window.removeEventListener("keydown", onKey);
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
              width: "min(680px, 56vw)",
              minWidth: 420,
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
                style: {
                  border: 0,
                  background: "transparent",
                  color: "inherit",
                  cursor: "pointer",
                  fontSize: 16,
                  lineHeight: 1,
                },
              },
              "×",
            ),
          ),
          h("iframe", {
            src: "/workflow-canvas/",
            title: "智能体编排画布",
            style: { flex: 1, width: "100%", border: "0", background: "#000" },
            allow: "clipboard-write",
          }),
        );
      };

      const inject = ["slots"];

      function apply(ctx) {
        send("apply-entered", { slots: typeof ctx?.slots });

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
                ctx.slots.register({ name: "shell.overlay", id: "workflow-canvas-panel", order: 60 }, CanvasPanel),
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
