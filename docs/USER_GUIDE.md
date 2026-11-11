# User guide

Recipes for every tool, straight from the test suite. All examples are JSON arguments you can paste into the MCP Inspector or ask your MCP client to call.

## Interfaces (george_generate_gui)

### Main menu / title screen

```json
{
  "description": "main menu with a big play button",
  "kind": "main-menu",
  "palette": "midnight-nebula",
  "title": "NEBULA RUN",
  "subtitle": "Build beyond imagination"
}
```

Actions fired: `play`, `shop`, `loadout`, `settings`. Controller extras: `setTitle`, `setSubtitle`.

### Shop

```json
{
  "description": "a neon shop with tabs and item cards",
  "kind": "shop",
  "palette": "candy-pop",
  "title": "Melon Market",
  "tabs": ["Featured", "Gear", "Pets"],
  "items": [
    { "name": "Golden Melon", "subtitle": "Legendary", "price": "999", "badge": "RARE" },
    { "name": "Melon Pup", "subtitle": "Pet", "price": "350" }
  ],
  "stats": [{ "label": "MELONS", "value": "1,024" }]
}
```

Actions: `close`, `tab` (payload: tab name), `buy` (payload: item table). Extras: `setItems`, `setTab`, `setWallet`.

### Inventory

Same shape as shop; each card carries an EQUIP action. Actions: `close`, `tab`, `equip`. Extras: `setItems`, `setTab`, `setCapacity`.

### Settings

```json
{ "kind": "settings", "description": "settings menu" }
```

Ships with toggles (camera shake, auto-jump, reduce motion), sliders (volumes, FOV) with real drag behaviour and a generous touch hit-region, and rebindable keybinds that honour `gameProcessedEvent`. Actions: `close`, `reset`, `apply`, `setting_changed` (payload `{ id, value }`), `rebind` (payload `{ id, key }`). Read current values via `ui.values.<id>`.

### HUD

Always-on clusters: stat chips + XP bar (top-left), map slot (top-right), two action buttons (bottom-right). Extras: `setStats(values)`, `setProgress(level, ratio)`.

### Loading screen

Spinner (two counter-rotating rounded frames), progress bar, and rotating tips. Extras: `setProgress(ratio, statusText)`, `setStatus`.

### Leaderboard

Right-side panel with ranked rows, top-3 medals and a highlighted player row. Extras: `setRows({ { name, value, isPlayer } })`.

### Notifications

```lua
ui:push("Level up!", "You reached level 12", "success")
```

Stack of up to 5 toasts with auto-dismiss; variants `info` / `success` / `warning` / `danger`.

### Dialogue

```lua
ui:say("Elder Rowan", "The nebula stirs, traveller.", { "Ask about the temple", "Leave" })
```

Typewriter text (skippable by click), speaker name, choice buttons. Actions: `choice` (payload `{ index, text }`), `advance`.

### Quest tracker

Extras: `setQuest(title, { { text, done } }, ratio?)` — checkboxes, progress bar and completion label update live.

### Profile card

Extras: `setIdentity(displayName, handle, level)`, `setStats(values)`. Actions: `close`, `view_profile`.

### Custom panel

Anything that doesn't match a kind becomes a clean confirm/cancel dialog with `setTitle`/`setSubtitle`.

## Design systems (george_design_system)

- No arguments → the palette catalogue with moods.
- `{ "palette": "royal-arcade", "mode": "dark" }` → a standalone Luau Theme module + the same tokens as JSON.

## Luau systems (george_generate_luau)

| Template | What you get |
| --- | --- |
| `secure-remotes` | `Net` (client-safe) + `NetServer` (schema validation, per-player rate limiting, silent drop of malformed payloads). |
| `profile-store` | `Profiles`: GetAsync/UpdateAsync with retries + backoff, stale-save protection, autosave loop, BindToClose flush. |
| `signal` | A strict-typed signal with Connect/Once/Fire (task.spawn) /Destroy. |

```lua
-- server usage
local NetServer = require(game.ServerScriptService.NetServer)
NetServer.on("purchaseItem", { itemId = "string", quantity = "number" }, function(player, payload)
	-- payload is schema-validated and rate-limited before it reaches you
end)
```

## Code review (george_review_luau)

Paste any Luau source. Rules include: deprecated `wait/spawn/delay`, `loadstring`/env access, unprotected DataStore calls, `SetAsync` (prefer `UpdateAsync`), unvalidated `OnServerEvent`, frozen `while true` loops, `InputBegan` ignoring `gameProcessedEvent`, legacy `Game.` references, numeric-id `require`, missing `--!strict`, leftover `print`. Errors fail the review; every issue carries a concrete fix.

## Research (george_search)

```json
{ "query": "how to make scrolling shop grid", "limit": 5 }
```

Returns verified entries with official source URLs (Roblox engine reference, modelcontextprotocol.io, upstream GitHub projects). Irrelevant queries return empty rather than fabricating — George never invents facts.

## Thumbnails (george_generate_thumbnail)

```json
{
  "title": "NEBULA RUN",
  "subtitle": "Build beyond imagination",
  "palette": "royal-arcade",
  "badge": "UPDATE"
}
```

Returns an inline PNG (offline pixel-art renderer, deterministic — great for regenerating the same art) plus an SVG banner variant. With a configured provider, the external API is used instead (with automatic local fallback).

## Scaffolding (george_project_scaffold)

```json
{ "name": "Nebula Run" }
```

Emits `default.project.json` (Rojo), `rokit.toml` (pinned toolchain), `wally.toml`, `stylua.toml`, `selene.toml`, source tree (`src/server`, `src/client`, `src/shared`), `.gitignore` and README — drop generated UI modules into `src/shared` and you have a real repository.

## Integration status (george_integrations)

`{ "probe": true }` live-pings configured HTTP adapters (2 s timeout each) and reports bundled/policy/adapter/documented status honestly. See [INTEGRATIONS.md](INTEGRATIONS.md) for the full acceptance report.
