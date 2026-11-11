import { test } from "node:test";
import assert from "node:assert/strict";
import { contrastRatio, relativeLuminance, auditGuiSpec } from "../core/audit.js";
import { getPalette } from "../core/tokens.js";
import type { GuiSpec } from "../core/spec.js";

test("contrast math matches WCAG reference values", () => {
  assert.ok(Math.abs(contrastRatio("#000000", "#FFFFFF") - 21) < 0.01);
  assert.ok(Math.abs(relativeLuminance("#FFFFFF") - 1) < 0.0001);
  assert.ok(Math.abs(relativeLuminance("#000000") - 0) < 0.0001);
  // Classic reference: red vs white ~ 4.0
  assert.ok(Math.abs(contrastRatio("#FF0000", "#FFFFFF") - 3.998) < 0.01);
});

test("small touch targets are flagged", () => {
  const spec: GuiSpec = {
    kind: "custom", name: "T", title: "t", paletteId: "mono-slate", mode: "dark", fullscreen: true,
    children: [
      { kind: "Frame", name: "P", background: "surface", children: [
        { kind: "Button", name: "Tiny", variant: "primary", text: "x", size: { xScale: 0, xOffset: 60, yScale: 0, yOffset: 24 } },
      ] },
    ],
    notes: [],
  };
  const audit = auditGuiSpec(spec, { palette: getPalette("mono-slate"), mode: "dark" });
  assert.ok(audit.checks.some((c) => c.id === "touch-target" && c.level === "fail"));
  assert.ok(!audit.passed);
});

test("low contrast text is flagged with a fix hint", () => {
  const spec: GuiSpec = {
    kind: "custom", name: "T", title: "t", paletteId: "mono-slate", mode: "dark", fullscreen: true,
    children: [
      { kind: "Frame", name: "P", background: "surface", children: [
        { kind: "Label", name: "MutedOnMuted", role: "body", color: "textMuted", text: "x", background: "transparent" },
      ] },
    ],
    notes: [],
  };
  // force a pathological palette side: text == background
  const palette = getPalette("mono-slate");
  palette.dark.textMuted = palette.dark.surface;
  const audit = auditGuiSpec(spec, { palette, mode: "dark" });
  assert.ok(audit.checks.some((c) => c.id === "contrast" && c.level === "fail"));
  // restore for other tests
  palette.dark.textMuted = "#98A2B3";
});

test("audit result shape is structured and scorable", () => {
  const spec: GuiSpec = {
    kind: "custom", name: "T", title: "t", paletteId: "midnight-nebula", mode: "dark", fullscreen: false,
    children: [],
    notes: [],
  };
  const audit = auditGuiSpec(spec, { palette: getPalette("midnight-nebula"), mode: "dark" });
  assert.equal(typeof audit.score, "number");
  assert.equal(typeof audit.summary, "string");
  assert.ok(Array.isArray(audit.checks));
  assert.ok(audit.checks.some((c) => c.id === "safe-area"));
  assert.ok(audit.checks.some((c) => c.id === "responsive"));
});
