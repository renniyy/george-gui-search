# Security policy

## Report a vulnerability

Please use [GitHub security advisories](https://github.com/renniyy/george-gui-search/security/advisories) (preferred) or email the maintainer via the profile page. Do not open public issues for vulnerabilities. You will receive a response within 7 days.

## Scope and guarantees

### What George does with your data

- The MCP server runs **locally** and makes **no network calls** for any core feature.
- Tool inputs (descriptions, Luau code, item data) are processed in memory and returned in tool responses — nothing is persisted, telemetered, or transmitted.
- Logs go to **stderr only**; secrets configured via environment variables never appear in tool output, logs, or generated code.

### External providers (opt-in only)

If you configure `GEORGE_IMAGE_API_URL`, `GEORGE_COMFY_URL`, `GEORGE_SCRAPLING_URL`, `GEORGE_AGENT_REACH_URL`, `GEORGE_BROWSER_USE_URL` or `GEORGE_CHANGEDETECTION_URL`, the corresponding requests (including the content you pass to those tools) go to those endpoints. George:

- uses short, hard timeouts (2 s health probes, 60–120 s generation),
- never sends credentials to any host other than the one you configured,
- treats external responses as untrusted data (no code execution from responses).

### Generated code trust model

Generated Luau is inert until *you* place it in your game and wire actions. It contains no network calls, no `require` of remote assets, and no obfuscated segments. The review engine additionally flags `loadstring`, `getfenv`/`setfenv` and numeric-id `require` in any code you paste into it.

## Supply chain

- Runtime dependencies: `@modelcontextprotocol/sdk` and `zod` (both pinned by lockfile).
- CI runs Trivy (dependency vulnerabilities), Semgrep (static security analysis) and OpenSSF Scorecard on every push and pull request.
- Releases are built from tagged commits on `main`; the npm package contains only `dist/`, `docs/`, `examples/` and license files — no scripts run on install (no postinstall).

## Threat model notes for generated games

The Luau templates encode production Roblox security posture:

- **secure-remotes**: schema validation + per-player rate limiting + silent payload drop — the server never trusts client payloads.
- **profile-store**: `pcall` + retries + `UpdateAsync` (never blind `SetAsync`) + stale-write protection + `BindToClose` flush.
- The review engine fails builds with unprotected DataStore calls or unvalidated remote handlers.

## Changelog for security fixes

Security-relevant fixes are listed in [CHANGELOG.md](../CHANGELOG.md) under the `security` keyword.
