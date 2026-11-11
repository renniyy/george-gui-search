# Developer guide

Everything you need to work on GEORGE GUI @Search itself.

## Setup

```bash
git clone https://github.com/renniyy/george-gui-search.git
cd george-gui-search
npm install
npm run build     # tsc -> dist/
npm test          # builds, then runs the full suite (71 tests)
```

Layout:

```text
src/
  index.ts          stdio entry point
  server.ts         the 10 MCP tools (schemas + handlers)
  core/
    tokens.ts         palettes + scales, Theme emission
    spec.ts           GuiSpec IR types
    gui-generator.ts  intent detection, spec building, assembly
    kinds-common.ts   shared options/defaults
    kinds-a.ts        templates: main-menu, shop, inventory, settings
    kinds-b.ts        templates: hud, loading, leaderboard, notifications, dialogue, quest-tracker, profile-card
    luau-shell.ts     shared Luau shell (prelude, controller pattern)
    luau-text.ts      canonicalizer (indent + one-prop-per-line + statement commas)
    luau-review.ts    static analysis rules
    luau-templates.ts secure-remotes / profile-store / signal
    audit.ts          self-critique engine (contrast math, targets)
    knowledge.ts      research index
    image.ts          pixel renderer, SVG composer, providers
    png.ts            dependency-free PNG encoder
    scaffold.ts       project scaffolder
  integrations/
    registry.ts       11 mandated + ecosystem integrations, health probes
    changedetection.ts changedetection.io REST client
  test/             node:test suites (unit + MCP e2e over stdio)
scripts/            build-time utilities (palette solver, template reflow)
brand/              logo system, mascot, social preview, guidelines
docs/               the documentation ecosystem
```

## The golden rule

**Every Luau string that leaves the package goes through `finalizeLuau()`** (in `src/core/luau-text.ts`). It normalizes indentation to tabs, enforces one-property-per-line inside multiline table constructors with trailing commas, strips statement-level commas, and collapses blank-line runs. This is what keeps generated code byte-identical to StyLua output (`stylua.toml` ships in the repo root; CI checks it).

When you edit templates in `kinds-a.ts` / `kinds-b.ts` / `luau-shell.ts`:

- Write Luau inside the template literals; use `\t` escapes or tabs — both are normalized.
- One property per line in multiline `create(...)` tables.
- Never introduce lines over **130 columns** (excluding comments) — the invariant test enforces it.
- After editing, run `npm test` — the suite audits all 12 kinds × 6 palettes × 2 modes at 100/100 and asserts the canonicalizer is idempotent.

## Adding an interface kind

1. Add the kind to `GuiKind` in `src/core/spec.ts` and the keyword map in `gui-generator.ts` (`KIND_KEYWORDS`).
2. Write the template (a `KindTemplate`) in `kinds-a.ts` or `kinds-b.ts`: `kindLabel`, `usageNote`, `buildBody`, `controllerExtras`, `open`/`close`.
3. Mirror the structure in `buildSpecFor` (the IR the audit engine scores — labels, buttons with real pixel sizes, backgrounds).
4. Add the controller API to the kind-specific assertions in `src/test/gui-generator.test.ts`.
5. Run the tests. The audit will tell you (with exact contrast ratios and target sizes) if the design fails the quality gate. Fix the design, not the test.

## Adding a palette

Add it to `PALETTES` in `tokens.ts`, then run the solver:

```bash
node /path/to/scripts/adjust-palettes.mjs   # from the repo: node ../scripts/adjust-palettes.mjs
```

It searches lightness values (keeping hue/saturation) until every required contrast pair reaches ≥ 4.6:1 and prints solved hexes. Paste them back. The 144-case audit test then proves it across every kind.

## Adding a review rule

`luau-review.ts` has two rule families: `SIMPLE_RULES` (regex per line) and contextual checks (pcall-proximity for DataStore, validation-proximity for remotes, yield-proximity for loops). Add the rule, then add a passing and a failing case to `luau-review.test.ts`. Rules must never fire on the package's own generated output (the suite enforces this).

## The e2e protocol test

`src/test/server.e2e.test.ts` spawns `dist/index.js` and talks real MCP over stdio with the official client SDK: lists tools, calls seven of them, asserts structured content and image blocks, and verifies invalid input is rejected. If you change a tool schema, this test breaks first — that is the point.

## Commit style and CI

- Conventional-ish subjects: `feat:`, `fix:`, `docs:`, `chore:`.
- CI runs: typecheck → build → tests (incl. e2e) → `npm pack --dry-run` → Trivy dependency scan → Semgrep → Scorecard. Releases are tagged and published by the release workflow.

## Releasing

1. Update `CHANGELOG.md` and the version in `package.json` + `src/core/gui-generator.ts` (`GEORGE_VERSION`) + `CITATION.cff`.
2. `npm install` (refresh lockfile), `npm test`.
3. Tag `vX.Y.Z` and push; the release workflow publishes to npm and creates the GitHub release.
