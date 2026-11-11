/**
 * GEORGE GUI @Search — integration registry ("George Marketplace").
 *
 * Honest, machine-readable status of every third-party integration.
 * An entry is only marked `bundled` or `adapter` when real code ships in
 * this package; `policy` means the integration is realized as enforced
 * engine behaviour; `documented` means the integration contract is specified
 * (URL/env) but the implementation is planned and clearly NOT advertised
 * as available.
 */

export type IntegrationKind = "bundled" | "adapter" | "policy" | "documented";
export type IntegrationTransport = "sdk" | "rest" | "cli" | "python-sidecar" | "engine-rule" | "docs";

export interface IntegrationStatus {
  configured: boolean;
  reachable: boolean | null;
  detail: string;
}

export interface Integration {
  id: string;
  name: string;
  repo: string;
  role: string;
  kind: IntegrationKind;
  transport: IntegrationTransport;
  license: string;
  /** What actually ships in this package for this integration. */
  implementation: string;
  /** Environment variables that activate it (adapters only). */
  env?: string[];
  /** Health-check endpoint pattern (adapters only). */
  healthUrl?: (base: string) => string;
  notes?: string;
}

export const MANDATORY_REPOSITORIES: Integration[] = [
  {
    id: "typescript-sdk",
    name: "MCP TypeScript SDK",
    repo: "https://github.com/modelcontextprotocol/typescript-sdk",
    role: "Foundation of the George GUI MCP server: tools, transports, protocol compliance.",
    kind: "bundled",
    transport: "sdk",
    license: "MIT",
    implementation: "Direct dependency (@modelcontextprotocol/sdk ^1.32). Every tool registration, the stdio transport and the e2e protocol test in this package run through it.",
    notes: "The single hardest dependency of the project; pinned with a caret range and lockfile.",
  },
  {
    id: "scrapling",
    name: "Scrapling",
    repo: "https://github.com/D4Vinci/Scrapling",
    role: "Adaptive web extraction for the research pipeline (fetch pages that block plain HTTP clients).",
    kind: "adapter",
    transport: "python-sidecar",
    license: "BSD-3-Clause",
    implementation: "REST sidecar adapter: set GEORGE_SCRAPLING_URL to a running sidecar (see examples/integrations/scrapling_sidecar.py, which wraps Scrapling's fetchers) and the george_search tool will route extraction through it, falling back to the offline knowledge base on any error.",
    env: ["GEORGE_SCRAPLING_URL"],
    healthUrl: (base) => `${base.replace(/\/$/, "")}/health`,
    notes: "Scrapling is a Python library, so it runs out-of-process. Never bundle: independent service boundary.",
  },
  {
    id: "craft-anything",
    name: "Craft Anything",
    repo: "https://github.com/storytold/craft-anything",
    role: "Reference-inspect -> clean-room build discipline: study references, then construct original implementations.",
    kind: "policy",
    transport: "engine-rule",
    license: "Verify before redistribution",
    implementation: "Realized as the clean-room generation policy of the GUI pipeline: every interface is generated from an original GuiSpec IR + design tokens, never from copied markup, and the audit engine rejects template-slop patterns (see the anti-slop rule family in src/core/audit.ts).",
    notes: "No source from the upstream repository is bundled or required at runtime; the discipline is encoded, not the code.",
  },
  {
    id: "rea",
    name: "REA",
    repo: "https://github.com/morluto/rea",
    role: "Evidence-based inspection of software/binaries the operator owns or is authorized to analyse.",
    kind: "documented",
    transport: "cli",
    license: "Verify before redistribution",
    implementation: "Integration contract documented: GEORGE_REA_COMMAND points at a local REA executable; the security-review workflow invokes it on user-owned artifacts only. No code path ships yet — this integration is NOT advertised as available in the current release.",
    env: ["GEORGE_REA_COMMAND"],
    notes: "Deliberately gated: reverse-engineering workflows demand explicit operator authorization and legal review first.",
  },
  {
    id: "browser-use",
    name: "Browser Use",
    repo: "https://github.com/browser-use/browser-use",
    role: "Interactive browser automation for authorised web workflows and visual inspection.",
    kind: "adapter",
    transport: "rest",
    license: "MIT",
    implementation: "REST adapter: set GEORGE_BROWSER_USE_URL to a running browser-use server and the research workflow can dispatch browsing tasks via its /task API, with timeout and graceful failure handling.",
    env: ["GEORGE_BROWSER_USE_URL"],
    healthUrl: (base) => `${base.replace(/\/$/, "")}/health`,
    notes: "Only performs tasks explicitly requested by the operator; browser automation must respect site terms.",
  },
  {
    id: "agent-reach",
    name: "Agent-Reach",
    repo: "https://github.com/Panniantong/Agent-Reach",
    role: "Multi-platform research reach across internet sources.",
    kind: "adapter",
    transport: "rest",
    license: "MIT",
    implementation: "REST adapter: set GEORGE_AGENT_REACH_URL and george_search merges its results (best-effort, marked with the source) alongside the verified offline knowledge base.",
    env: ["GEORGE_AGENT_REACH_URL"],
    healthUrl: (base) => `${base.replace(/\/$/, "")}/health`,
    notes: "Results are always attributed and never presented as verified knowledge unless the offline KB confirms them.",
  },
  {
    id: "changedetection",
    name: "changedetection.io",
    repo: "https://github.com/dgtlmoon/changedetection.io",
    role: "Scheduled monitoring of documentation, APIs and dependency pages the project depends on.",
    kind: "adapter",
    transport: "rest",
    license: "Apache-2.0",
    implementation: "REST adapter over the official changedetection.io REST API: set GEORGE_CHANGEDETECTION_URL (+ GEORGE_CHANGEDETECTION_API_KEY) to list/create watches for upstream docs directly from the george_integrations tool.",
    env: ["GEORGE_CHANGEDETECTION_URL", "GEORGE_CHANGEDETECTION_API_KEY"],
    healthUrl: (base) => `${base.replace(/\/$/, "")}/api/v1/watch`,
    notes: "The officially documented REST API is used; no fork, no scraping.",
  },
  {
    id: "mattpocock-skills",
    name: "Matt Pocock's Skills",
    repo: "https://github.com/mattpocock/skills",
    role: "Engineering workflow discipline (types-first, small modules, rigorous review).",
    kind: "policy",
    transport: "engine-rule",
    license: "Verify before redistribution",
    implementation: "Influences the shipped engineering rules: --!strict Luau by default, typed module APIs, and the review engine's complexity guidance. The repository's contents are NOT redistributed with this package.",
    notes: "License verification is required before any redistribution of its contents; this package intentionally ships none of it.",
  },
  {
    id: "ponytail",
    name: "Ponytail",
    repo: "https://github.com/DietrichGebert/ponytail",
    role: "Minimal, maintainable implementations and rigorous review standards.",
    kind: "policy",
    transport: "engine-rule",
    license: "Verify before redistribution",
    implementation: "Enforced by the review engine: generated modules are single-file and self-contained, and the review flags oversized functions and dead debug output (see src/core/luau-review.ts rules).",
    notes: "Minimalism is a design constraint of every generated artifact: one ModuleScript, zero external Luau dependencies.",
  },
  {
    id: "anti-slop",
    name: "Anti-Slop",
    repo: "https://github.com/miqdadbadjuber/anti-slop",
    role: "Quality filter against generic AI-generated interfaces, copy and code.",
    kind: "policy",
    transport: "engine-rule",
    license: "Verify before redistribution",
    implementation: "Realized as the anti-slop rule family: generated interfaces must use the design-token system (never ad-hoc hex colors), every visible label must be meaningful (placeholder text like 'Lorem ipsum', 'Click here', 'Button' is flagged by the audit), and structure must come from the kind-aware recipes.",
    notes: "The slop filter is native code in this package, not a wrapper around the upstream repository.",
  },
  {
    id: "impeccable",
    name: "Impeccable",
    repo: "https://github.com/pbakaus/impeccable",
    role: "Product polish: design-system discipline, accessibility, responsive behaviour.",
    kind: "policy",
    transport: "engine-rule",
    license: "Verify before redistribution",
    implementation: "Realized as the measurable polish gates in the audit engine: WCAG contrast math on every text/background pair, 36px minimum touch targets, minimum text sizes, scale-based responsive layout with UISizeConstraints, and gamepad focus feedback on every button.",
    notes: "Polish is enforced with math, not vibes: contrast ratios and pixel sizes are computed, not eyeballed.",
  },
];

