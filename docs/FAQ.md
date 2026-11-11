# FAQ

**Is this an image-generation wrapper?**
No. George generates real, editable Roblox code: complete UI modules, script systems, design tokens and project scaffolds. Image generation is one optional tool, and even that has an offline deterministic renderer.

**Which MCP clients work?**
Anything speaking MCP over stdio: Claude Desktop, Claude Code, VS Code, Cursor, Zed, the MCP Inspector, and custom clients built on the official SDKs.

**Do I need API keys?**
No. Every core feature runs offline. Keys only activate optional external image providers and automation adapters.

**What exactly does the audit check?**
WCAG contrast math (relative luminance) on every text/background pair, minimum 36 px touch targets, minimum 12 px text, safe-area/responsive behaviour. Every kind × palette × mode combination ships at 100/100 — enforced by 144 test cases.

**Why do generated buttons sometimes have dark text?**
Because contrast is solved, not styled: on bright primary fills (dark themes), a dark label is the only way to reach 4.5:1. The palettes pick `primaryText` per side automatically.

**Is the generated Luau type-safe?**
It's written for `--!strict` and typechecks under luau-lsp definitions. A few dynamic spots (instance factories) are intentionally typed `any` — the standard Luau pattern for `Instance.new` by class name.

**Can I edit generated code?**
Yes — it's yours. The modules are single-file with no dependencies. Edit freely; run `george_review_luau` on your edits to keep them clean.

**How do I add my own palette?**
Fork and extend `PALETTES` in `src/core/tokens.ts`, solve it with `scripts/adjust-palettes.mjs`, and the test suite will verify it across every interface kind. (Palette contributions are welcome PRs.)

**Does it work with Rojo?**
Yes — `george_project_scaffold` emits a complete Rojo/Rokit/Wally/StyLua/Selene project, and generated modules drop into `src/shared`.

**What's the difference between an "adapter" and "policy" integration?**
Adapters ship real client code that talks to a service you run (activated by environment variables). Policy integrations are realized as enforced engine behaviour (for example, anti-slop as audit rules). Both are reported honestly by `george_integrations`; documented-but-unimplemented entries are never listed as available. See [INTEGRATIONS.md](INTEGRATIONS.md).

**Does George connect to Roblox Studio by itself?**
Not in 1.0. The intended flow is: generate here → paste or sync via Rojo → (optionally) drive Studio through its own MCP server. Roblox Studio MCP is listed in the knowledge base with its docs link.

**Why is my thumbnail the same every time?**
The local renderer is deterministic by design — same inputs, same bytes (tested). That makes it reproducible in CI. External providers are not deterministic.

**Is there telemetry?**
No. No analytics, no crash reporting, no phone-home. Logs are local stderr only.

**MIT license — can I use generated code commercially?**
Yes. Generated output is yours; the MIT license covers the package itself. Attribution is appreciated, never required for output.
