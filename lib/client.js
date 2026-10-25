// Client half: opens the canvas in DSH's own right sidebar (no third-party
// plugin). Fail-safe: every registration is isolated so one rejection cannot
// take the others — or the renderer — down.
try {
  window.__ModuleLoader__.load({
    id: "dsh-workflow-canvas",
    factory: (require) => {
      const react = require("react");
      const h = react.createElement;
      const TYPE_ID = "dsh-workflow-canvas";
      const KIND = "workflow-canvas";
      const TAG = "[workflow-canvas]";

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
              return;
            }
            console.warn(TAG, "sidebarRight.openTab unavailable");
          } catch (e) {
            console.warn(TAG, "openTab failed:", e?.message ?? e);
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
        } catch (e) {
          console.warn(TAG, "header button registration failed:", e?.message ?? e);
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
              } else {
                console.warn(TAG, "ctx.sidebarRightTabs missing");
              }
            } catch (e) {
              console.warn(TAG, "sidebarRightTabs.register failed:", e?.message ?? e);
            }
            try {
              const disposeBody = ctx.slots.register({ name: "sidebar.right.pane.tab", key: TYPE_ID }, CanvasBody);
              if (typeof disposeBody === "function") disposers.push(disposeBody);
            } catch (e) {
              console.warn(TAG, "sidebar.right.pane.tab registration failed:", e?.message ?? e);
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
          console.warn(TAG, "right-sidebar effect failed:", e?.message ?? e);
        }
      }

      return { apply };
    },
  });
} catch (e) {
  console.warn("[workflow-canvas] client bootstrap failed:", e?.message ?? e);
}
