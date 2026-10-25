// Client half: opens the canvas in DSH's own right sidebar (no third-party
// plugin). Fail-safe: every registration is isolated so one rejection cannot
// take the others — or the renderer — down. Every step reports to the host's
// /workflow-canvas/api/log so the wiring can be diagnosed without DevTools.
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

      /** Header action: open the canvas tab for this Session. */
      const OpenAction = (props) => {
        const open = () => {
          try {
            const nav = props?.ctx?.sidebarRight;
            if (nav && typeof nav.openTab === "function") {
              nav.openTab(KIND);
              send("openTab-ok", {});
              return;
            }
            send("openTab-missing", {});
          } catch (e) {
            send("openTab-err", { error: String(e?.message ?? e) });
          }
        };
        return h(
          "button",
          {
            type: "button",
            onClick: open,
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
      };

      function apply(ctx) {
        send("apply-entered", {
          slots: typeof ctx?.slots,
          slotsInject: typeof ctx?.slots?.inject,
          slotsRegister: typeof ctx?.slots?.register,
          sidebarRightTabs: typeof ctx?.sidebarRightTabs,
          sidebarRight: typeof ctx?.sidebarRight,
          effect: typeof ctx?.effect,
        });

        // 1) Header button first: it is the cheap, visible signal that the
        //    client half actually loaded.
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

        // 2) Native right-sidebar tab type + body, each isolated.
        try {
          ctx.effect(() => {
            const disposers = [];
            try {
              const registry = ctx.sidebarRightTabs;
              if (registry && typeof registry.register === "function") {
                const disposeType = registry.register({
                  id: TYPE_ID,
                  kind: KIND,
                  title: () => "智能体编排",
                });
                if (typeof disposeType === "function") disposers.push(disposeType);
                send("type-ok", {});
              } else {
                send("type-missing", {});
              }
            } catch (e) {
              send("type-err", { error: String(e?.message ?? e) });
            }
            try {
              const disposeBody = ctx.slots.register({ name: "sidebar.right.pane.tab", key: TYPE_ID }, CanvasBody);
              if (typeof disposeBody === "function") disposers.push(disposeBody);
              send("body-ok", {});
            } catch (e) {
              send("body-err", { error: String(e?.message ?? e) });
            }
            return () => {
              for (const dispose of disposers) {
                try {
                  dispose();
                } catch {}
              }
            };
          }, "workflow-canvas: right-sidebar type");
        } catch (e) {
          send("type-effect-err", { error: String(e?.message ?? e) });
        }
      }

      return { apply };
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
