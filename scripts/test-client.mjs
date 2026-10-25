// Offline smoke test of the client bundle: emulate the ModuleLoader, then run
// the factory and apply() against fake slots, recording every registration.
import { readFileSync } from "node:fs";

const file = "C:/AI/prototypes/dsh-agents-nodes/lib/client.js";
const code = readFileSync(file, "utf8");

// The bundle reports to the host; the smoke test only checks registrations.
globalThis.fetch = () => Promise.resolve({ ok: true });

let captured = null;
globalThis.window = {
  __ModuleLoader__: {
    load(spec) {
      captured = spec;
    },
  },
};

new Function(code)();

console.log("registered id:", captured?.id);
if (!captured) throw new Error("bundle did not register a factory");

const calls = [];
const react = {
  createElement: (type, props, ...children) => ({ type, props, children }),
  useState: (initial) => [initial, () => {}],
  useEffect: () => {},
};
const ctx = {
  effect(fn, label) {
    calls.push(["effect", label]);
    const dispose = fn();
    return typeof dispose === "function" ? dispose : () => {};
  },
  slots: {
    inject(name, fn) {
      calls.push(["slots.inject", name]);
      return fn();
    },
    register(spec, comp) {
      calls.push(["slots.register", spec.name, spec.key ?? spec.id]);
      if (typeof comp !== "function") throw new Error("component is not a function");
      return () => {};
    },
  },
};

const exports = captured.factory((name) => {
  calls.push(["require", name]);
  return react;
});
console.log("exports:", Object.keys(exports));

exports.apply(ctx);
for (const call of calls) console.log("  ", call.join(" · "));

const hasHeader = calls.some((c) => c[0] === "slots.register" && c[2] === "workflow-canvas-open");
const hasPanel = calls.some((c) => c[0] === "slots.register" && c[2] === "workflow-canvas-panel");
const declaresSlots = Array.isArray(exports.inject) && exports.inject.includes("slots");
console.log({ hasHeader, hasPanel, declaresSlots });
if (!hasHeader || !hasPanel || !declaresSlots) process.exit(1);
console.log("SMOKE TEST PASSED");
