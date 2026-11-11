/**
 * GEORGE GUI @Search — verified Roblox engineering knowledge base
 * ("George Research").
 *
 * A curated, offline index of the APIs, patterns and tooling facts the
 * generators rely on. Every entry carries a source URL pointing at official
 * documentation (Roblox engine reference pages or the upstream project).
 * The search tool scores entries by keyword relevance and returns them
 * verbatim — it never fabricates facts or URLs.
 */

export type KnowledgeCategory =
  | "ui" | "scripting" | "networking" | "data" | "optimization" | "tooling" | "mcp" | "security";

export interface KnowledgeEntry {
  id: string;
  title: string;
  category: KnowledgeCategory;
  summary: string;
  tags: string[];
  url: string;
}

const ROBLOX_CLASS = (cls: string) => `https://create.roblox.com/docs/reference/engine/classes/${cls}`;

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  /* ── UI ─────────────────────────────────────────────────────────────── */
  {
    id: "screengui",
    title: "ScreenGui — the root of every 2D interface",
    category: "ui",
    summary:
      "ScreenGui is the container for all 2D GUI elements drawn on a player's screen. Key properties: IgnoreGuiInset (span the full viewport including the top inset), DisplayOrder (layering between ScreenGuis), ZIndexBehavior (Sibling is the modern default), ResetOnSpawn (set false for persistent UI), Enabled. Create one from a LocalScript or a ModuleScript mounted into PlayerGui.",
    tags: ["screengui", "gui", "root", "viewport", "inset", "displayorder"],
    url: ROBLOX_CLASS("ScreenGui"),
  },
  {
    id: "frame",
    title: "Frame — the base container",
    category: "ui",
    summary:
      "Frames are rectangular containers. Size/Position take UDim2 (scale + offset); AnchorPoint pivots around a normalized point; BackgroundTransparency hides the fill. Combine with UICorner, UIStroke and UIPadding for modern card layouts.",
    tags: ["frame", "container", "udim2", "anchorpoint"],
    url: ROBLOX_CLASS("Frame"),
  },
  {
    id: "textlabel",
    title: "TextLabel — text display",
    category: "ui",
    summary:
      "TextLabel renders non-interactive text. Use TextSize (never TextScaled for body text on small screens), TextWrapped for paragraphs, TextTruncate = AtEnd for single-line overflow, and FontFace (e.g. Font.fromEnum(Enum.Font.GothamBold)) for modern font assignment.",
    tags: ["textlabel", "text", "font", "textsize", "wrap"],
    url: ROBLOX_CLASS("TextLabel"),
  },
  {
    id: "textbutton",
    title: "TextButton — interactive buttons",
    category: "ui",
    summary:
      "TextButton fires Activated on click, touch and gamepad press. Activated is preferred over MouseButton1Click because it covers all input modalities. Set AutoButtonColor = false when driving your own hover feedback. SelectionGained/SelectionLost fire on gamepad focus, which every accessible UI must handle.",
    tags: ["textbutton", "button", "activated", "gamepad", "input"],
    url: ROBLOX_CLASS("TextButton"),
  },
  {
    id: "textbox",
    title: "TextBox — text input",
    category: "ui",
    summary:
      "TextBox captures typed input. Focuses with :CaptureFocus(), commits on focus loss or Enter (returning FocusLost and enterPressed). Always respect the gameProcessedEvent flag on UserInputService so typing in one box does not trigger global bindings.",
    tags: ["textbox", "input", "focus", "typing"],
    url: ROBLOX_CLASS("TextBox"),
  },
  {
    id: "canvasgroup",
    title: "CanvasGroup — group-level transparency and effects",
    category: "ui",
    summary:
      "CanvasGroup renders its children into one texture, so GroupTransparency and GroupColor3 fade/tint an entire subtree smoothly — ideal for animated show/hide of menus without touching every child. More expensive than a Frame; use for grouped effects, not as a universal container.",
    tags: ["canvasgroup", "fade", "transparency", "group", "effects"],
    url: ROBLOX_CLASS("CanvasGroup"),
  },
  {
    id: "uicorner",
    title: "UICorner — rounded corners",
    category: "ui",
    summary:
      "UICorner rounds the parent's corners. CornerRadius is a UDim; UDim.new(1, 0) produces a fully rounded pill/circle. One per element; combine with UIStroke for outlined cards.",
    tags: ["uicorner", "corner", "radius", "rounded", "pill"],
    url: ROBLOX_CLASS("UICorner"),
  },
  {
    id: "uistroke",
    title: "UIStroke — borders and outlines",
    category: "ui",
    summary:
      "UIStroke draws a border around the parent (or the text glyphs of a TextLabel when ApplyStrokeMode = Contextual). Thickness is in pixels; Transparency animates cleanly for focus states.",
    tags: ["uistroke", "border", "outline", "stroke"],
    url: ROBLOX_CLASS("UIStroke"),
  },
  {
    id: "uilistlayout",
    title: "UIListLayout — automatic stacking",
    category: "ui",
    summary:
      "UIListLayout arranges siblings in a row or column with Padding between them, controlled by FillDirection, HorizontalAlignment/VerticalAlignment and SortOrder = LayoutOrder. Children stop needing manual Positions — the layout manages them and reflows automatically on resize.",
    tags: ["uilistlayout", "list", "layout", "stack", "column", "row"],
    url: ROBLOX_CLASS("UIListLayout"),
  },
  {
    id: "uigridlayout",
    title: "UIGridLayout — uniform grids",
    category: "ui",
    summary:
      "UIGridLayout places siblings in a grid with fixed CellSize and CellPadding. Use scale-based cell widths (e.g. UDim2.new(0.485, -6, 0, 192)) so the column count adapts to the container, and put the grid inside a ScrollingFrame with AutomaticCanvasSize for long lists.",
    tags: ["uigridlayout", "grid", "cells", "inventory", "shop"],
    url: ROBLOX_CLASS("UIGridLayout"),
  },
  {
    id: "scrollingframe",
    title: "ScrollingFrame — scrollable regions",
    category: "ui",
    summary:
      "ScrollingFrame scrolls its children. Modern recipe: CanvasSize = UDim2.new() with AutomaticCanvasSize = Y, ElasticBehavior = WhenScrollable, thin ScrollBarThickness with themed ScrollBarImageColor3. Never guess canvas sizes by hand.",
    tags: ["scrollingframe", "scroll", "canvas", "automaticcanvassize"],
    url: ROBLOX_CLASS("ScrollingFrame"),
  },
  {
    id: "uipadding",
    title: "UIPadding — inner spacing",
    category: "ui",
    summary:
      "UIPadding insets the parent's content area (PaddingLeft/Right/Top/Bottom as UDim). Layouts and AutomaticSize respect it, which makes it the correct tool for consistent card gutters.",
    tags: ["uipadding", "padding", "spacing", "gutter"],
    url: ROBLOX_CLASS("UIPadding"),
  },
  {
    id: "uiscale",
    title: "UIScale — uniform zoom of a subtree",
    category: "ui",
    summary:
      "UIScale multiplies the rendered size of the entire subtree, perfect for hover/press micro-interactions and mount animations (0.96 → 1 with a Back easing gives a tactile entrance).",
    tags: ["uiscale", "scale", "zoom", "animation", "hover"],
    url: ROBLOX_CLASS("UIScale"),
  },
  {
    id: "uiaspectratioconstraint",
    title: "UIAspectRatioConstraint — lock element ratios",
    category: "ui",
    summary:
      "UIAspectRatioConstraint forces a width:height ratio (AspectRatio, DominantDimension) regardless of parent scale — the cleanest way to keep avatars, icons and portraits square across devices.",
    tags: ["uiaspectratioconstraint", "ratio", "aspect", "square", "responsive"],
    url: ROBLOX_CLASS("UIAspectRatioConstraint"),
  },
  {
    id: "font-enum",
    title: "Fonts in Roblox — Enum.Font and FontFace",
    category: "ui",
    summary:
      "Modern font assignment uses the FontFace property with Font.fromEnum(Enum.Font.GothamBold), Font.fromName or Font.fromId for custom fonts. The Enum.Font values (Gotham, GothamMedium, GothamBold, GothamBlack, and others) remain valid inputs to Font.fromEnum. Avoid the legacy .Font property in new code.",
    tags: ["font", "fontface", "gotham", "typography", "font.fromenum"],
    url: "https://create.roblox.com/docs/reference/engine/classes/Font",
  },
  {
    id: "guiservice",
    title: "GuiService — insets and safe areas",
    category: "ui",
    summary:
      "GuiService exposes the device insets. Use ScreenGui.IgnoreGuiInset = true for fullscreen surfaces, or query GuiService:GetGuiInset() when you must avoid the top bar area manually. Top-anchored HUD elements should account for the inset on mobile.",
    tags: ["guiservice", "inset", "safe area", "topbar", "mobile"],
    url: ROBLOX_CLASS("GuiService"),
  },
  {
    id: "automaticsize",
    title: "AutomaticSize — content-driven sizing",
    category: "ui",
    summary:
      "Setting AutomaticSize = X/Y/XY makes an element grow to fit its content (labels, toasts, dialogue boxes). Combine with UISizeConstraint MinSize/MaxSize to keep the growth sane across devices.",
    tags: ["automaticsize", "auto size", "wrap", "content", "grow"],
    url: "https://create.roblox.com/docs/reference/engine/enums/AutomaticSize",
  },

  /* ── Scripting ──────────────────────────────────────────────────────── */
  {
    id: "task-library",
    title: "task library — modern scheduling",
    category: "scripting",
    summary:
      "The task library is the modern scheduler: task.wait(n) replaces wait(), task.spawn(fn) replaces spawn(), task.delay(n, fn) replaces delay(). They run on the same frame scheduler as the engine, avoiding the classic delay spikes of the deprecated globals.",
    tags: ["task", "wait", "spawn", "delay", "scheduler", "async"],
    url: "https://create.roblox.com/docs/reference/engine/library/task",
  },
  {
    id: "tweenservice",
    title: "TweenService and TweenInfo — smooth animation",
    category: "scripting",
    summary:
      "TweenService:Create(instance, TweenInfo.new(duration, easingStyle, easingDirection, repeatCount, reverses, delayTime), goals):Play() animates any tweenable property. Quint/Back with Out direction reads as premium UI motion; keep durations between 0.15s and 0.4s for interface feedback.",
    tags: ["tween", "tweenservice", "tweeninfo", "animation", "easing", "motion"],
    url: ROBLOX_CLASS("TweenService"),
  },
  {
    id: "userinputservice",
    title: "UserInputService — raw input events",
    category: "scripting",
    summary:
      "UserInputService fires InputBegan/InputChanged/InputEnded with a InputObject. Handlers receive gameProcessedEvent — always return early when it is true, or chat typing and textbox input will trigger your bindings. For gameplay actions prefer ContextActionService; use UserInputService for low-level needs like slider dragging.",
    tags: ["userinputservice", "input", "inputbegan", "gameprocessed", "mouse", "touch", "keyboard"],
    url: ROBLOX_CLASS("UserInputService"),
  },
  {
    id: "contextactionservice",
    title: "ContextActionService — contextual bindings",
    category: "scripting",
    summary:
      "ContextActionService binds actions (keyboard, gamepad, touch buttons) with a priority stack: BindAction(name, handler, createTouchButton, ...keycodes). Higher-priority contexts sink the input, which is exactly what menus and modal dialogs need.",
    tags: ["contextactionservice", "binding", "gamepad", "touch button", "priority"],
    url: ROBLOX_CLASS("ContextActionService"),
  },
  {
    id: "players-service",
    title: "Players service — the player lifecycle",
    category: "scripting",
    summary:
      "Players.PlayerAdded and Players.PlayerRemoving drive per-player setup and teardown. Players.LocalPlayer exists only on the client. GuiObjects mount under LocalPlayer's PlayerGui.",
    tags: ["players", "playeradded", "playerremoving", "localplayer", "playergui"],
    url: ROBLOX_CLASS("Players"),
  },

  /* ── Networking & security ──────────────────────────────────────────── */
  {
    id: "remoteevent",
    title: "RemoteEvent — client/server messaging",
    category: "networking",
    summary:
      "RemoteEvent is the one-way messaging bridge: FireServer from the client, FireClient/FireAllClients from the server, with OnServerEvent/OnClientEvent handlers. Security rule: the server must treat every payload as hostile — validate typeof() on every field, rate-limit per player, and keep authoritative state server-side. Never trust a client-reported price, damage or currency amount.",
    tags: ["remoteevent", "remote", "networking", "fireserver", "fireclient", "exploit"],
    url: ROBLOX_CLASS("RemoteEvent"),
  },
  {
    id: "remotefunction",
    title: "RemoteFunction — request/response",
    category: "networking",
    summary:
      "RemoteFunction round-trips: InvokeServer returns the handler's value. InvokeClient can hang forever if the client never returns, so avoid InvokeClient in production code; use RemoteEvents for server-to-client flows instead.",
    tags: ["remotefunction", "invoke", "request", "response"],
    url: ROBLOX_CLASS("RemoteFunction"),
  },
  {
    id: "server-authority",
    title: "Server-authoritative design (exploit resistance)",
    category: "security",
    summary:
      "Exploiters control the client completely: they can fire any remote with any payload, at any rate. Therefore: validate schemas on every OnServerEvent, rate-limit per player, compute all economy/combat outcomes on the server, and use the client only for presentation. The secure-remotes template in this package implements the pattern.",
    tags: ["security", "exploit", "validation", "rate limit", "authority", "cheat"],
    url: ROBLOX_CLASS("RemoteEvent"),
  },
  {
    id: "http-service",
    title: "HttpService — external HTTP",
    category: "security",
    summary:
      "HttpService:RequestAsync/GetAsync perform HTTP from server scripts only (HttpEnabled must be on). Restrict to an allowlist of hosts, never ship secrets in URLs, and treat response bodies as untrusted data.",
    tags: ["httpservice", "http", "web", "api", "allowlist"],
    url: ROBLOX_CLASS("HttpService"),
  },

  /* ── Data ───────────────────────────────────────────────────────────── */
  {
    id: "datastore",
    title: "DataStore — persistent player data",
    category: "data",
    summary:
      "DataStores persist server-side data. Every call can throw or throttle, so wrap in pcall and retry with backoff. UpdateAsync is strongly preferred over SetAsync because it receives the current stored value and can merge/abort. Flush in game:BindToClose so the last saves land when the server shuts down.",
    tags: ["datastore", "save", "persist", "updateasync", "pcall", "bindtoclose"],
    url: ROBLOX_CLASS("DataStore"),
  },
  {
    id: "datastoreservice",
    title: "DataStoreService — obtaining stores",
    category: "data",
    summary:
      "DataStoreService:GetDataStore(name) returns a store handle; GetDataStore(name, scope) scopes keys. Names are stable identifiers — version them (e.g. PlayerProfiles_v1) when the shape changes rather than mutating live data blindly.",
    tags: ["datastoreservice", "getdatastore", "scope"],
    url: ROBLOX_CLASS("DataStoreService"),
  },
  {
    id: "memorystore",
    title: "MemoryStoreService — fast ephemeral state",
    category: "data",
    summary:
      "MemoryStores are cross-server, low-latency, and expire automatically — designed for matchmaking queues, live leaderboards and short-lived shared state, not for durable player profiles.",
    tags: ["memorystore", "queue", "leaderboard", "cross-server", "ephemeral"],
    url: ROBLOX_CLASS("MemoryStoreService"),
  },

  /* ── Optimization ───────────────────────────────────────────────────── */
  {
    id: "contentprovider",
    title: "ContentProvider — preloading assets",
    category: "optimization",
    summary:
      "ContentProvider:PreloadAsync(...) warms textures and images before they are shown, eliminating first-render pop-in on thumbnails and menu art. Call it for critical UI assets during the loading screen.",
    tags: ["contentprovider", "preload", "loading", "assets", "pop-in"],
    url: ROBLOX_CLASS("ContentProvider"),
  },
  {
    id: "streaming-enabled",
    title: "StreamingEnabled — large worlds",
    category: "optimization",
    summary:
      "Workspace.StreamingEnabled streams instances in and out around players, cutting memory and join times for big maps. GUI code must not assume distant world instances exist on the client — guard with WaitForChild or server-side logic.",
    tags: ["streaming", "workspace", "memory", "performance", "large world"],
    url: ROBLOX_CLASS("Workspace"),
  },
  {
    id: "runservice",
    title: "RunService — per-frame logic",
    category: "optimization",
    summary:
      "RunService.Heartbeat/Stepped/PreRender fire every frame. Keep per-frame work O(1) and allocation-free; cache instance references outside the loop instead of calling FindFirstChild every frame.",
    tags: ["runservice", "heartbeat", "frame", "loop", "performance"],
    url: ROBLOX_CLASS("RunService"),
  },

  /* ── Tooling ────────────────────────────────────────────────────────── */
  {
    id: "rojo",
    title: "Rojo — filesystem ↔ Studio sync",
    category: "tooling",
    summary:
      "Rojo syncs a filesystem project into Roblox Studio (and builds place/model files headlessly). A default.project.json maps src/ folders to services, enabling Git workflows, code review and CI on Roblox projects. The project scaffolder in this package emits a Rojo-ready layout.",
    tags: ["rojo", "sync", "git", "filesystem", "project", "ci"],
    url: "https://github.com/rojo-rbx/rojo",
  },
  {
    id: "rokit",
    title: "Rokit — Roblox toolchain manager",
    category: "tooling",
    summary:
      "Rokit pins project toolchains (Rojo, StyLua, Wally, lune...) by version in the repository, so every contributor and CI runner uses identical tool versions. Declared in rokit.toml; installs with `rokit add`.",
    tags: ["rokit", "toolchain", "version", "pin", "reproducible"],
    url: "https://github.com/rojo-rbx/rokit",
  },
  {
    id: "wally",
    title: "Wally — Roblox package manager",
    category: "tooling",
    summary:
      "Wally manages Luau packages (wally.toml + wally.lock) with a registry of community libraries. Packages resolve into a Packages folder that Rojo then syncs into Studio.",
    tags: ["wally", "package", "dependency", "registry"],
    url: "https://github.com/UpliftGames/wally",
  },
  {
    id: "stylua",
    title: "StyLua — deterministic Luau formatter",
    category: "tooling",
    summary:
      "StyLua formats Luau with a stable style (tabs by default), like Prettier for Luau. Run it in CI to keep generated and hand-written code stylistically uniform — this package's generated modules are already StyLua-compatible.",
    tags: ["stylua", "format", "style", "ci", "lint"],
    url: "https://github.com/JohnnyMorganz/StyLua",
  },
  {
    id: "selene",
    title: "Selene — Roblox-aware Luau linter",
    category: "tooling",
    summary:
      "Selene statically analyzes Luau with Roblox-aware rules (deprecated globals, suspicious patterns) configured via selene.toml. Pair it with the george_review_luau tool: Selene covers style standards, George covers Roblox production rules like unprotected DataStore calls and unvalidated remotes.",
    tags: ["selene", "lint", "static analysis", "rules"],
    url: "https://github.com/Kampfkarren/selene",
  },
  {
    id: "luau-lsp",
    title: "Luau Language Server",
    category: "tooling",
    summary:
      "luau-lsp powers editor IntelliSense for Luau: type checking (--!strict), autocomplete for the Roblox API surface, and diagnostics. All modules generated by this package are written to typecheck cleanly under strict mode.",
    tags: ["luau", "lsp", "language server", "types", "strict", "intellisense"],
    url: "https://github.com/JohnnyMorganz/luau-lsp",
  },
  {
    id: "lune",
    title: "Lune — scripting runtime for Roblox projects",
    category: "tooling",
    summary:
      "Lune runs Luau scripts outside Roblox with filesystem, networking and process APIs — ideal for build scripts, asset pipelines and CI automation around a Rojo project.",
    tags: ["lune", "scripting", "runtime", "automation", "build"],
    url: "https://github.com/lune-org/lune",
  },

  /* ── MCP ────────────────────────────────────────────────────────────── */
  {
    id: "mcp-overview",
    title: "Model Context Protocol — the open standard",
    category: "mcp",
    summary:
      "MCP is an open protocol that standardizes how applications provide context, tools and prompts to LLMs. A server exposes tools (callable functions), resources (readable data) and prompts; clients such as Claude Desktop, VS Code and other AI-enabled editors connect over stdio or HTTP transports.",
    tags: ["mcp", "model context protocol", "tools", "resources", "prompts", "protocol"],
    url: "https://modelcontextprotocol.io",
  },
  {
    id: "mcp-typescript-sdk",
    title: "MCP TypeScript SDK",
    category: "mcp",
    summary:
      "The official TypeScript SDK implements the MCP server and client. McpServer + StdioServerTransport get a stdio server running in a few lines; registerTool wires zod-validated inputs, and handlers return content (text, images) plus optional structured JSON. GEORGE GUI @Search is built on this SDK.",
    tags: ["mcp", "typescript", "sdk", "server", "stdio", "zod"],
    url: "https://github.com/modelcontextprotocol/typescript-sdk",
  },
  {
    id: "mcp-inspector",
    title: "MCP Inspector — protocol debugging",
    category: "mcp",
    summary:
      "MCP Inspector is the official interactive debugger for MCP servers: connect over stdio or HTTP, list tools, edit JSON inputs, invoke calls and inspect raw protocol messages. The fastest way to verify a server works before wiring it into an editor.",
    tags: ["mcp", "inspector", "debug", "testing", "protocol"],
    url: "https://github.com/modelcontextprotocol/inspector",
  },
  {
    id: "roblox-studio-mcp",
    title: "Roblox Studio MCP",
    category: "mcp",
    summary:
      "Roblox ships an MCP server in Studio (enable it in Studio settings) that exposes Studio capabilities — creating and inspecting instances, running commands — to MCP clients. Authorized clients can drive Studio directly; George GUI's generated modules and scripts are designed to be mounted through it or pasted manually.",
    tags: ["roblox", "studio", "mcp", "agent", "plugin", "automation"],
    url: "https://create.roblox.com/docs/studio/mcp",
  },
];

export interface SearchHit {
  entry: KnowledgeEntry;
  score: number;
}

export function searchKnowledge(query: string, category?: KnowledgeCategory, limit = 5): SearchHit[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);

  const hits: SearchHit[] = [];
  for (const entry of KNOWLEDGE_BASE) {
    if (category && entry.category !== category) continue;
    let score = 0;
    const title = entry.title.toLowerCase();
    const summary = entry.summary.toLowerCase();
    const tags = entry.tags.join(" ").toLowerCase();
    const id = entry.id.toLowerCase();
    for (const term of terms) {
      if (title.includes(term)) score += 6;
      if (tags.includes(term)) score += 4;
      if (id.includes(term)) score += 3;
      if (summary.includes(term)) score += 1;
    }
    if (score > 0) hits.push({ entry, score });
  }
  hits.sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id));
  return hits.slice(0, limit);
}

export function listCategories(): Array<{ category: KnowledgeCategory; count: number }> {
  const counts = new Map<KnowledgeCategory, number>();
  for (const entry of KNOWLEDGE_BASE) {
    counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1);
  }
  return [...counts.entries()].map(([category, count]) => ({ category, count }));
}
