/**
 * GEORGE GUI @Search — public programmatic API.
 *
 * Every engine is importable directly. Importing this module never starts
 * the MCP server; use createServer() and connect a transport yourself, or
 * run the `george-gui-search` binary for the stdio server.
 */

export { GEORGE_VERSION, generateGui, detectKind, buildSpecFor } from "./core/gui-generator.js";
export type { GenerateGuiInput, GenerateGuiResult } from "./core/gui-generator.js";

export { PALETTES, getPalette, listPalettes, emitThemeModule, emitThemeModuleTokens, SCALES, hexToRgb, luauColor3 } from "./core/tokens.js";
export type { Palette, PaletteSide, ThemeMode, DesignSystem } from "./core/tokens.js";

export { auditGuiSpec, contrastRatio, relativeLuminance } from "./core/audit.js";
export type { AuditResult, AuditCheck, CheckLevel } from "./core/audit.js";

export { reviewLuau } from "./core/luau-review.js";
export type { ReviewResult, ReviewIssue, Severity } from "./core/luau-review.js";

export { LUAU_TEMPLATES, getTemplate, listTemplates } from "./core/luau-templates.js";
export type { LuauTemplate, LuauTemplateFile } from "./core/luau-templates.js";

export { searchKnowledge, listCategories, KNOWLEDGE_BASE } from "./core/knowledge.js";
export type { KnowledgeEntry, KnowledgeCategory, SearchHit } from "./core/knowledge.js";

export { scaffoldProject } from "./core/scaffold.js";
export type { ScaffoldResult } from "./core/scaffold.js";

export { renderThumbnailPng, composeSvg, resolveProvider, providerStatus, loadMascotBase64 } from "./core/image.js";
export type { ThumbnailRequest, GeneratedImage, ImageProvider } from "./core/image.js";
export { encodePng, isPng, pngSize } from "./core/png.js";

export { finalizeLuau, normalizeLuauIndent, canonicalizeLuau } from "./core/luau-text.js";

export { integrationReport, MANDATORY_REPOSITORIES, ECOSYSTEM_INTEGRATIONS, ALL_INTEGRATIONS, envConfigured } from "./integrations/registry.js";
export type { Integration, IntegrationReport, IntegrationStatus, IntegrationKind } from "./integrations/registry.js";

export { ChangeDetectionClient } from "./integrations/changedetection.js";
export type { WatchSummary } from "./integrations/changedetection.js";

export { createServer } from "./server.js";
export type { GuiSpec, GuiKind, GuiNode } from "./core/spec.js";
