import { test } from "node:test";
import assert from "node:assert/strict";
import { PALETTES, getPalette, hexToRgb, luauColor3, emitThemeModule, emitThemeModuleTokens, listPalettes, SCALES } from "../core/tokens.js";

test("six curated palettes exist with unique ids", () => {
  assert.equal(PALETTES.length, 6);
  const ids = new Set(PALETTES.map((p) => p.id));
  assert.equal(ids.size, 6);
});

test("getPalette falls back to the first palette for unknown ids", () => {
  assert.equal(getPalette("nope").id, PALETTES[0].id);
  assert.equal(getPalette("midnight-nebula").name, "Midnight Nebula");
});

test("hexToRgb parses hex correctly", () => {
  assert.deepEqual(hexToRgb("#0B0E1A"), { r: 11, g: 14, b: 26 });
  assert.deepEqual(hexToRgb("#FFFFFF"), { r: 255, g: 255, b: 255 });
});

test("luauColor3 emits Color3.fromRGB literals", () => {
  assert.equal(luauColor3("#0B0E1A"), "Color3.fromRGB(11, 14, 26)");
});

test("theme module contains all color tokens and scales", () => {
  const module = emitThemeModule({ palette: getPalette("mono-slate"), mode: "dark" }, "TestUI");
  for (const token of ["bg", "surface", "surfaceAlt", "stroke", "text", "textMuted", "primary", "primaryText", "secondary", "accent", "success", "warning", "danger"]) {
    assert.ok(module.includes(`${token} = Color3.fromRGB(`), `missing token ${token}`);
  }
  assert.ok(module.includes("return Theme"));
  assert.ok(module.includes("--!strict") === false); // standalone module has no strict header by design
  const tokens = emitThemeModuleTokens({ palette: getPalette("mono-slate"), mode: "light" }, "TestUI");
  assert.ok(tokens.includes("local Theme = {"));
});

test("light and dark sides differ for every palette", () => {
  for (const p of PALETTES) {
    assert.notEqual(p.dark.bg, p.light.bg, `${p.id} light/dark bg identical`);
  }
});

test("scales follow the 4px grid and sane text sizes", () => {
  assert.equal(SCALES.text.caption, 12);
  assert.ok(SCALES.radius.pill > SCALES.radius.xl);
  assert.equal(SCALES.touchTarget, 36);
});

test("listPalettes returns swatches for preview UIs", () => {
  const list = listPalettes();
  assert.equal(list.length, 6);
  assert.equal(list[0].swatch.length, 5);
});