export const ECOSYSTEM_INTEGRATIONS: Integration[] = [
  {
    id: "github-mcp-server",
    name: "GitHub MCP Server (official)",
    repo: "https://github.com/github/github-mcp-server",
    role: "Authenticated repository, PR, issue and Actions workflows.",
    kind: "documented",
    transport: "sdk",
    license: "MIT",
    implementation: "Composition guidance: run the official github-mcp-server alongside George and let your MCP client connect to both; George projects scaffold with Git/Rojo workflows that pair naturally with it. No GitHub code or credentials are required or handled by this package.",
    notes: "Deliberately not duplicated: the official server is the right integration point.",
  },
  {
    id: "rojo",
    name: "Rojo",
    repo: "https://github.com/rojo-rbx/rojo",
    role: "Filesystem-to-Studio sync for scaffolded projects.",
    kind: "bundled",
    transport: "docs",
    license: "MPL-2.0",
    implementation: "The project scaffolder (george_project_scaffold) emits a Rojo-ready layout: default.project.json, src/, tests/ and tooling configs.",
  },
  {
    id: "rokit",
    name: "Rokit",
    repo: "https://github.com/rojo-rbx/rokit",
    role: "Pinned toolchain for scaffolded projects.",
    kind: "bundled",
    transport: "docs",
    license: "MPL-2.0",
    implementation: "Scaffolds include rokit.toml pinning rojo/stylua/wally/luau-lsp so every contributor gets identical tooling.",
  },
  {
    id: "wally",
    name: "Wally",
    repo: "https://github.com/UpliftGames/wally",
    role: "Luau package management for scaffolded projects.",
    kind: "bundled",
    transport: "docs",
    license: "MPL-2.0",
    implementation: "Scaffolds include a wally.toml with a standard Packages folder wired into the Rojo project.",
  },
  {
    id: "stylua",
    name: "StyLua",
    repo: "https://github.com/JohnnyMorganz/StyLua",
    role: "Deterministic formatting; generated Luau is StyLua-compatible.",
    kind: "bundled",
    transport: "docs",
    license: "MPL-2.0",
    implementation: "Generated Luau uses tabs and StyLua-style layout, so `stylua --check` passes on every emitted module (verified in the test suite).",
  },
  {
    id: "selene",
    name: "Selene",
    repo: "https://github.com/Kampfkarren/selene",
    role: "Roblox-aware linting; complements george_review_luau.",
    kind: "bundled",
    transport: "docs",
    license: "MPL-2.0",
    implementation: "Scaffolds ship a .selene.toml with the Roblox standard library; George's review engine covers Roblox-specific production rules Selene does not.",
  },
  {
    id: "luau-lsp",
    name: "Luau Language Server",
    repo: "https://github.com/JohnnyMorganz/luau-lsp",
    role: "Type checking of generated Luau.",
    kind: "bundled",
    transport: "docs",
    license: "MPL-2.0",
    implementation: "Every generated module starts with --!strict and is written to typecheck cleanly under luau-lsp definitions.",
  },
  {
    id: "lune",
    name: "Lune",
    repo: "https://github.com/lune-org/lune",
    role: "Out-of-Studio build/automation scripting for scaffolded projects.",
    kind: "bundled",
    transport: "docs",
    license: "MPL-2.0",
    implementation: "Scaffolds include a scripts/ folder convention documented for Lune automation.",
  },
  {
    id: "creator-docs",
    name: "Roblox Creator Docs",
    repo: "https://github.com/Roblox/creator-docs",
    role: "Upstream documentation source behind the knowledge base.",
    kind: "bundled",
    transport: "docs",
    license: "CC BY 4.0 (docs content)",
    implementation: "The offline knowledge base links to create.roblox.com pages; entries carry verified summaries written for this package.",
  },
  {
    id: "comfyui",
    name: "ComfyUI",
    repo: "https://github.com/Comfy-Org/ComfyUI",
    role: "Local high-quality image generation backend.",
    kind: "adapter",
    transport: "rest",
    license: "GPL-3.0",
    implementation: "Real REST adapter (submit /prompt, poll /history, fetch /view) in src/core/image.ts; activated with GEORGE_COMFY_URL. The GPL service runs separately and is never linked into this package's code.",
    env: ["GEORGE_COMFY_URL", "GEORGE_COMFY_CHECKPOINT"],
    healthUrl: (base) => `${base.replace(/\/$/, "")}/system_stats`,
    notes: "Service boundary keeps the MIT-licensed package independent of the GPL backend.",
  },
  {
    id: "playwright",
    name: "Playwright",
    repo: "https://github.com/microsoft/playwright",
    role: "Browser automation and visual regression testing of web surfaces.",
    kind: "documented",
    transport: "cli",
    license: "Apache-2.0",
    implementation: "Recommended for testing any web dashboard you build around George; not required by the package itself.",
  },
  {
    id: "meshoptimizer",
    name: "meshoptimizer",
    repo: "https://github.com/zeux/meshoptimizer",
    role: "Geometry optimisation for 3D asset pipelines.",
    kind: "documented",
    transport: "cli",
    license: "MIT",
    implementation: "Recommended in the 3D asset workflow docs for optimising meshes before Roblox upload; not required by this package.",
  },
  {
    id: "langfuse",
    name: "Langfuse",
    repo: "https://github.com/langfuse/langfuse",
    role: "LLM tracing and evaluation observability.",
    kind: "documented",
    transport: "rest",
    license: "MIT",
    implementation: "Optional external observability for the AI providers you connect; George itself logs to stderr only and ships no telemetry.",
  },
  {
    id: "opentelemetry",
    name: "OpenTelemetry",
    repo: "https://github.com/open-telemetry/opentelemetry-js",
    role: "Standardised telemetry.",
    kind: "documented",
    transport: "sdk",
    license: "Apache-2.0",
    implementation: "Recommended if you embed George engines in a larger service; the package itself is telemetry-free by design.",
  },
  {
    id: "trivy",
    name: "Trivy",
    repo: "https://github.com/aquasecurity/trivy",
    role: "Dependency and container vulnerability scanning (CI).",
    kind: "bundled",
    transport: "docs",
    license: "Apache-2.0",
    implementation: "The CI workflow runs Trivy scans on the npm dependency tree on every push and PR.",
  },
  {
    id: "semgrep",
    name: "Semgrep",
    repo: "https://github.com/semgrep/semgrep",
    role: "Static security analysis (CI).",
    kind: "bundled",
    transport: "docs",
    license: "LGPL-2.1",
    implementation: "The CI workflow runs Semgrep with the p/typescript ruleset on the source tree.",
  },
  {
    id: "scorecard",
    name: "OpenSSF Scorecard",
    repo: "https://github.com/ossf/scorecard",
    role: "Repository security posture scoring.",
    kind: "bundled",
    transport: "docs",
    license: "Apache-2.0",
    implementation: "The CI workflow runs OSSF Scorecard checks against the repository.",
  },
  {
    id: "axe-core",
    name: "axe-core",
    repo: "https://github.com/dequelabs/axe-core",
    role: "Web accessibility testing for companion web surfaces.",
    kind: "documented",
    transport: "cli",
    license: "MPL-2.0",
    implementation: "Recommended for any web dashboard you build; in-Studio accessibility is enforced by George's own audit math (contrast, targets, sizes).",
  },
];

