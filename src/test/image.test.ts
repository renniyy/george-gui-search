import { test } from "node:test";
import assert from "node:assert/strict";
import { inflateSync } from "node:zlib";
import { encodePng, isPng, pngSize } from "../core/png.js";
import { renderThumbnailPng, composeSvg, providerStatus, resolveProvider } from "../core/image.js";

test("png encoder produces a structurally valid PNG", () => {
  const w = 8;
  const h = 4;
  const rgb = new Uint8Array(w * h * 3);
  for (let i = 0; i < rgb.length; i += 3) {
    rgb[i] = 255; rgb[i + 1] = 0; rgb[i + 2] = 128;
  }
  const png = encodePng(w, h, rgb);
  assert.ok(isPng(png));
  const size = pngSize(png);
  assert.deepEqual(size, { width: w, height: h });
  // Round-trip: find the IDAT chunk and re-inflate it.
  const idatIndex = png.indexOf(Buffer.from("IDAT"));
  assert.ok(idatIndex > 0);
  const length = png.readUInt32BE(idatIndex - 4);
  const inflated = inflateSync(png.subarray(idatIndex + 4, idatIndex + 4 + length));
  assert.equal(inflated.length, (w * 3 + 1) * h);
  assert.equal(inflated[0], 0); // filter byte none
  assert.equal(inflated[1], 255); // first red pixel
});

test("png encoder rejects mismatched buffers", () => {
  assert.throws(() => encodePng(4, 4, new Uint8Array(10)));
});

test("isPng rejects garbage", () => {
  assert.ok(!isPng(Buffer.from("not a png at all")));
  assert.ok(!isPng(Buffer.alloc(10)));
});

test("pixel renderer emits a valid 1280x720 PNG", () => {
  const image = renderThumbnailPng({ title: "NEBULA RUN", subtitle: "Build beyond imagination", palette: "midnight-nebula", badge: "UPDATE" });
  assert.equal(image.format, "png");
  assert.equal(image.mimeType, "image/png");
  assert.equal(image.width, 1280);
  assert.equal(image.height, 720);
  const buffer = Buffer.from(image.data, "base64");
  assert.ok(isPng(buffer));
  assert.deepEqual(pngSize(buffer), { width: 1280, height: 720 });
  assert.ok(buffer.length > 20_000, "suspiciously small render");
  // Non-blank check: many distinct bytes in the payload.
  const distinct = new Set(buffer.subarray(64, 4096));
  assert.ok(distinct.size > 20, `render looks blank (${distinct.size} distinct bytes)`);
});

test("pixel renderer embeds the title deterministically", () => {
  const a = renderThumbnailPng({ title: "ABC" });
  const b = renderThumbnailPng({ title: "ABC" });
  assert.equal(a.data, b.data, "local renderer must be deterministic");
  const c = renderThumbnailPng({ title: "XYZ" });
  assert.notEqual(a.data, c.data);
});

test("svg banner composes with palette, title, badge and optional mascot", () => {
  const svg = composeSvg({ title: "NEBULA RUN", subtitle: "Build beyond imagination", palette: "solar-flare", badge: "hot" });
  assert.ok(svg.startsWith("<svg"));
  assert.ok(svg.includes("NEBULA RUN"));
  assert.ok(svg.includes("Build beyond imagination"));
  assert.ok(svg.includes("HOT"));
  assert.ok(svg.includes("</svg>"));
  const withMascot = composeSvg({ title: "X", mascotBase64: "aGVsbG8=" });
  assert.ok(withMascot.includes("data:image/png;base64,aGVsbG8="));
  const escaped = composeSvg({ title: 'A<B>&"C"' });
  assert.ok(escaped.includes("A&lt;B&gt;&amp;&quot;C&quot;"));
});

test("provider resolution prefers configured providers, falls back to local", () => {
  delete process.env.GEORGE_IMAGE_API_URL;
  delete process.env.GEORGE_IMAGE_API_KEY;
  delete process.env.GEORGE_COMFY_URL;
  assert.equal(resolveProvider().id, "local-pixel-renderer");
  const status = providerStatus();
  assert.equal(status.find((p) => p.id === "local-pixel-renderer")?.configured, true);
  assert.equal(status.find((p) => p.id === "openai-compatible")?.configured, false);
  process.env.GEORGE_IMAGE_API_URL = "https://example.invalid/v1";
  process.env.GEORGE_IMAGE_API_KEY = "test";
  try {
    assert.equal(resolveProvider().id, "openai-compatible");
    assert.equal(resolveProvider("local").id, "local-pixel-renderer");
  } finally {
    delete process.env.GEORGE_IMAGE_API_URL;
    delete process.env.GEORGE_IMAGE_API_KEY;
  }
});
