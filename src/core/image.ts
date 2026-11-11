/**
 * GEORGE GUI @Search — thumbnail & artwork generation ("George Designer").
 *
 * Three providers behind one interface:
 *  - LocalPixelProvider: deterministic, offline pixel-art composition rendered
 *    through the dependency-free PNG encoder (always available).
 *  - OpenAICompatProvider: any OpenAI-compatible /v1/images/generations API
 *    (config via GEORGE_IMAGE_API_URL + GEORGE_IMAGE_API_KEY + GEORGE_IMAGE_MODEL).
 *  - ComfyUIProvider: a running ComfyUI instance (GEORGE_COMFY_URL).
 * Plus an SVG composer that produces crisp vector banners for any palette.
 */

import { readFileSync } from "node:fs";
import { encodePng } from "./png.js";
import { getPalette, resolveSide, hexToRgb, Palette } from "./tokens.js";

export interface ThumbnailRequest {
  title: string;
  subtitle?: string;
  palette?: string;
  badge?: string;
  mascotPath?: string;
  width?: number;
  height?: number;
}

export interface GeneratedImage {
  format: "png" | "svg" | "url";
  mimeType: string;
  /** base64 payload (png/svg) or a URL (url). */
  data: string;
  source: string;
  width: number;
  height: number;
}

/* ── 5x7 bitmap font for the pixel renderer ────────────────────────────── */

const FONT: Record<string, number[]> = {
  A: [14, 17, 17, 31, 17, 17, 17], B: [30, 17, 17, 30, 17, 17, 30], C: [14, 17, 16, 16, 16, 17, 14],
  D: [28, 18, 17, 17, 17, 18, 28], E: [31, 16, 16, 30, 16, 16, 31], F: [31, 16, 16, 30, 16, 16, 16],
  G: [14, 17, 16, 23, 17, 17, 15], H: [17, 17, 17, 31, 17, 17, 17], I: [14, 4, 4, 4, 4, 4, 14],
  J: [7, 2, 2, 2, 2, 18, 12], K: [17, 18, 20, 24, 20, 18, 17], L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17], N: [17, 25, 21, 19, 17, 17, 17], O: [14, 17, 17, 17, 17, 17, 14],
  P: [30, 17, 17, 30, 16, 16, 16], Q: [14, 17, 17, 17, 21, 18, 13], R: [30, 17, 17, 30, 20, 18, 17],
  S: [15, 16, 16, 14, 1, 1, 30], T: [31, 4, 4, 4, 4, 4, 4], U: [17, 17, 17, 17, 17, 17, 14],
  V: [17, 17, 17, 17, 17, 10, 4], W: [17, 17, 17, 21, 21, 27, 17], X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 10, 4, 4, 4, 4], Z: [31, 1, 2, 4, 8, 16, 31],
  "0": [14, 17, 19, 21, 25, 17, 14], "1": [4, 12, 4, 4, 4, 4, 14], "2": [14, 17, 1, 2, 4, 8, 31],
  "3": [31, 2, 4, 2, 1, 17, 14], "4": [2, 6, 10, 18, 31, 2, 2], "5": [31, 16, 30, 1, 1, 17, 14],
  "6": [6, 8, 16, 30, 17, 17, 14], "7": [31, 1, 2, 4, 8, 8, 8], "8": [14, 17, 17, 14, 17, 17, 14],
  "9": [14, 17, 17, 15, 1, 2, 12],
  " ": [0, 0, 0, 0, 0, 0, 0], ".": [0, 0, 0, 0, 0, 12, 12], ",": [0, 0, 0, 0, 0, 4, 8],
  "!": [4, 4, 4, 4, 4, 0, 4], "?": [14, 17, 1, 2, 4, 0, 4], ":": [0, 12, 12, 0, 12, 12, 0],
  "+": [0, 4, 4, 31, 4, 4, 0], "-": [0, 0, 0, 31, 0, 0, 0], "'": [4, 4, 8, 0, 0, 0, 0],
  "/": [1, 1, 2, 4, 8, 16, 16], "@": [14, 17, 21, 23, 20, 17, 14], "#": [10, 31, 10, 10, 10, 31, 10],
};

