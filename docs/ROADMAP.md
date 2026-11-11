# Roadmap

GEORGE GUI @Search ships reliable foundations first, then compounds. Everything listed as **shipped** is in this release with tests; everything else is explicitly *not* advertised as available.

## Shipped in 1.0

- 12 interface kinds, each a complete single-file Luau module (theme, hierarchy, animation, controller API)
- Self-critique audit engine: WCAG contrast, touch targets, text sizes, responsive checks — 144-combination quality gate
- Six WCAG-solved palettes × light/dark, emitted as Luau Theme + JSON
- Roblox-specialised Luau static analysis (12 rule families)
- Production Luau templates: secure remotes, DataStore profiles, signals
- Rojo/Rokit/Wally/StyLua/Selene project scaffolder
- Offline deterministic pixel-art thumbnail renderer + SVG composer + dependency-free PNG encoder
- Source-linked research knowledge base (43 verified entries)
- Honest integration registry with live health probes (11 mandated + 20 ecosystem entries)
- 71 automated tests including a real MCP protocol e2e suite

## Next (1.x)

- **Studio bridge**: guided mount-through-Studio-MCP workflow when the official Roblox Studio MCP server is available and authorized
- **More interface kinds**: chat box, minimap, party frame, crafting table, talent tree
- **GUI diffing**: regenerate an interface and get a structured diff against your edited version
- **Rarity systems** for item cards (color-coded rarity token scale)
- **Localization hooks**: automatic translation keys for generated labels

## Later (2.x candidates)

- **Multi-variation generation**: N design directions per request, each audited, user picks
- **Project memory**: persistent design-system state across sessions per game
- **3D asset workflows**: meshoptimiser-driven optimization guidance before Open Cloud upload
- **Golden-image regression**: headless render comparisons of generated UI across device presets
- **MCP App workspace**: interactive client UI for browsers/multiplayer where clients support it (core tools remain fully accessible without it)

## Non-goals

- Bundling or forking upstream projects — adapters and composition only
- Fabricating test results or advertising unbuilt features as available
- Server-side persistence of your data (local-first, forever)
