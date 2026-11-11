# Installation

GEORGE GUI @Search is a stdio MCP server distributed on npm as [`george-gui-search`](https://www.npmjs.com/package/george-gui-search). Node.js ≥ 20 is required.

## Option A — npx (recommended, zero install)

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

## Option B — global install

```bash
npm install -g george-gui-search
```

```json
{
  "mcpServers": {
    "george-gui-search": {
      "command": "george-gui-search"
    }
  }
}
```

## Option C — from source

```bash
git clone https://github.com/renniyy/george-gui-search.git
cd george-gui-search
npm install
npm run build
```

```json
{
  "mcpServers": {
    "george-gui-search": {
      "command": "node",
      "args": ["/absolute/path/to/george-gui-search/dist/index.js"]
    }
  }
}
```

## Client-specific notes

### Claude Desktop

`Claude → Settings → Developer → Edit Config`, then add the server block under `mcpServers` (Option A) and restart Claude Desktop. Claude Desktop requires Node to be on your PATH.

### Claude Code

```bash
claude mcp add george-gui-search -- npx -y george-gui-search
```

### VS Code (Copilot / Chat)

Add to `.vscode/mcp.json` (or user settings):

```json
{
  "servers": {
    "george-gui-search": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "george-gui-search"]
    }
  }
}
```

### Cursor

`Cursor Settings → MCP → Add a new global MCP server`:

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

### Zed

Add to `~/.config/zed/settings.json`:

```json
{
  "context_servers": {
    "george-gui-search": {
      "command": {
        "path": "npx",
        "args": ["-y", "george-gui-search"]
      }
    }
  }
}
```

### MCP Inspector (any server, debugging)

```bash
npx @modelcontextprotocol/inspector npx george-gui-search
```

## Verifying the connection

1. Start your client and open its MCP/tool list — `george-gui-search` should show **10 tools**.
2. Ask: "Call george_version." — you should get a capability report (version 1.0.0, 12 interface kinds, 6 palettes, 3 Luau templates, 43 knowledge entries).
3. If tools are missing or the server fails to start, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Uninstall

Remove the server block from your client config. For a global install: `npm uninstall -g george-gui-search`. George stores no state outside your MCP client's own files.