class PixelCanvas {
  width: number;
  height: number;
  data: Uint8Array;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height * 3);
  }

  set(x: number, y: number, rgb: [number, number, number]): void {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const i = (y * this.width + x) * 3;
    this.data[i] = rgb[0];
    this.data[i + 1] = rgb[1];
    this.data[i + 2] = rgb[2];
  }

  rect(x: number, y: number, w: number, h: number, rgb: [number, number, number]): void {
    for (let yy = y; yy < y + h; yy += 1) {
      for (let xx = x; xx < x + w; xx += 1) {
        this.set(xx, yy, rgb);
      }
    }
  }

  text(x: number, y: number, text: string, scale: number, rgb: [number, number, number]): number {
    let cursor = x;
    for (const char of text.toUpperCase()) {
      const glyph = FONT[char] ?? FONT["?"];
      for (let row = 0; row < 7; row += 1) {
        const bits = glyph[row];
        for (let col = 0; col < 5; col += 1) {
          if ((bits >> (4 - col)) & 1) {
            this.rect(cursor + col * scale, y + row * scale, scale, scale, rgb);
          }
        }
      }
      cursor += 6 * scale;
    }
    return cursor - x;
  }

  textWidth(text: string, scale: number): number {
    return text.length * 6 * scale - scale;
  }

  toPng(): Buffer {
    return encodePng(this.width, this.height, this.data);
  }
}

function hexRgb(hex: string): [number, number, number] {
  const { r, g, b } = hexToRgb(hex);
  return [r, g, b];
}

