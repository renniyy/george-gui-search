# Getting started with GEORGE GUI @Search

**Time to first generation: about 60 seconds.**

## 1. Requirements

- Node.js ≥ 20 (`node --version`)
- An MCP client: Claude Desktop, Claude Code, VS Code (Copilot), Cursor, Zed, or the MCP Inspector

## 2. Connect the server

Add George to your MCP client. The quickest possible configuration:

```json
{
  "mcpServers": {
    "george-gui-search": {
      "command": "npx",
      "args": ["-y", "george-gui-search"]
    }
  }
}
```

Client-specific setup lives in [INSTALLATION.md](INSTALLATION.md).

Prefer to try before you configure? Launch the official inspector:

```bash
npx @modelcontextprotocol/inspector npx george-gui-search
```

The inspector lists all ten tools, lets you edit arguments as JSON, and shows the raw protocol messages.

## 3. Generate your first interface

Ask your MCP client (or call `george_generate_gui` in the inspector) with:

```json
{
  "description": "a neon shop with tabs and item cards",
  "palette": "midnight-nebula",
  "title": "Nova Shop",
  "items": [
    { "name": "Plasma Blade", "subtitle": "Weapon", "price": "750", "badge": "NEW" }
  ]
}
```

You receive:

1. **A complete Luau ModuleScript** (`ShopUI`) — theme tokens, full hierarchy, animations, responsive layout, controller API.
2. **The audit report** — contrast, touch targets and text sizes, scored 100/100.
3. **Setup notes** — where to put the module and how to wire actions.

## 4. Put it in Studio

1. Create a ModuleScript named `ShopUI` in `ReplicatedStorage/UI`.
2. Paste the generated code.
3. From a LocalScript (for example in `StarterPlayerScripts`):

```lua
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ShopUI = require(ReplicatedStorage.UI.ShopUI)

local ui = ShopUI.mount()
ui:open()

ui:on("buy", function(item)
	print("Player wants to buy", item.name, "for", item.price)
end)

ui:on("close", function()
	ui:close()
end)
```

Press Play — the shop mounts, fades in with a Back-eased entrance, tabs switch, buttons give hover/press/gamepad feedback, and BUY fires your callback with the item table.

## 5. Keep going

- Browse the interface kinds and their options: [USER_GUIDE.md](USER_GUIDE.md)
- Generate the surrounding project: `george_project_scaffold`
- Review or generate Luau systems code: `george_generate_luau` / `george_review_luau`
- Make a thumbnail: `george_generate_thumbnail`

Every tool is documented with schemas and examples in [MCP_TOOLS.md](MCP_TOOLS.md).
