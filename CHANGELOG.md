# Changelog

All notable changes to GEORGE GUI @Search are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.2] — 2026-11-11

### Fixed

- Release pipeline: npm publishing now runs from CI with the `NPM_TOKEN` secret (this release was published by the workflow itself, validating the end-to-end path).

[1.0.2]: https://github.com/renniyy/george-gui-search/releases/tag/v1.0.2

## [1.0.1] — 2026-11-11

### Fixed

- Upgraded `zod` to `^4.6.7` (within the MCP SDK's supported peer range) to resolve advisory GHSA-mrhx-c7xc-m3w5 (memory exhaustion while validating oversized constrained collections). All 71 tests — including the full MCP protocol e2e suite — pass on zod 4.
- CI: pinned valid `trivy-action` (`v0.36.0`) and `scorecard-action` (`v2.5.0`) versions.
- `npm test` now uses the glob form (`node --test dist/test/*.test.js`) for reliable cross-version behavior.

[1.0.1]: https://github.com/renniyy/george-gui-search/releases/tag/v1.0.1

## [1.0.0] — 2026-11-11

First public release.

### Added

- **12 interface kinds** (`main-menu`, `shop`, `inventory`, `settings`, `hud`, `loading-screen`, `leaderboard`, `notifications`, `dialogue`, `quest-tracker`, `profile-card`, `custom`), each generating a complete, self-contained `--!strict` Luau ModuleScript with theme tokens, full hierarchy, tween animations, hover/press/gamepad feedback, responsive layout and a controller API (`mount/open/close/on/setItems/setProgress/say/...`).
- **Self-critique audit engine**: WCAG contrast math on every text/background pair, ≥ 36 px touch targets, ≥ 12 px text, safe-area and responsive checks. All 12 kinds × 6 palettes × 2 modes ship at 100/100 (144 test cases).
- **Six WCAG-solved palettes** with light/dark variants (Midnight Nebula, Solar Flare, Emerald Terminal, Candy Pop, Mono Slate, Royal Arcade), emitted as Luau `Theme` modules and JSON.
- **Luau static analysis** (`george_review_luau`): deprecated globals, `loadstring`/env access, unprotected DataStore calls, `SetAsync` preference, unvalidated `OnServerEvent`, frozen loops, chat-ignoring input handlers, legacy references, numeric-id requires, strict-mode checks.
- **Production Luau templates**: secure rate-limited remote layer, DataStore profiles with retries/backoff/BindToClose, and a signal implementation.
- **Project scaffolder**: Rojo `default.project.json`, Rokit-pinned toolchain, Wally manifest, StyLua/Selene configs, source tree, README.
- **Thumbnail generation**: deterministic offline pixel-art renderer (dependency-free PNG encoder via Node zlib), SVG banner composer, and optional OpenAI-compatible / ComfyUI providers with automatic fallback.
- **Research knowledge base**: 43 verified, source-linked entries across UI, scripting, networking, data, optimization, tooling, MCP and security.
- **Integration registry**: honest bundled/adapter/policy/documented statuses with live health probes for the 11 mandated repositories and 20 ecosystem entries — documented-but-unimplemented integrations are never reported as available.
- **Canonicalized output**: every emitted Luau string is byte-identical to StyLua 2 output under the shipped config (verified against StyLua 2.0.2).
- **71 automated tests** including a real MCP client→server protocol suite over stdio.

### Security

- Zero network calls required; no telemetry; secrets never appear in tool output or logs.
- Templates encode server-authoritative patterns (schema validation, rate limiting, UpdateAsync discipline).

[1.0.0]: https://github.com/renniyy/george-gui-search/releases/tag/v1.0.0
