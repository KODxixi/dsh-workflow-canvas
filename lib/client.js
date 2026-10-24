// Client half: a native right-sidebar tab type (no third-party plugin needed).
// The type shows up as a guide card in the right Sidebar, and a session-header
// button opens it for the conversation in front of you.
window.__ModuleLoader__.load({
  id: "dsh-workflow-canvas",
  factory: (require) => {
    const react = require("react");
    const h = react.createElement;
    const TYPE_ID = "dsh-workflow-canvas";
    const KIND = "workflow-canvas";

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

    /** Tab body: the canvas page fills the docked pane. */
    const CanvasBody = (props) => {
      const info = typeof props?.useTabInfo === "function" ? props.useTabInfo() : undefined;
      const sessionId = info?.tab?.sessionId ?? props?.tab?.sessionId ?? "";
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
        const nav = props?.ctx?.sidebarRight ?? props?.ctx?.get?.("sidebarRight");
        if (!nav || typeof nav.openTab !== "function") return;
        nav.openTab(KIND, props?.sessionId === undefined ? {} : { params: { sessionId: props.sessionId } });
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
      // 1) Right-sidebar tab type + its body.
      ctx.effect(() => {
        const registry = ctx.sidebarRightTabs;
        if (!registry || typeof registry.register !== "function") {
          console.warn("[workflow-canvas] ctx.sidebarRightTabs missing; tab type not registered");
          return () => {};
        }
        const type = registry.register({
          id: TYPE_ID,
          kind: KIND,
          priority: "extension",
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
        const body = ctx.slots.register({ name: "sidebar.right.pane.tab", key: TYPE_ID }, CanvasBody);
        return () => {
          if (typeof body === "function") body();
          if (typeof type === "function") type();
        };
      }, "workflow-canvas: right-sidebar type");

      // 2) Session-header button that summons it.
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
