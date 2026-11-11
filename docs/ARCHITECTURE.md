# Architecture

## Design principles

1. **Offline-first, zero-config.** No network call is required for any core feature.
2. **Everything is audited.** No artifact leaves the pipeline without passing the self-critique engine.
3. **Single-file, dependency-free output.** Generated interfaces are one ModuleScript with zero external Luau dependencies.
4. **Honest integrations.** The registry reports what is actually implemented and configured — never aspirational features.
5. **Standards over vibes.** WCAG math, 4 px grids, real formatter compatibility, strict Luau.

## The generation pipeline

```text
description (natural language)
   │
   ▼
detectKind()                keyword scoring → one of 12 kinds (or custom)
   │
   ▼
resolve palette + mode      PALETTES (WCAG-solved) → DesignSystem
   │
   ▼
buildSpecFor()              GuiSpec IR: nodes, colors, text roles, sizes
   │                           (this is what the audit engine scores)
   ▼
template.buildBody()        hand-written Luau emission per kind, parameterized
   + luau-shell prelude     Theme tokens, create(), withTween(), hookButton(),
   + controllerExtras       mount/open/close/on + kind-specific APIs
   │
   ▼
finalizeLuau()              canonicalizer: tabs, one prop per line,
   │                        trailing commas, statement hygiene
   ▼
auditGuiSpec()              contrast ratios, touch targets, text sizes,
   │                        safe-area & responsive checks → score 0-100
   ▼
tool response               Luau + audit + actions + notes + structuredContent
```

## The self-critique engine (`core/audit.ts`)

- **Contrast**: WCAG relative-luminance math on every label/button against its *effective* background (nearest ancestor with a fill). Body text requires 4.5:1, display/stat roles 3:1 — but the shipped palettes actually clear 4.5:1 everywhere.
- **Touch targets**: interactive elements must be ≥ 36 px (fail below 30, warn between).
- **Text sizes**: minimum 12 px on every role.
- **Safe area / responsive**: fullscreen specs must set `IgnoreGuiInset` and scale-based sizing with `UISizeConstraint` bounds.

The palette hexes themselves are computed by `scripts/adjust-palettes.mjs`, a constraint solver that searches lightness (keeping hue/saturation) until every required token pair reaches ≥ 4.6:1. Design guarantees are solved, not eyeballed.

## The canonicalizer (`core/luau-text.ts`)

A depth-aware (braces, parens, strings, comments, function-valued fields) formatter pass that makes output byte-identical to StyLua 2 with the shipped config:

- leading 8-space groups → tabs (authoring-environment independence)
- multi-property lines → one property per line with trailing commas
- statement-level trailing commas stripped
- blank-line runs collapsed

Idempotence is tested; the repo ships `stylua.toml` and the test suite enforces the 130-column limit.

## The static analyzer (`core/luau-review.ts`)

Two rule families:

- **Line rules** (regex): deprecated globals, `loadstring`/`getfenv`, `SetAsync` preference, debug prints, legacy `Game.`, numeric-id `require`.
- **Contextual rules** (proximity windows): DataStore calls without nearby `pcall`, `OnServerEvent` without nearby validation, `while true do` without a nearby yield, `InputBegan` handlers ignoring `gameProcessedEvent`.

Contextual rules intentionally use conservative windows — a few documented patterns (retry helpers) may need inline `pcall` near the call; the templates show the accepted shape.

## The image pipeline (`core/image.ts`, `core/png.ts`)

- **Pixel renderer**: composes a 1280×720 thumbnail on a raw RGB buffer (gradient, vignette, radial glows, border with pixel corners, 5×7 bitmap-font title with drop shadow, badge chip, footer) → `encodePng()` writes a valid PNG using only Node's zlib (IHDR/IDAT/IEND with CRC32). Fully deterministic — the same arguments always produce the same bytes (tested).
- **SVG composer**: vector banner variant, palette-driven, optional mascot embedding.
- **Providers**: OpenAI-compatible REST and ComfyUI (submit/poll/fetch) adapters, each with timeouts and automatic fallback to the local renderer.

## The integration registry (`integrations/registry.ts`)

Typed entries (`bundled` / `adapter` / `policy` / `documented`) with environment contracts and optional health probes (2 s timeout). The `george_integrations` tool renders live status. The full acceptance report — including what is deliberately *not* implemented yet — is [INTEGRATIONS.md](INTEGRATIONS.md).

## The MCP layer (`server.ts`)

Built on the official `@modelcontextprotocol/sdk` (McpServer + StdioServerTransport). Each tool declares a zod `inputSchema` (validated by the SDK before the handler runs) and several declare `outputSchema` for structured content. Handlers return text content, image content blocks (thumbnails) and structured JSON; failures return `isError` results with actionable messages. The server logs to **stderr only** — stdout is the protocol channel.

## Testing strategy

| Layer | Test file | What it proves |
| --- | --- | --- |
| Tokens | `tokens.test.ts` | palette integrity, theme emission |
| Generator | `gui-generator.test.ts` | all kinds emit complete modules; **144-case audit gate**; review engine passes with 0 errors; canonicalizer idempotence; 130-column limit; content escaping |
| Review | `luau-review.test.ts` | every rule fires on seeded bad code, passes on clean code |
| Templates | `luau-templates.test.ts` | template invariants (validation, rate limiting, UpdateAsync, retries) |
| Audit | `audit.test.ts` | WCAG reference values, target flags |
| Knowledge | `knowledge.test.ts` | relevance, URL hygiene, no fabrication on empty results |
| Image | `image.test.ts` | PNG structural validity + zlib round-trip, determinism, SVG escaping |
| Integrations | `integrations.test.ts` | 11 mandated repos present, honest statuses, env activation |
| Scaffold | `scaffold.test.ts` | valid Rojo JSON, toolchain pins, name sanitization |
| Protocol | `server.e2e.test.ts` | real MCP client over stdio: 10 tools listed, 7 called, structured content + image blocks, invalid input rejected |