function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/** Deterministic pixel-art game thumbnail, rendered offline. */
export function renderThumbnailPng(request: ThumbnailRequest): GeneratedImage {
  const width = request.width ?? 1280;
  const height = request.height ?? 720;
  const palette: Palette = getPalette(request.palette);
  const side = resolveSide({ palette, mode: "dark" });
  const canvas = new PixelCanvas(width, height);

  const bg = hexRgb(side.bg);
  const surface = hexRgb(side.surfaceAlt);
  const primary = hexRgb(side.primary);
  const accent = hexRgb(side.accent);
  const text = hexRgb(side.text);
  const textMuted = hexRgb(side.textMuted);

  // Vertical gradient background with a subtle horizontal vignette.
  for (let y = 0; y < height; y += 1) {
    const t = y / height;
    const grad = mix(bg, mix(bg, surface, 0.35), Math.sin(t * Math.PI) * 0.9);
    for (let x = 0; x < width; x += 1) {
      const edge = Math.min(x, width - 1 - x) / (width / 2);
      const shade = 0.55 + 0.45 * Math.min(1, edge * 1.6 + 0.35);
      canvas.set(x, y, [Math.round(grad[0] * shade), Math.round(grad[1] * shade), Math.round(grad[2] * shade)]);
    }
  }

  // Radial accent glows.
  const glow = (cx: number, cy: number, radius: number, color: [number, number, number], strength: number) => {
    for (let y = Math.max(0, cy - radius); y < Math.min(height, cy + radius); y += 1) {
      for (let x = Math.max(0, cx - radius); x < Math.min(width, cx + radius); x += 1) {
        const d = Math.hypot(x - cx, y - cy) / radius;
        if (d < 1) {
          const a = (1 - d) * strength;
          const i = (y * width + x) * 3;
          const cur: [number, number, number] = [canvas.data[i], canvas.data[i + 1], canvas.data[i + 2]];
          const blended = mix(cur, color, a);
          canvas.data[i] = blended[0];
          canvas.data[i + 1] = blended[1];
          canvas.data[i + 2] = blended[2];
        }
      }
    }
  };
  glow(Math.round(width * 0.18), Math.round(height * 0.82), Math.round(width * 0.35), primary, 0.35);
  glow(Math.round(width * 0.86), Math.round(height * 0.2), Math.round(width * 0.28), accent, 0.3);

  // Border frame with pixel corners.
  const b = 8;
  canvas.rect(b, b, width - b * 2, 4, textMuted);
  canvas.rect(b, height - b - 4, width - b * 2, 4, textMuted);
  canvas.rect(b, b, 4, height - b * 2, textMuted);
  canvas.rect(width - b - 4, b, 4, height - b * 2, textMuted);
  for (const [cx, cy] of [[b, b], [width - b, b], [b, height - b], [width - b, height - b]] as Array<[number, number]>) {
    const sx = cx === b ? 1 : -1;
    const sy = cy === b ? 1 : -1;
    for (let i = 0; i < 5; i += 1) {
      canvas.rect(cx + sx * i * 8 - (sx < 0 ? 8 : 0), cy + sy * i * 8 - (sy < 0 ? 8 : 0), 8, 8, primary);
    }
  }

  // Title with drop shadow, auto-fitted.
  const title = (request.title || "GEORGE GUI").toUpperCase();
  let scale = 12;
  while (scale > 4 && canvas.textWidth(title, scale) > width - 160) scale -= 1;
  const titleWidth = canvas.textWidth(title, scale);
  const titleX = Math.round((width - titleWidth) / 2);
  const titleY = Math.round(height * 0.3);
  const shadowOffset = Math.max(3, Math.round(scale / 2));
  canvas.text(titleX + shadowOffset, titleY + shadowOffset, title, scale, [0, 0, 0]);
  canvas.text(titleX, titleY, title, scale, text);

  // Accent underline.
  canvas.rect(Math.round((width - titleWidth) / 2), titleY + 7 * scale + 16, titleWidth, 8, primary);
  canvas.rect(Math.round((width - titleWidth) / 2) + titleWidth, titleY + 7 * scale + 16, 8, 8, accent);

  // Subtitle.
  if (request.subtitle) {
    const sub = request.subtitle.toUpperCase();
    const subScale = 4;
    const subWidth = canvas.textWidth(sub, subScale);
    canvas.text(
      Math.round((width - subWidth) / 2) + 2,
      titleY + 7 * scale + 48 + 2,
      sub,
      subScale,
      [0, 0, 0]
    );
    canvas.text(Math.round((width - subWidth) / 2), titleY + 7 * scale + 48, sub, subScale, textMuted);
  }

  // Badge chip (top-left).
  const badge = (request.badge ?? "").toUpperCase();
  if (badge) {
    const badgeScale = 4;
    const badgeW = canvas.textWidth(badge, badgeScale) + 48;
    canvas.rect(56, 56, badgeW, 40 + 16, accent);
    canvas.rect(56, 56, badgeW, 4, text);
    canvas.text(56 + 24, 56 + 20, badge, badgeScale, hexRgb(side.bg));
  }

  // Footer strip.
  canvas.rect(b + 4, height - 64, 300, 4, primary);
  const footer = "MADE WITH GEORGE GUI";
  const footerScale = 3;
  canvas.text(width - b - 16 - canvas.textWidth(footer, footerScale), height - 60, footer, footerScale, textMuted);
  for (let i = 0; i < 6; i += 1) {
    canvas.rect(b + 16 + i * 20, height - 56, 12, 12, i % 2 === 0 ? primary : accent);
  }

  return {
    format: "png",
    mimeType: "image/png",
    data: canvas.toPng().toString("base64"),
    source: "local-pixel-renderer",
    width,
    height,
  };
}

/* ── SVG banner composer ───────────────────────────────────────────────── */

