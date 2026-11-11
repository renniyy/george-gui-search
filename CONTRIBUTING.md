# Contributing to GEORGE GUI @Search

Thanks for helping build the most trustworthy Roblox creative MCP. This project values **verified claims, honest status reporting, and design guarantees enforced by math** — contributions should uphold that.

## Getting started

```bash
git clone https://github.com/renniyy/george-gui-search.git
cd george-gui-search
npm install
npm run build
npm test
```

All 71 tests must pass before any PR is mergeable (CI enforces the same gate).

## How to contribute

| Type | Where | Notes |
| --- | --- | --- |
| Bug fix | any module | Add a failing test first, then fix. |
| New interface kind | `src/core/kinds-*.ts` + `buildSpecFor` | Must pass the 144-case audit gate at 100/100. See [DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md). |
| New palette | `src/core/tokens.ts` | Must be WCAG-solved (`scripts/adjust-palettes.mjs`). |
| New review rule | `src/core/luau-review.ts` | Must not fire on the package's own generated output. |
| New integration adapter | `src/integrations/` | Must be honest: real client code + env contract + health probe, or don't ship it. |
| Docs | `docs/` | Must reflect implemented behaviour only — no aspirational features marked as available. |
| Brand assets | `brand/` | Follow [BRAND_GUIDELINES.md](brand/BRAND_GUIDELINES.md). |

## Pull request process

1. Fork, create a feature branch (`feat/...`, `fix/...`).
2. Make the change; keep functions small and modules single-purpose.
3. `npm test` — everything green, including new tests you added.
4. Update docs if user-facing behaviour changed, and `CHANGELOG.md` (Unreleased section).
5. Open the PR against `main` using the template — CI runs typecheck, tests, package dry-run, Trivy, Semgrep and Scorecard.

## Code standards

- TypeScript strict mode; no `any` without a comment explaining why.
- Luau templates: one property per line, ≤ 130 columns (excluding comments), `--!strict`-compatible.
- No new runtime dependencies without a compelling reason (the zero-native-deps property is a feature).
- Never print secrets; stderr only for logs.

## Reporting bugs

Use the issue templates. Include: Node version, MCP client, the exact tool call (JSON), expected vs actual, and stderr from a manual `npx george-gui-search` run.

## Security issues

Do not open public issues — see [SECURITY.md](SECURITY.md).

## Licensing

By contributing you agree your contributions are licensed under the repository's [MIT license](LICENSE).
