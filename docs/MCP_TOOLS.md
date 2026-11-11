# MCP tools reference

All tools are registered on the stdio MCP server with zod-validated input schemas (invalid arguments are rejected by the SDK before handlers run). Tools marked **structured** also return machine-readable `structuredContent`.

---

## george_version

Version and capability report.

**Input:** none. **Output (structured):** `version`, `interfaceKinds` (12), `palettes` (6), `luauTemplates` (3), `knowledgeEntries` (43).

---

## george_search — George Research

Search a curated, source-linked knowledge base of Roblox UI, scripting, networking, data, optimization, tooling, MCP and security facts. Every entry carries an official documentation URL. Results are returned verbatim — never fabricated.

**Input:**

| Field | Type | Notes |
| --- | --- | --- |
| `query` | string (≥ 2 chars) | Free text, e.g. `"remote event security"` |
| `category` | enum (optional) | `ui` `scripting` `networking` `data` `optimization` `tooling` `mcp` `security` |
| `limit` | int 1–10 (default 5) | Max results |

**Output (structured):** `results: [{ title, category, summary, url }]`, `totalKnowledgeEntries`.

---

## george_design_system — George Designer

Emit a complete design token system.

**Input:**

| Field | Type | Notes |
| --- | --- | --- |
| `palette` | string (optional) | Omit to list the 6 palettes with moods |
| `mode` | `dark` \| `light` (default dark) | |
| `guiName` | string (default `Theme`) | Module comment target |

**Output (structured):** either `{ palettes: [...] }` or `{ palette, mode, themeModule (Luau), tokensJson }`.

---

## george_generate_gui — George Builder

Natural language → a complete, audited Roblox interface module.

**Input:**

| Field | Type | Notes |
| --- | --- | --- |
| `description` | string (≥ 3 chars) | Drives intent detection when `kind` is omitted |
| `kind` | enum (optional) | One of the 12 kinds; default auto-detected |
| `palette` | string (optional) | Palette id (default `midnight-nebula`) |
| `mode` | `dark` \| `light` (default dark) | |
| `title`, `subtitle` | string (optional) | |
| `items` | array (≤ 24) | `{ name, subtitle?, price?, badge? }` — shop/inventory cards |
| `tabs` | array (≤ 8) | Tab labels |
| `stats` | array (≤ 6) | `{ label, value }` — HUD chips / wallet |
| `objectives` | array (≤ 10) | `{ text, done? }` — quest tracker |
| `tips` | array (≤ 8) | Loading-screen tips |
| `playerName` | string (optional) | Profile card |

**Output (structured):** `kind`, `guiName`, `palette`, `actions`, `auditScore`, `auditPassed`, `auditSummary`, `notes`, and the full `spec` (GuiSpec IR — feed it to `george_audit_gui`). Text content contains the complete Luau module in a fenced block.

**Audited guarantees** (enforced for every kind × palette × mode by the test suite): contrast ≥ 4.5:1 on all text, all interactive targets ≥ 36 px, all text ≥ 12 px, `--!strict`, modern APIs only, StyLua-canonical formatting.

---

## george_audit_gui — George Inspector

Re-run the self-critique engine on a GuiSpec.

**Input:** `spec` (the GuiSpec JSON from `george_generate_gui`'s structured output), optional `palette` / `mode` overrides.

**Output (structured):** `score` (0–100), `passed`, `summary`, `checks: [{ id, level, target, message }]` with levels `pass` / `info` / `warn` / `fail`.

---

## george_generate_luau — George Engineer

**Input:** `template` — `secure-remotes` | `profile-store` | `signal`.

**Output (structured):** `template`, `files: [{ name, location, purpose }]`; text content contains each file's full Luau with placement instructions.

---

## george_review_luau — George Engineer

Roblox-specialised static analysis.

**Input:** `source` (Luau text).

**Output (structured):** `passed`, `errors`, `warnings`, `summary`, `issues: [{ rule, severity, line, message, suggestion }]`.

Rules: `deprecated-wait/spawn/delay`, `loadstring`, `environment-escape`, `datastore-unprotected`, `prefer-updateasync`, `remote-unvalidated`, `frozen-loop`, `input-ignores-processed`, `legacy-game-reference`, `require-waitforchild-asset`, `debug-print`, `missing-strict`.

---

## george_project_scaffold — George Architect

**Input:** `name` (1–48 chars; sanitized).

**Output (structured):** `name`, `tree` (ASCII tree), `fileCount` (10). Text content contains every file: `default.project.json`, `rokit.toml`, `wally.toml`, `stylua.toml`, `selene.toml`, `src/server/init.server.lua`, `src/client/init.client.lua`, `src/shared/init.lua`, `.gitignore`, `README.md`.

---

## george_generate_thumbnail — George Designer

**Input:** `title` (≤ 40), `subtitle?`, `palette?`, `badge?` (≤ 16), `mascotPath?` (local PNG for the SVG variant), `width`/`height` (256–1920, defaults 1280×720).

**Output:** an MCP **image content block** (PNG, base64) plus text content containing the SVG banner variant. With a configured provider the external API is used; on failure it falls back to the offline pixel renderer and says so in the `source` field.

---

## george_integrations — George Marketplace

**Input:** `probe` (bool, default false — live-ping configured HTTP adapters), `scope` — `mandatory` | `ecosystem` | `all`.

**Output (structured):** `configured`, `bundled`, `policies`, `documented` (integration id arrays), `imageProviders`. Text content is the per-integration report. Statuses: ACTIVE / CONFIGURED (unreachable) / NOT CONFIGURED — never aspirational.

---

## Error contract

Handlers return `isError: true` results with actionable messages (e.g. which field failed). Invalid input is rejected at the schema layer by the SDK. External provider failures degrade to local fallbacks rather than errors wherever a fallback exists.
