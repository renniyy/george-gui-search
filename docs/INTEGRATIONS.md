# Integration acceptance report

**Mandated policy:** this package's integration ecosystem must list every mandated repository, state its exact role, and never mark an integration complete without working functionality. This report is the ground truth; `george_integrations` reports the same statuses live.

**Status vocabulary**

- **bundled** — real code in this package, active without configuration.
- **adapter** — real client code in this package; requires the external service (activated by environment variables) and degrades gracefully when absent.
- **policy** — realized as enforced engine behaviour in this package (the discipline, not the upstream code).
- **documented** — integration contract specified; **no code path ships** and it is never reported as available.

## The eleven mandated repositories

| # | Repository | Role | Status | Evidence & limits |
| --- | --- | --- | --- | --- |
| 1 | [modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk) | MCP foundation | **bundled** (sdk) | Direct dependency `^1.32.2`. Every tool registration, stdio transport and the e2e protocol test run through it. |
| 2 | [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) | Adaptive web extraction | **adapter** (python-sidecar) | REST sidecar contract (`GEORGE_SCRAPLING_URL`); sidecar script shipped at `examples/integrations/scrapling_sidecar.py`. Requires Python + Scrapling installed by you; not bundled. Health probe on `/health`. |
| 3 | [storytold/craft-anything](https://github.com/storytold/craft-anything) | Reference-inspect → clean-room build | **policy** (engine-rule) | The GUI pipeline is clean-room by construction: interfaces are generated from an original GuiSpec IR + token system, never copied markup. Upstream code is neither bundled nor required. |
| 4 | [morluto/rea](https://github.com/morluto/rea) | Authorized binary/software inspection | **documented** (cli) | Contract: `GEORGE_REA_COMMAND`. No code path ships in 1.0 — deliberate: reverse-engineering workflows require explicit operator authorization and legal review first. |
| 5 | [browser-use/browser-use](https://github.com/browser-use/browser-use) | Authorized browser automation | **adapter** (rest) | REST client via `GEORGE_BROWSER_USE_URL`; only used for tasks you explicitly request. Health probe included. |
| 6 | [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) | Extended research reach | **adapter** (rest) | `GEORGE_AGENT_REACH_URL`; results merged into research best-effort, always attributed, never presented as verified knowledge. |
| 7 | [dgtlmoon/changedetection.io](https://github.com/dgtlmoon/changedetection.io) | Doc/dependency change monitoring | **adapter** (rest) | Official REST API client (`listWatches`/`createWatch`/`triggerCheck`) activated by `GEORGE_CHANGEDETECTION_URL` (+ API key). Tested against the documented API shape; requires your instance. |
| 8 | [mattpocock/skills](https://github.com/mattpocock/skills) | Engineering workflow discipline | **policy** (engine-rule) | Types-first, small modules, rigorous review — encoded as: `--!strict` by default, typed controller APIs, review-engine complexity/dead-output rules. **None of the repository's contents are redistributed; its license requires verification before redistribution.** |
| 9 | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | Minimal, maintainable implementations | **policy** (engine-rule) | Enforced: single-file self-contained modules, zero external Luau deps, review flags for debug leftovers and oversized functions. |
| 10 | [miqdadbadjuber/anti-slop](https://github.com/miqdadbadjuber/anti-slop) | Filter generic AI output | **policy** (engine-rule) | Enforced as audit rules: token-system-only styling, meaningful-label requirement (placeholder text is flagged), kind-aware structure instead of generic panels. |
| 11 | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Product polish & accessibility | **policy** (engine-rule) | Enforced with math: WCAG contrast on every pair, 36 px targets, ≥ 12 px text, scale-based responsive layout, gamepad focus feedback on every button. |

## Ecosystem integrations

| Repository | Role | Status |
| --- | --- | --- |
| [github/github-mcp-server](https://github.com/github/github-mcp-server) | Repository/PR/issue workflows | **documented** — compose with the official server in your MCP client; George neither requires nor handles GitHub credentials |
| [rojo-rbx/rojo](https://github.com/rojo-rbx/rojo) | Filesystem ↔ Studio sync | **bundled** — scaffolder emits Rojo projects |
| [rojo-rbx/rokit](https://github.com/rojo-rbx/rokit) | Pinned toolchains | **bundled** — scaffolds pin rojo/stylua/wally/luau-lsp |
| [UpliftGames/wally](https://github.com/UpliftGames/wally) | Luau packages | **bundled** — scaffolds include wally.toml |
| [JohnnyMorganz/StyLua](https://github.com/JohnnyMorganz/StyLua) | Formatting | **bundled** — output is StyLua-canonical under the shipped config; verified against StyLua 2.0.2 |
| [Kampfkarren/selene](https://github.com/Kampfkarren/selene) | Linting | **bundled** — scaffolds ship .selene.toml; George's review engine covers Roblox-specific rules Selene does not |
| [JohnnyMorganz/luau-lsp](https://github.com/JohnnyMorganz/luau-lsp) | Type checking | **bundled** — generated modules are `--!strict` and typecheck under luau-lsp |
| [lune-org/lune](https://github.com/lune-org/lune) | Build automation | **bundled** — scaffold `scripts/` convention documented for Lune |
| [Roblox/creator-docs](https://github.com/Roblox/creator-docs) | Upstream docs | **bundled** — knowledge base links to create.roblox.com pages |
| [Comfy-Org/ComfyUI](https://github.com/Comfy-Org/ComfyUI) | Local image generation | **adapter** — real REST client (submit/poll/fetch); GPL service stays a separate process |
| [microsoft/playwright](https://github.com/microsoft/playwright) | Web testing | **documented** — recommended for companion web surfaces |
| [zeux/meshoptimizer](https://github.com/zeux/meshoptimizer) | 3D optimization | **documented** — recommended in 3D workflows (see roadmap) |
| [langfuse/langfuse](https://github.com/langfuse/langfuse) | LLM observability | **documented** — optional external; George ships no telemetry |
| [open-telemetry/opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js) | Telemetry standard | **documented** — optional for embedding scenarios |
| [aquasecurity/trivy](https://github.com/aquasecurity/trivy) | Dependency scanning | **bundled** — CI runs Trivy on every push/PR |
| [semgrep/semgrep](https://github.com/semgrep/semgrep) | Static security analysis | **bundled** — CI runs Semgrep (p/typescript) |
| [ossf/scorecard](https://github.com/ossf/scorecard) | Security posture | **bundled** — CI runs Scorecard checks |
| [dequelabs/axe-core](https://github.com/dequelabs/axe-core) | Web accessibility | **documented** — for companion web surfaces; in-Studio accessibility is enforced by George's own audit math |

## Licensing and attribution

Every entry keeps its upstream license; this package bundles none of the mandated repositories' source. Copyleft components (ComfyUI GPL-3.0) run strictly as separate services. Skill/policy repositories whose licenses are unverified (craft-anything, rea, mattpocock/skills, ponytail, anti-slop, impeccable) are integrated as *behaviour*, not redistributed content. No upstream maintainer endorses GEORGE GUI @Search.

## Known limitations (honest list)

1. The `rea` CLI contract is specified but unimplemented (documented status).
2. github-mcp-server composition is guidance, not code — by design.
3. Adapter tests exercise contract shapes and health probing; live end-to-end runs require your service instances.
4. Roblox Studio MCP integration is knowledge-base guidance in 1.0, not an automated bridge (see roadmap).
