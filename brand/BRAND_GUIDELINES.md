# GEORGE GUI @Search — Brand Guidelines

**Tagline:** _Build beyond imagination._

This document defines the GEORGE GUI @Search visual identity: logo construction, spacing, color, typography, and usage rules. The identity is built around a pixel-art heritage (George himself is a pixel gentleman) executed with modern engineering precision.

---

## 1. Logo system

| Asset | File | Use |
| --- | --- | --- |
| Full logo (monogram + wordmark) | `brand/logo/george-gui-logo.svg` | README headers, documents, presentations |
| Icon (pixel G monogram) | `brand/logo/george-gui-icon.svg` | App icons, marketplace tiles, avatars |
| Flat icon (single color fill) | `brand/logo/george-gui-flat.svg` | Environments where gradients render poorly |
| Monochrome, dark surfaces | `brand/logo/george-gui-mono-light.svg` | Watermarks on dark backgrounds |
| Monochrome, light surfaces | `brand/logo/george-gui-mono-dark.svg` | Print, engraving, light backgrounds |
| Favicon | `brand/logo/favicon.svg` | Browser tab, small web surfaces |
| Horizontal banner | `brand/banner/george-gui-banner.svg` | README hero, release announcements |
| GitHub social preview (1280×640) | `brand/social/github-social-preview.png` | Repository Open Graph image |
| George mascot | `brand/mascot/george-mascot.png` | Character moments: release posts, demo GIFs, loading screens |

### Construction

- The monogram is a **pixel "G"** on an 8×8 grid inside a rounded square (corner radius = 1/5 of the plate).
- The G is filled with the brand gradient (indigo → cyan) at a 45° angle.
- The **search caret** — three descending-opacity cyan squares in the top-right — is the "@Search" signal. It must always be present on the icon, but never on the letterform itself.
- The wordmark is set in a heavy geometric sans (Arial Black / Inter 900 class), all caps, +2% letter-spacing. "@Search" is always the cyan accent color, never white.

### Clear space and minimum sizes

- Clear space on all sides: **the height of the monogram's plate ÷ 4** (one grid cell × 2).
- Minimum sizes: monogram **24×24 px** digital / 8 mm print; full logo **220 px** wide digital (below that, switch to the monogram).

### What not to do

- Do not rotate, skew, outline, recolor, or add drop shadows to the logo.
- Do not place the full-color logo on busy imagery without a solid plate behind it.
- Do not stretch the wordmark, change "@Search" to another color, or detach the caret from the icon.
- Do not recreate the letterform with different pixel patterns.

---

## 2. Color

The core palette is **Midnight Nebula** — the default design system shipped with the product (see `src/core/tokens.ts` for exact values; all pairs are WCAG-validated).

| Token | Hex | Role |
| --- | --- | --- |
| Background | `#0B0E1A` | Deep-space base |
| Surface | `#151A2E` | Cards, panels |
| Surface Alt | `#1E2440` | Raised cards, chips |
| Primary | `#6886FF` | Actions, links, the G gradient start |
| Accent | `#22D3EE` | The @Search cyan, highlights, the caret |
| Text | `#F2F5FF` | Primary text |
| Text Muted | `#9AA3C7` | Secondary text |
| Danger | `#E80B0B` | Destructive actions |

Contrast rules are enforced, not advisory: every text/background pair used by generated interfaces must reach **4.5:1** (the audit engine rejects anything below).

### Additional palettes

Five more shipped palettes (Solar Flare, Emerald Terminal, Candy Pop, Mono Slate, Royal Arcade) exist for generated game UIs. **Brand material always uses Midnight Nebula.**

---

## 3. Typography

| Context | Style |
| --- | --- |
| Wordmark / display | Black-weight geometric sans (Arial Black class), all caps |
| Headings | Bold, sentence case |
| Body | Regular, 14–17 px, generous line height |
| Code | Monospace (Fira Code / JetBrains Mono class) |

In generated Roblox UIs, typography maps to the **Gotham family** via `Font.fromEnum` (Gotham / GothamMedium / GothamBold / GothamBlack) — the token scales live in `Theme.Text`.

---

## 4. Visual language

- **Pixel precision:** alignment to a 4 px grid (`Theme.Space`), corners from a fixed radius scale, strokes 1 px.
- **Depth without clutter:** one gradient (the brand diagonal), flat surfaces elsewhere, depth from strokes and layered surfaces — never from shadows inside UI.
- **Motion is feedback:** 0.15–0.4 s, Quint/Back easings (see `Theme.Motion`). Interface motion must feel physical and quick, never slow or bouncy-cute.
- **The caret motif:** descending-opacity squares signify search/intelligence. Reusable as a loading or progress motif.

---

## 5. Naming and voice

- The product is **GEORGE GUI @Search** — "GUI" spelled uppercase, "@Search" always present in the full name, separated by a space.
- Short form: **George** or **George GUI** (never "GGAS", "GeorgeGUI", or "george gui").
- Package and CLI name: `george-gui-search`.
- Voice: precise, warm, confident. Engineering claims must be verifiable — every quality statement in docs ties to a test.
- The mascot is **George** — a pixel gentleman engineer. He appears in release moments, never inside primary UI chrome.

---

## 6. File formats and export

- Master sources are SVG (vector, editable).
- PNG exports for raster-only surfaces (social preview generated at exactly 1280×640).
- Favicon ships as SVG; rasterize to 16/32/180 px PNGs for platform targets that need them.

## 7. Attribution

The George mascot pixel portrait is original artwork created for this project. The identity was designed for GEORGE GUI @Search and must not be reused to imply endorsement of unrelated products.