export function composeSvg(request: ThumbnailRequest & { mascotBase64?: string }): string {
  const palette: Palette = getPalette(request.palette);
  const side = resolveSide({ palette, mode: "dark" });
  const width = request.width ?? 1280;
  const height = request.height ?? 720;
  const title = escapeXml(request.title || "GEORGE GUI");
  const subtitle = escapeXml(request.subtitle ?? "Build beyond imagination");
  const badge = escapeXml((request.badge ?? "").toUpperCase());

  const mascot = request.mascotBase64
    ? `\n  <image x="${width - 460}" y="${height / 2 - 220}" width="440" height="440" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${request.mascotBase64}"/>`
    : "";

  const badgeChip = badge
    ? `\n  <g><rect x="64" y="64" rx="14" width="${badge.length * 16 + 56}" height="48" fill="${side.accent}"/><text x="${64 + 28}" y="${64 + 32}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="800" fill="${side.bg}">${badge}</text></g>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${side.bg}"/>
      <stop offset="0.55" stop-color="${side.surfaceAlt}"/>
      <stop offset="1" stop-color="${side.bg}"/>
    </linearGradient>
    <radialGradient id="glow1" cx="0.2" cy="0.85" r="0.5">
      <stop offset="0" stop-color="${side.primary}" stop-opacity="0.45"/>
      <stop offset="1" stop-color="${side.primary}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="0.85" cy="0.15" r="0.4">
      <stop offset="0" stop-color="${side.accent}" stop-opacity="0.4"/>
      <stop offset="1" stop-color="${side.accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="${side.stroke}" stroke-opacity="0.35" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#grid)"/>
  <rect width="${width}" height="${height}" fill="url(#glow1)"/>
  <rect width="${width}" height="${height}" fill="url(#glow2)"/>
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" fill="none" stroke="${side.stroke}" stroke-width="2"/>
  ${mascot}${badgeChip}
  <text x="96" y="${height / 2 - 10}" font-family="Arial, Helvetica, sans-serif" font-size="96" font-weight="900" fill="${side.text}">${title}</text>
  <rect x="96" y="${height / 2 + 26}" width="420" height="10" rx="5" fill="${side.primary}"/>
  <rect x="524" y="${height / 2 + 26}" width="10" height="10" fill="${side.accent}"/>
  <text x="96" y="${height / 2 + 86}" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="500" fill="${side.textMuted}">${subtitle}</text>
  <text x="${width - 96}" y="${height - 60}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="600" fill="${side.textMuted}">MADE WITH GEORGE GUI</text>
</svg>
`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ── External providers ────────────────────────────────────────────────── */

export interface ImageProvider {
  id: string;
  isConfigured(): boolean;
  generate(request: ThumbnailRequest): Promise<GeneratedImage>;
}

class OpenAICompatProvider implements ImageProvider {
  id = "openai-compatible";

  isConfigured(): boolean {
    return Boolean(process.env.GEORGE_IMAGE_API_URL && process.env.GEORGE_IMAGE_API_KEY);
  }

  async generate(request: ThumbnailRequest): Promise<GeneratedImage> {
    const url = process.env.GEORGE_IMAGE_API_URL as string;
    const key = process.env.GEORGE_IMAGE_API_KEY as string;
    const model = process.env.GEORGE_IMAGE_MODEL ?? "gpt-image-1";
    const palette = getPalette(request.palette);
    const prompt =
      `Roblox game thumbnail, ${palette.mood} style, bold readable title "${request.title}"` +
      (request.subtitle ? `, subtitle "${request.subtitle}"` : "") +
      `, high contrast, crisp composition, no watermark`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60_000);
    try {
      const response = await fetch(`${url.replace(/\/$/, "")}/images/generations`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
        body: JSON.stringify({ model, prompt, size: "1024x1024", n: 1 }),
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Image API responded ${response.status}: ${await response.text()}`);
      }
      const payload = (await response.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
      const item = payload.data?.[0];
      if (item?.b64_json) {
        return { format: "png", mimeType: "image/png", data: item.b64_json, source: `openai-compatible:${model}`, width: 1024, height: 1024 };
      }
      if (item?.url) {
        return { format: "url", mimeType: "text/uri-list", data: item.url, source: `openai-compatible:${model}`, width: 1024, height: 1024 };
      }
      throw new Error("Image API returned no image data");
    } finally {
      clearTimeout(timer);
    }
  }
}

class ComfyUIProvider implements ImageProvider {
  id = "comfyui";

  isConfigured(): boolean {
    return Boolean(process.env.GEORGE_COMFY_URL);
  }

  async generate(request: ThumbnailRequest): Promise<GeneratedImage> {
    const base = (process.env.GEORGE_COMFY_URL as string).replace(/\/$/, "");
    const palette = getPalette(request.palette);
    const prompt = `${request.title} — ${request.subtitle ?? ""}, ${palette.mood}, Roblox game thumbnail, high contrast`;
    // Minimal API workflow: a single CheckpointLoaderSimple -> CLIPTextEncode
    // -> EmptyLatentImage -> KSampler -> VAEDecode -> SaveImage chain.
    const workflow = {
      "3": { class_type: "KSampler", inputs: { seed: Math.floor(Math.random() * 1e9), steps: 25, cfg: 7, sampler_name: "euler", scheduler: "normal", denoise: 1, model: ["4", 0], positive: ["6", 0], negative: ["7", 0], latent_image: ["5", 0] } },
      "4": { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: process.env.GEORGE_COMFY_CHECKPOINT ?? "sd_xl_base_1.0.safetensors" } },
      "5": { class_type: "EmptyLatentImage", inputs: { width: 1024, height: 1024, batch_size: 1 } },
      "6": { class_type: "CLIPTextEncode", inputs: { text: prompt, clip: ["4", 1] } },
      "7": { class_type: "CLIPTextEncode", inputs: { text: "blurry, low contrast, watermark, text artifacts", clip: ["4", 1] } },
      "8": { class_type: "VAEDecode", inputs: { samples: ["3", 0], vae: ["4", 2] } },
      "9": { class_type: "SaveImage", inputs: { filename_prefix: "george_gui", images: ["8", 0] } },
    };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120_000);
    try {
      const submitted = await fetch(`${base}/prompt`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: workflow }),
        signal: controller.signal,
      });
      if (!submitted.ok) {
        throw new Error(`ComfyUI /prompt responded ${submitted.status}. Is a checkpoint named "${workflow["4"].inputs.ckpt_name}" loaded?`);
      }
      const { prompt_id: promptId } = (await submitted.json()) as { prompt_id: string };
      for (let attempt = 0; attempt < 120; attempt += 1) {
        await new Promise((r) => setTimeout(r, 2000));
        const historyRes = await fetch(`${base}/history/${promptId}`, { signal: controller.signal });
        if (!historyRes.ok) continue;
        const history = (await historyRes.json()) as Record<string, { outputs?: Record<string, { images?: Array<{ filename: string; subfolder: string; type: string }> }> }>;
        const outputs = history[promptId]?.outputs;
        const images = outputs ? Object.values(outputs).flatMap((o) => o.images ?? []) : [];
        if (images.length > 0) {
          const image = images[0];
          const viewRes = await fetch(
            `${base}/view?filename=${encodeURIComponent(image.filename)}&subfolder=${encodeURIComponent(image.subfolder)}&type=${encodeURIComponent(image.type)}`,
            { signal: controller.signal }
          );
          if (!viewRes.ok) throw new Error(`ComfyUI /view responded ${viewRes.status}`);
          const buffer = Buffer.from(await viewRes.arrayBuffer());
          return { format: "png", mimeType: "image/png", data: buffer.toString("base64"), source: "comfyui", width: 1024, height: 1024 };
        }
      }
      throw new Error("ComfyUI generation timed out after 4 minutes");
    } finally {
      clearTimeout(timer);
    }
  }
}

const PROVIDERS: ImageProvider[] = [new OpenAICompatProvider(), new ComfyUIProvider()];

export function resolveProvider(preferred?: string): ImageProvider {
  if (preferred === "local") {
    return { id: "local-pixel-renderer", isConfigured: () => true, generate: async (r) => renderThumbnailPng(r) };
  }
  for (const provider of PROVIDERS) {
    if (provider.isConfigured()) return provider;
  }
  return { id: "local-pixel-renderer", isConfigured: () => true, generate: async (r) => renderThumbnailPng(r) };
}

export function providerStatus(): Array<{ id: string; configured: boolean; envHint: string }> {
  return [
    { id: "openai-compatible", configured: new OpenAICompatProvider().isConfigured(), envHint: "GEORGE_IMAGE_API_URL + GEORGE_IMAGE_API_KEY (+ GEORGE_IMAGE_MODEL)" },
    { id: "comfyui", configured: new ComfyUIProvider().isConfigured(), envHint: "GEORGE_COMFY_URL (+ GEORGE_COMFY_CHECKPOINT)" },
    { id: "local-pixel-renderer", configured: true, envHint: "always available, offline" },
  ];
}

/** Read and base64-encode a mascot image for SVG embedding. */
export function loadMascotBase64(path: string): string | undefined {
  try {
    return readFileSync(path).toString("base64");
  } catch {
    return undefined;
  }
}
