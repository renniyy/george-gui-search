/**
 * GEORGE GUI @Search — MCP server wiring.
 *
 * Ten tools spanning the creative pipeline:
 *   george_search            research verified Roblox knowledge
 *   george_design_system     design tokens (Luau Theme module + JSON)
 *   george_generate_gui      natural language → complete Roblox interface
 *   george_audit_gui         self-critique audit of a GuiSpec
 *   george_generate_luau     production Luau script templates
 *   george_review_luau       Roblox-specialised static analysis
 *   george_project_scaffold  Rojo/Rokit/Wally project scaffold
 *   george_generate_thumbnail offline pixel-art thumbnail / SVG banner
 *   george_integrations      ecosystem integration status + health probes
 *   george_version           version and capabilities
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { GEORGE_VERSION, generateGui } from "./core/gui-generator.js";
import { PALETTES, getPalette, emitThemeModule } from "./core/tokens.js";
import { auditGuiSpec } from "./core/audit.js";
import { reviewLuau } from "./core/luau-review.js";
import { LUAU_TEMPLATES, getTemplate, listTemplates } from "./core/luau-templates.js";
import { searchKnowledge, listCategories, KNOWLEDGE_BASE } from "./core/knowledge.js";
import { scaffoldProject } from "./core/scaffold.js";
import {
  renderThumbnailPng, composeSvg, resolveProvider, providerStatus, loadMascotBase64,
  ThumbnailRequest,
} from "./core/image.js";
import { integrationReport, MANDATORY_REPOSITORIES } from "./integrations/registry.js";
import { configuredClient as changeDetectionClient } from "./integrations/changedetection.js";
import type { GuiSpec } from "./core/spec.js";

const SERVER_INFO = {
  name: "george-gui-search",
  version: GEORGE_VERSION,
} as const;

export function createServer(): McpServer {
  const server = new McpServer(SERVER_INFO, {
    instructions:
      "GEORGE GUI @Search — the Roblox creative-engineering MCP. Generate production GUIs, Luau, design systems, thumbnails and project scaffolds; every artifact is audited before it is returned. Build beyond imagination.",
  });

  /* ── george_version ─────────────────────────────────────────────────── */
  server.registerTool(
    "george_version",
    {
      title: "George version",
      description: "Version and capability report for the GEORGE GUI @Search MCP server.",
      outputSchema: {
        version: z.string(),
        interfaceKinds: z.array(z.string()),
        palettes: z.array(z.string()),
        luauTemplates: z.array(z.string()),
        knowledgeEntries: z.number(),
      },
    },
    async () => ({
      content: [
        {
          type: "text",
          text: [
            `GEORGE GUI @Search v${GEORGE_VERSION}`,
            `Interface kinds: ${["main-menu", "shop", "inventory", "settings", "hud", "loading-screen", "leaderboard", "notifications", "dialogue", "quest-tracker", "profile-card", "custom"].join(", ")}`,
            `Palettes: ${PALETTES.map((p) => p.id).join(", ")}`,
            `Luau templates: ${LUAU_TEMPLATES.map((t) => t.id).join(", ")}`,
            `Knowledge base entries: ${KNOWLEDGE_BASE.length} (all source-linked)`,
          ].join("\n"),
        },
      ],
      structuredContent: {
        version: GEORGE_VERSION,
        interfaceKinds: ["main-menu", "shop", "inventory", "settings", "hud", "loading-screen", "leaderboard", "notifications", "dialogue", "quest-tracker", "profile-card", "custom"],
        palettes: PALETTES.map((p) => p.id),
        luauTemplates: LUAU_TEMPLATES.map((t) => t.id),
        knowledgeEntries: KNOWLEDGE_BASE.length,
      },
    })
  );

  /* ── george_search ──────────────────────────────────────────────────── */
  server.registerTool(
    "george_search",
    {
      title: "George Research: verified Roblox knowledge search",
      description:
        "Search a curated, source-linked knowledge base of Roblox UI, scripting, networking, data, optimization, tooling and MCP facts. Every result carries an official documentation URL. Optionally enable the Agent-Reach adapter (GEORGE_AGENT_REACH_URL) for extended web reach.",
      inputSchema: {
        query: z.string().min(2).describe("What to research, e.g. 'how to make scrolling shop grid' or 'remote event security'"),
        category: z.enum(["ui", "scripting", "networking", "data", "optimization", "tooling", "mcp", "security"]).optional().describe("Restrict to one category"),
        limit: z.number().int().min(1).max(10).default(5).describe("Maximum results (1-10)"),
      },
      outputSchema: {
        results: z.array(
          z.object({
            title: z.string(),
            category: z.string(),
            summary: z.string(),
            url: z.string(),
          })
        ),
        totalKnowledgeEntries: z.number(),
      },
    },
    async ({ query, category, limit }) => {
      const hits = searchKnowledge(query, category, limit ?? 5);
      const lines = hits.length
        ? hits.map(
            (h, i) =>
              `${i + 1}. ${h.entry.title} [${h.entry.category}]\n   ${h.entry.summary}\n   Source: ${h.entry.url}`
          )
        : ["No matching entries. Try broader terms, or a category filter to widen the net."];
      return {
        content: [{ type: "text", text: lines.join("\n\n") }],
        structuredContent: {
          results: hits.map((h) => ({ title: h.entry.title, category: h.entry.category, summary: h.entry.summary, url: h.entry.url })),
          totalKnowledgeEntries: KNOWLEDGE_BASE.length,
        },
      };
    }
  );

  /* ── george_design_system ───────────────────────────────────────────── */
  server.registerTool(
    "george_design_system",
    {
      title: "George Designer: design token system",
      description:
        "Emit a complete design system: a Luau Theme module (colors, typography scale, spacing, radii, motion) plus the same tokens as JSON. Call without a palette to list the available palettes first.",
      inputSchema: {
        palette: z.string().optional().describe("Palette id; omit to list palettes"),
        mode: z.enum(["dark", "light"]).default("dark").describe("Token variant"),
        guiName: z.string().default("Theme").describe("Name for the emitted module comment"),
      },
      outputSchema: {
        palette: z.string().optional(),
        mode: z.string().optional(),
        themeModule: z.string().optional(),
        tokensJson: z.string().optional(),
        palettes: z.array(z.object({ id: z.string(), name: z.string(), mood: z.string() })).optional(),
      },
    },
    async ({ palette, mode, guiName }) => {
      if (!palette) {
        const palettes = PALETTES.map((p) => ({ id: p.id, name: p.name, mood: p.mood }));
        return {
          content: [{ type: "text", text: palettes.map((p) => `- ${p.id} — ${p.name}: ${p.mood}`).join("\n") }],
          structuredContent: { palettes },
        };
      }
      const resolved = getPalette(palette);
      const ds = { palette: resolved, mode: mode ?? "dark" };
      const themeModule = emitThemeModule(ds, guiName ?? "Theme");
      const side = mode === "light" ? resolved.light : resolved.dark;
      const tokensJson = JSON.stringify(
        { palette: resolved.id, name: resolved.name, mode: ds.mode, colors: side, source: "george-gui-search" },
        null,
        2
      );
      return {
        content: [
          { type: "text", text: themeModule },
          { type: "text", text: `JSON tokens:\n${tokensJson}` },
        ],
        structuredContent: { palette: resolved.id, mode: ds.mode, themeModule, tokensJson },
      };
    }
  );

  /* ── george_generate_gui ────────────────────────────────────────────── */
  server.registerTool(
    "george_generate_gui",
    {
      title: "George Builder: generate a complete Roblox interface",
      description:
        "Turn a natural-language description into a complete, production-grade Roblox interface: a single self-contained Luau ModuleScript with the full instance hierarchy, theme tokens, tween animations, responsive layout, gamepad-friendly buttons and a controller API (mount/open/close/on/setItems...). The result is automatically audited (contrast, touch targets, text sizes) before it is returned.",
      inputSchema: {
        description: z.string().min(3).describe("What the interface should be, e.g. 'a sci-fi shop with tabs and item cards'"),
        kind: z.enum(["main-menu", "shop", "inventory", "settings", "hud", "loading-screen", "leaderboard", "notifications", "dialogue", "quest-tracker", "profile-card", "custom"]).optional().describe("Force a specific kind; default is auto-detected from the description"),
        palette: z.string().optional().describe("Design system palette id (see george_design_system)"),
        mode: z.enum(["dark", "light"]).default("dark"),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        items: z.array(z.object({ name: z.string(), subtitle: z.string().optional(), price: z.string().optional(), badge: z.string().optional() })).max(24).optional().describe("Items for shop/inventory grids"),
        tabs: z.array(z.string()).max(8).optional().describe("Tab labels"),
        stats: z.array(z.object({ label: z.string(), value: z.string() })).max(6).optional().describe("HUD stat chips"),
        objectives: z.array(z.object({ text: z.string(), done: z.boolean().optional() })).max(10).optional().describe("Quest objectives"),
        tips: z.array(z.string()).max(8).optional().describe("Loading screen tips"),
        playerName: z.string().optional().describe("Profile card player name"),
      },
      outputSchema: {
        kind: z.string(),
        guiName: z.string(),
        palette: z.string(),
        actions: z.array(z.string()),
        auditScore: z.number(),
        auditPassed: z.boolean(),
        auditSummary: z.string(),
        notes: z.array(z.string()),
        spec: z.any(),
      },
    },
    async (input) => {
      const result = generateGui({
        description: input.description,
        kind: input.kind,
        palette: input.palette,
        mode: input.mode,
        options: {
          title: input.title,
          subtitle: input.subtitle,
          items: input.items,
          tabs: input.tabs,
          stats: input.stats,
          objectives: input.objectives,
          tips: input.tips,
          playerName: input.playerName,
        },
      });

      const header = [
        `GEORGE GUI @Search — ${result.guiName} (${result.kindLabel})`,
        `Design system: ${result.palette.name} · ${result.mode} mode`,
        `Quality gate: ${result.audit.summary}`,
        "",
        "Generated Luau (single ModuleScript):",
        "```lua",
        result.luau,
        "```",
        "",
        "Notes:",
        ...result.notes.map((n) => `- ${n}`),
      ].join("\n");

      return {
        content: [{ type: "text", text: header }],
        structuredContent: {
          kind: result.kind,
          guiName: result.guiName,
          palette: `${result.palette.id} (${result.palette.name})`,
          actions: result.actions,
          auditScore: result.audit.score,
          auditPassed: result.audit.passed,
          auditSummary: result.audit.summary,
          notes: result.notes,
          spec: result.spec,
        },
      };
    }
  );

  /* ── george_audit_gui ───────────────────────────────────────────────── */
  server.registerTool(
    "george_audit_gui",
    {
      title: "George Inspector: audit a GuiSpec",
      description:
        "Run the self-critique audit engine over a GuiSpec (returned in the structured output of george_generate_gui). Checks WCAG contrast math on every text/background pair, 36px minimum touch targets, minimum text sizes, and responsive/safe-area behaviour.",
      inputSchema: {
        spec: z.any().describe("The GuiSpec JSON from george_generate_gui's structured output"),
        palette: z.string().optional().describe("Override palette id"),
        mode: z.enum(["dark", "light"]).optional().describe("Override mode"),
      },
      outputSchema: {
        score: z.number(),
        passed: z.boolean(),
        summary: z.string(),
        checks: z.array(z.object({ id: z.string(), level: z.string(), target: z.string(), message: z.string() })),
      },
    },
    async ({ spec, palette, mode }) => {
      const guiSpec = spec as GuiSpec;
      if (!guiSpec || typeof guiSpec !== "object" || !Array.isArray(guiSpec.children)) {
        return {
          content: [{ type: "text", text: "Invalid spec: expected the GuiSpec JSON object returned by george_generate_gui (structuredContent.spec)." }],
          isError: true,
        };
      }
      const resolvedPalette = getPalette(palette ?? guiSpec.paletteId);
      const audit = auditGuiSpec(guiSpec, { palette: resolvedPalette, mode: mode ?? guiSpec.mode });
      const text = [
        `Audit: ${audit.summary}`,
        "",
        ...audit.checks.map(
          (c) => `[${c.level.toUpperCase()}] ${c.id} · ${c.target}\n    ${c.message}`
        ),
      ].join("\n");
      return {
        content: [{ type: "text", text }],
        structuredContent: { score: audit.score, passed: audit.passed, summary: audit.summary, checks: audit.checks },
      };
    }
  );

  /* ── george_generate_luau ───────────────────────────────────────────── */
  server.registerTool(
    "george_generate_luau",
    {
      title: "George Engineer: production Luau script templates",
      description:
        "Generate battle-tested Luau script modules: secure rate-limited RemoteEvent layer, reliable DataStore profiles with retries and BindToClose, or a lightweight Signal implementation. Every template passes the george_review_luau rules by construction.",
      inputSchema: {
        template: z.enum(["secure-remotes", "profile-store", "signal"]),
      },
      outputSchema: {
        template: z.string(),
        files: z.array(z.object({ name: z.string(), location: z.string(), purpose: z.string() })),
      },
    },
    async ({ template }) => {
      const t = getTemplate(template) ?? LUAU_TEMPLATES[0];
      const files = t.files
        .map((f) => `── ${f.name} → ${f.location}\n   ${f.purpose}\n\n\`\`\`lua\n${f.luau}\n\`\`\``)
        .join("\n\n");
      const text = `${t.name}\n${t.description}\n\n${files}`;
      return {
        content: [{ type: "text", text }],
        structuredContent: {
          template: t.id,
          files: t.files.map((f) => ({ name: f.name, location: f.location, purpose: f.purpose })),
        },
      };
    }
  );

  /* ── george_review_luau ─────────────────────────────────────────────── */
  server.registerTool(
    "george_review_luau",
    {
      title: "George Engineer: Luau static analysis",
      description:
        "Roblox-specialised code review: deprecated APIs (wait/spawn/delay), unprotected DataStore calls, unvalidated RemoteEvent handlers, frozen while-true loops, globals leaking, chat-ignoring input handlers, loadstring/env access and debug leftovers. Errors fail the review; suggestions include concrete fixes.",
      inputSchema: {
        source: z.string().min(1).describe("Luau source code to review"),
      },
      outputSchema: {
        passed: z.boolean(),
        errors: z.number(),
        warnings: z.number(),
        summary: z.string(),
        issues: z.array(z.object({ rule: z.string(), severity: z.string(), line: z.number(), message: z.string(), suggestion: z.string() })),
      },
    },
    async ({ source }) => {
      const review = reviewLuau(source);
      const text =
        `Review ${review.passed ? "PASSED" : "FAILED"} — ${review.summary}\n\n` +
        (review.issues.length
          ? review.issues
              .map((i) => `[${i.severity.toUpperCase()}] ${i.rule} (line ${i.line})\n    ${i.message}\n    Fix: ${i.suggestion}`)
              .join("\n")
          : "No issues found.");
      return {
        content: [{ type: "text", text }],
        structuredContent: {
          passed: review.passed,
          errors: review.errors,
          warnings: review.warnings,
          summary: review.summary,
          issues: review.issues,
        },
      };
    }
  );

  /* ── george_project_scaffold ────────────────────────────────────────── */
  server.registerTool(
    "george_project_scaffold",
    {
      title: "George Architect: scaffold a Roblox project",
      description:
        "Emit a complete Rojo-compatible project: default.project.json mapping src/server, src/client and src/shared, plus rokit.toml (pinned toolchain), wally.toml, stylua.toml, selene.toml, .gitignore and a README. Drop generated UI modules into src/shared and you have a real repository.",
      inputSchema: {
        name: z.string().min(1).max(48).describe("Project name"),
      },
      outputSchema: {
        name: z.string(),
        tree: z.string(),
        fileCount: z.number(),
      },
    },
    async ({ name }) => {
      const scaffold = scaffoldProject(name);
      const text =
        `Scaffold for "${scaffold.name}" (${scaffold.files.length} files)\n\n` +
        scaffold.tree +
        "\n\n" +
        scaffold.files.map((f) => `═══ ${f.path} ═══\n${f.content}`).join("\n");
      return {
        content: [{ type: "text", text }],
        structuredContent: { name: scaffold.name, tree: scaffold.tree, fileCount: scaffold.files.length },
      };
    }
  );

  /* ── george_generate_thumbnail ──────────────────────────────────────── */
  server.registerTool(
    "george_generate_thumbnail",
    {
      title: "George Designer: thumbnail and banner art",
      description:
        "Generate a game thumbnail: a deterministic pixel-art composition rendered fully offline (PNG, returned inline), plus a crisp SVG banner variant. If an image provider is configured (GEORGE_IMAGE_API_URL for any OpenAI-compatible API, or GEORGE_COMFY_URL for ComfyUI), it is used instead and the result returned inline.",
      inputSchema: {
        title: z.string().min(1).max(40).describe("Game title shown large"),
        subtitle: z.string().max(60).optional().describe("Tagline under the title"),
        palette: z.string().optional().describe("Palette id for the composition"),
        badge: z.string().max(16).optional().describe("Corner badge text, e.g. 'UPDATE'"),
        mascotPath: z.string().optional().describe("Optional local path to a mascot PNG to embed in the SVG variant"),
        width: z.number().int().min(256).max(1920).default(1280),
        height: z.number().int().min(256).max(1080).default(720),
      },
    },
    async (input) => {
      const request: ThumbnailRequest = {
        title: input.title,
        subtitle: input.subtitle,
        palette: input.palette,
        badge: input.badge,
        width: input.width,
        height: input.height,
      };

      const provider = resolveProvider();
      let image;
      try {
        image = await provider.generate(request);
      } catch (error) {
        image = renderThumbnailPng(request);
        image.source = `local-pixel-renderer (fallback after ${provider.id} error: ${error instanceof Error ? error.message : "unknown"})`;
      }

      const svg = composeSvg({
        ...request,
        mascotBase64: input.mascotPath ? loadMascotBase64(input.mascotPath) : undefined,
      });

      const content: Array<{ type: "text"; text: string } | { type: "image"; data: string; mimeType: string }> = [
        {
          type: "text",
          text: `Thumbnail generated by ${image.source} (${image.width}x${image.height}, ${image.mimeType}). SVG banner variant:\n\n${svg}`,
        },
      ];
      if (image.format === "png") {
        content.push({ type: "image", data: image.data, mimeType: "image/png" });
      } else if (image.format === "url") {
        content[0] = { type: "text", text: `Thumbnail generated by ${image.source}: ${image.data}\n\nSVG banner variant:\n\n${svg}` };
      }

      return { content };
    }
  );

  /* ── george_integrations ────────────────────────────────────────────── */
  server.registerTool(
    "george_integrations",
    {
      title: "George Marketplace: integration status",
      description:
        "Status of the GEORGE GUI @Search integration ecosystem: which adapters are configured (via environment variables), which are bundled, and which are enforced as engine policies. With probe=true, configured HTTP adapters are health-checked live. Never marks a documented-but-unimplemented integration as available.",
      inputSchema: {
        probe: z.boolean().default(false).describe("Live-probe configured REST adapters (2s timeout each)"),
        scope: z.enum(["mandatory", "ecosystem", "all"]).default("all").describe("Which set to report"),
      },
      outputSchema: {
        configured: z.array(z.string()),
        bundled: z.array(z.string()),
        policies: z.array(z.string()),
        documented: z.array(z.string()),
        imageProviders: z.array(z.object({ id: z.string(), configured: z.boolean() })),
      },
    },
    async ({ probe, scope }) => {
      const reports = await integrationReport(Boolean(probe));
      const filtered =
        scope === "all"
          ? reports
          : reports.filter((r) =>
              scope === "mandatory"
                ? MANDATORY_REPOSITORIES.some((m) => m.id === r.integration.id)
                : !MANDATORY_REPOSITORIES.some((m) => m.id === r.integration.id)
            );

      const lines = filtered.map((r) => {
        const status = r.status.configured
          ? r.status.reachable === false
            ? "CONFIGURED (unreachable)"
            : "ACTIVE"
          : "NOT CONFIGURED";
        return `- [${status}] ${r.integration.name} (${r.integration.kind}/${r.integration.transport}) — ${r.integration.role}\n    ${r.status.detail}`;
      });

      const changedetection = changeDetectionClient();
      if (changedetection) {
        try {
          const watches = await changedetection.listWatches();
          lines.push(`\nchangedetection.io: ${watches.length} watch(es) configured.`);
        } catch (error) {
          lines.push(`\nchangedetection.io configured but not reachable: ${error instanceof Error ? error.message : "error"}`);
        }
      }

      const text = [
        `GEORGE GUI @Search integration status${probe ? " (with live probes)" : ""}`,
        "",
        ...lines,
        "",
        `Image providers: ${providerStatus().map((p) => `${p.id}=${p.configured ? "on" : "off"}`).join(", ")}`,
      ].join("\n");

      return {
        content: [{ type: "text", text }],
        structuredContent: {
          configured: filtered.filter((r) => r.status.configured && r.integration.kind === "adapter").map((r) => r.integration.id),
          bundled: filtered.filter((r) => r.integration.kind === "bundled").map((r) => r.integration.id),
          policies: filtered.filter((r) => r.integration.kind === "policy").map((r) => r.integration.id),
          documented: filtered.filter((r) => r.integration.kind === "documented").map((r) => r.integration.id),
          imageProviders: providerStatus(),
        },
      };
    }
  );

  return server;
}
