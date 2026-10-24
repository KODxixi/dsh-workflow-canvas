// Client half: the canvas lives in the RIGHT sidebar as its own tab type.
// A session-header button summons that tab for the conversation in front of you.
window.__ModuleLoader__.load({
  id: "dsh-workflow-canvas",
  factory: (require) => {
    const react = require("react");
    const h = react.createElement;
    const TAB_ID = "workflow-canvas";

    /** Node-graph glyph, monochrome so it follows the host theme. */
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

    /** Right-sidebar pane: the canvas page, scoped to this tab's Session. */
    const CanvasPane = (props) => {
      const sessionId = props?.scope?.sessionId ?? props?.tab?.meta?.sessionId ?? "";
      const src = sessionId === "" ? "/workflow-canvas/" : `/workflow-canvas/?session=${encodeURIComponent(sessionId)}`;
      return h("iframe", {
        src,
        title: "智能体编排画布",
        style: { display: "block", width: "100%", height: "100%", border: "0", background: "#000" },
        allow: "clipboard-write",
      });
    };

    /** Header action: open (or focus) the canvas tab for this Session. */
    const OpenAction = (props) => {
      const open = () => {
        const service = props?.ctx?.get?.("betterSidebar");
        if (!service || typeof service.openTab !== "function") return;
        const scope = props?.scope ?? (props?.sessionId ? { sessionId: props.sessionId } : undefined);
        service.openTab({ type: TAB_ID }, scope);
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

    /** Register the right-sidebar tab, retrying until better-sidebar's service exists. */
    function registerTab(ctx) {
      let disposer = null;
      let timer = null;
      let tries = 0;
      const attempt = () => {
        if (disposer !== null) return;
        const service = ctx.get("betterSidebar");
        if (service && typeof service.registerTab === "function") {
          disposer = service.registerTab({
            id: TAB_ID,
            title: () => "智能体编排",
            description: () => "把当前会话的 agent 树画成可交互的节点图",
            icon: (size) => h(GraphIcon, { size }),
            order: 60,
            single: true,
            component: (tabProps) => h(CanvasPane, tabProps),
          });
          return;
        }
        tries += 1;
        if (tries > 80) {
          console.warn("[workflow-canvas] betterSidebar service never appeared; tab not registered");
          return;
        }
        timer = setTimeout(attempt, 250);
      };
      attempt();
      return () => {
        if (timer !== null) clearTimeout(timer);
        if (typeof disposer === "function") disposer();
      };
    }

    function apply(ctx) {
      ctx.effect(() => registerTab(ctx), "workflow-canvas: right-sidebar tab");
      ctx.effect(
        () =>
          ctx.slots.inject("conversation.session.header.actions", () =>
            ctx.slots.register({ name: "conversation.session.header.actions", id: "workflow-canvas-open", order: 40 }, OpenAction),
          ),
        "workflow-canvas: header summon button",
      );
    }

    return { apply };
  },
});