export const ALL_INTEGRATIONS: Integration[] = [...MANDATORY_REPOSITORIES, ...ECOSYSTEM_INTEGRATIONS];

export interface IntegrationReport {
  integration: Integration;
  status: IntegrationStatus;
}

export function envConfigured(integration: Integration): boolean {
  if (integration.kind === "bundled" || integration.kind === "policy") return true;
  if (!integration.env || integration.env.length === 0) return false;
  return integration.env.every((v) => Boolean(process.env[v]));
}

function baseUrl(integration: Integration): string | null {
  const env = integration.env?.[0];
  if (!env) return null;
  const value = process.env[env];
  if (!value) return null;
  return value.startsWith("http") ? value : `http://${value}`;
}

/** Probe configured REST integrations (2s timeout, never throws). */
export async function probeIntegration(integration: Integration): Promise<IntegrationStatus> {
  const configured = envConfigured(integration);
  if (integration.kind === "bundled") {
    return { configured: true, reachable: true, detail: "Bundled with this package — active." };
  }
  if (integration.kind === "policy") {
    return { configured: true, reachable: null, detail: "Active as an enforced engine rule in this package." };
  }
  if (!configured) {
    return {
      configured: false,
      reachable: null,
      detail: `Not configured. Set ${integration.env?.join(" + ")} to activate. Falls back safely when absent.`,
    };
  }
  const base = baseUrl(integration);
  if (!base || !integration.healthUrl) {
    return { configured: true, reachable: null, detail: "Configured; no HTTP probe for this transport." };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2000);
  try {
    const headers: Record<string, string> = {};
    if (integration.id === "changedetection" && process.env.GEORGE_CHANGEDETECTION_API_KEY) {
      headers["x-api-key"] = process.env.GEORGE_CHANGEDETECTION_API_KEY;
    }
    const res = await fetch(integration.healthUrl(base), { signal: controller.signal, headers });
    return { configured: true, reachable: res.ok, detail: `Probe answered HTTP ${res.status}.` };
  } catch (error) {
    return {
      configured: true,
      reachable: false,
      detail: `Probe failed (${error instanceof Error ? error.name : "error"}). Feature degrades gracefully.`,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function integrationReport(probe: boolean): Promise<IntegrationReport[]> {
  const reports: IntegrationReport[] = [];
  for (const integration of ALL_INTEGRATIONS) {
    const status = probe && (integration.kind === "adapter") ? await probeIntegration(integration) : {
      configured: envConfigured(integration),
      reachable: null,
      detail: integration.kind === "bundled"
        ? "Bundled with this package — active."
        : integration.kind === "policy"
          ? "Active as an enforced engine rule in this package."
          : "Adapter: configuration not detected; feature stays disabled until configured.",
    };
    reports.push({ integration, status });
  }
  return reports;
}
