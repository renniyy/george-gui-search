# API reference (programmatic embedding)

GEORGE GUI @Search is primarily an MCP server, but every engine is a pure TypeScript module you can embed directly.

```bash
npm install george-gui-search
```

```ts
import {
  generateGui,
  reviewLuau,
  auditGuiSpec,
  emitThemeModule,
  getPalette,
  searchKnowledge,
  scaffoldProject,
  renderThumbnailPng,
  composeSvg,
  LUAU_TEMPLATES,
  PALETTES,
  integrationReport,
} from "george-gui-search";
```

## generateGui(input)

```ts
const result = generateGui({
  description: "a neon shop with tabs and item cards",
  kind: "shop",                    // optional; auto-detected otherwise
  palette: "midnight-nebula",      // optional
  mode: "dark",                    // optional
  options: {                       // optional content overrides
    title: "Nova Shop",
    items: [{ name: "Plasma Blade", price: "750", badge: "NEW" }],
  },
});
```

Returns:

```ts
{
  kind: "shop";
  kindLabel: string;             // "Shop / store with tabs and item grid"
  guiName: "ShopUI";             // suggested ModuleScript name
  palette: { id: string; name: string };
  mode: "dark" | "light";
  luau: string;                  // the complete ModuleScript
  spec: GuiSpec;                 // IR — pass to auditGuiSpec
  audit: { score: number; passed: boolean; summary: string; checks: AuditCheck[] };
  actions: string[];             // fired actions, e.g. ["close", "tab", "buy"]
  notes: string[];               // setup guidance
}
```

## reviewLuau(source)

```ts
const review = reviewLuau(sourceText);
// { passed, lines, errors, warnings, infos, issues: [{ rule, severity, line, message, suggestion }], summary }
```

## auditGuiSpec(spec, designSystem)

```ts
import { auditGuiSpec, getPalette } from "george-gui-search";
const audit = auditGuiSpec(spec, { palette: getPalette("mono-slate"), mode: "light" });
```

## Design tokens

```ts
import { PALETTES, getPalette, emitThemeModule, listPalettes, SCALES } from "george-gui-search";

emitThemeModule({ palette: getPalette("candy-pop"), mode: "dark" }, "ShopUI");
// -> standalone Luau Theme module
listPalettes();   // [{ id, name, mood, swatch: [hex × 5] }]
SCALES;           // { space, radius, text, motion, touchTarget }
```

## Research

```ts
import { searchKnowledge, listCategories, KNOWLEDGE_BASE } from "george-gui-search";

searchKnowledge("remote event security", "networking", 5);
// -> [{ entry: { id, title, category, summary, tags, url }, score }]
```

## Images

```ts
import { renderThumbnailPng, composeSvg, resolveProvider, providerStatus } from "george-gui-search";

const png = renderThumbnailPng({ title: "NEBULA RUN", badge: "UPDATE" });  // { format: "png", data: base64, ... }
const svg = composeSvg({ title: "NEBULA RUN", subtitle: "Build beyond imagination" });
await resolveProvider().generate(request);   // picks configured provider or local
providerStatus();                            // [{ id, configured, envHint }]
```

## Scaffold

```ts
import { scaffoldProject } from "george-gui-search";
const { name, tree, files } = scaffoldProject("Nebula Run");
// files: [{ path, content }] — write them with your own fs code
```

## Luau templates

```ts
import { LUAU_TEMPLATES, getTemplate, listTemplates } from "george-gui-search";
getTemplate("secure-remotes")!.files;   // [{ name, location, purpose, luau }]
```

## Integrations

```ts
import { integrationReport, MANDATORY_REPOSITORIES } from "george-gui-search";
const reports = await integrationReport(true);  // with live probes
// [{ integration: { id, name, repo, role, kind, ... }, status: { configured, reachable, detail } }]
```

## Running the server programmatically

```ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "george-gui-search";

const server = createServer();
await server.connect(new StdioServerTransport());
```

The package ships ESM (`"type": "module"`); the public entry is `dist/index.js` with declarations in `dist/index.d.ts`. Node ≥ 20.
