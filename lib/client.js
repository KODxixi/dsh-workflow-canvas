// Client half: a full central panel (main slot, key "workflow-canvas") rendering
// the standalone app from /workflow-canvas/, plus a left-rail entry that selects
// that same key (the rail selects the main panel by its id).
window.__ModuleLoader__.load({
  id: "dsh-workflow-canvas",
  factory: (require) => {
    const react = require("react");
    const h = react.createElement;
    const APP_URL = "/workflow-canvas/";

    /** Full-height frame for the standalone canvas app. */
    const CanvasPage = () =>
      h(
        "div",
        { style: { position: "relative", width: "100%", height: "100%", background: "#000" } },
        h("iframe", {
          src: APP_URL,
          title: "Agent 编排画布",
          style: { position: "absolute", inset: 0, width: "100%", height: "100%", border: "0", background: "#000" },
          allow: "clipboard-write",
        }),
      );

    /** Rail glyph: a tiny node graph, monochrome so it follows the host theme. */
    const RailIcon = (props) => {
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

    function apply(ctx) {
      ctx.effect(
        () => ctx.slots.inject("main", () => ctx.slots.register({ name: "main", key: "workflow-canvas" }, CanvasPage)),
        "workflow-canvas: main page",
      );
      ctx.effect(
        () =>
          ctx.slots.inject("sidebar.panellist", () =>
            ctx.slots.register({ name: "sidebar.panellist", id: "workflow-canvas", order: 80, label: () => "智能体编排" }, RailIcon),
          ),
        "workflow-canvas: rail entry",
      );
    }

    return { apply };
  },
});
