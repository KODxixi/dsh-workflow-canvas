// Client half: a native right-sidebar tab type for the canvas, plus a session
// header button that opens it. Everything the wiring needs is declared here:
// Cordis only injects the services named in `inject`, and slots register through
// `ctx.slots.inject(<slot>, …)` so the slot exists before the cell is added.
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
      const TYPE_ID = "dsh-workflow-canvas";
      const KIND = "workflow-canvas";

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

      /** Tab body: the canvas page fills the docked pane. */
      const CanvasBody = () =>
        h("iframe", {
          src: "/workflow-canvas/",
          title: "智能体编排画布",
          style: { display: "block", width: "100%", height: "100%", border: "0", background: "#000" },
          allow: "clipboard-write",
        });

      const inject = ["slots", "sidebarRightTabs", "sidebarRight"];

      function apply(ctx) {
        send("apply-entered", {
          slots: typeof ctx?.slots,
          sidebarRightTabs: typeof ctx?.sidebarRightTabs,
          sidebarRight: typeof ctx?.sidebarRight,
        });

        /** Open (or focus) the canvas tab for this Session. */
        const openCanvas = () => {
          try {
            ctx.sidebarRight.openTab(KIND);
            send("openTab-ok", {});
          } catch (e) {
            send("openTab-err", { error: String(e?.message ?? e) });
          }
        };

        const OpenAction = () =>
          h(
            "button",
            {
              type: "button",
              onClick: openCanvas,
              title: "智能体编排：在右侧栏打开画布",
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

        // 1) Header button.
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

        // 2) Right-sidebar tab type (with its guide card) + body.
        try {
          const disposeType = ctx.sidebarRightTabs.register({
            id: TYPE_ID,
            kind: KIND,
            title: () => "智能体编排",
            guide: [
              {
                id: "canvas",
                title: "智能体编排",
                description: "把当前会话的 agent 树画成可交互的节点图",
                icon: h(GraphIcon, { size: 18 }),
              },
            ],
          });
          send("type-ok", {});
          try {
            const disposeBody = ctx.slots.inject("sidebar.right.pane.tab", () =>
              ctx.slots.register({ name: "sidebar.right.pane.tab", key: TYPE_ID }, CanvasBody),
            );
            send("body-ok", { disposer: typeof disposeBody });
          } catch (e) {
            send("body-err", { error: String(e?.message ?? e) });
          }
          if (typeof disposeType === "function") {
            ctx.effect(() => disposeType, "workflow-canvas: tab type");
          }
        } catch (e) {
          send("type-err", { error: String(e?.message ?? e) });
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
