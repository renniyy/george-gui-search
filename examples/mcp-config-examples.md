# Example MCP client configurations

GEORGE GUI @Search speaks MCP over stdio, so any compliant client works. Quick reference (see docs/INSTALLATION.md for full notes):

## Claude Desktop / Cursor / generic

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

## Claude Code

```bash
claude mcp add george-gui-search -- npx -y george-gui-search
```

## VS Code (.vscode/mcp.json)

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

## Zed (settings.json)

```json
{
  "context_servers": {
    "george-gui-search": {
      "command": { "path": "npx", "args": ["-y", "george-gui-search"] }
    }
  }
}
```

## With optional environment variables

```json
{
  "mcpServers": {
    "george-gui-search": {
      "command": "npx",
      "args": ["-y", "george-gui-search"],
      "env": {
        "GEORGE_COMFY_URL": "http://127.0.0.1:8188"
      }
    }
  }
}
```

## MCP Inspector (debugging)

```bash
npx @modelcontextprotocol/inspector npx george-gui-search
```

## From source

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
