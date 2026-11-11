# Troubleshooting

## The server doesn't appear in my MCP client

1. **Check Node**: run `node --version` in a terminal — Node ≥ 20 is required.
2. **Run it manually**: `npx -y george-gui-search` — you should see `[george-gui-search] MCP server running on stdio` (on stderr) and then it waits. If it exits immediately, note the error.
3. **Client JSON**: the config must be valid JSON at the right location (see [INSTALLATION.md](INSTALLATION.md)); a trailing comma breaks the whole file.
4. **Path issues on Windows**: use the full path to npx if Node isn't on the client's PATH, e.g. `"command": "C:\\Program Files\\nodejs\\npx.cmd"`.

## Tools are listed but a call fails with "Invalid arguments"

The SDK validates inputs before handlers run. Common causes: `query` shorter than 2 characters, `title` longer than 40, more than 24 items, or a misspelled enum. The error names the offending constraint — the full schemas are in [MCP_TOOLS.md](MCP_TOOLS.md).

## Generated UI doesn't look right in Studio

- **Nothing appears**: the module mounts hidden by design — call `ui:open()` (or `UI.mount()` then `controller.open()`).
- **It appears behind other UI**: raise `DisplayOrder` in the generated `ScreenGui` properties, or open it earlier.
- **Wrong theme**: the module embeds the tokens at generation time. Regenerate with the palette/mode you want rather than editing hexes by hand.
- **Icons are placeholder boxes**: that's the `DROP ICON HERE` slot — assign your own `ImageLabel.Image` assets, as noted in the result's setup notes.

## `stylua` reformats my generated file

Generated code is canonical under the **shipped config** (`stylua.toml`, column width 130). If you run StyLua with a different config (e.g. default 100), it will reflow. Put the repo's `stylua.toml` next to the file or match its settings.

## Thumbnail looks like pixel art, not a rendered scene

That's the offline **local pixel renderer** — deterministic and always available. For AI-generated art, configure an image provider (`GEORGE_IMAGE_API_URL` + `GEORGE_IMAGE_API_KEY`, or `GEORGE_COMFY_URL`) and call the tool again. If a configured provider errors, George falls back to the local renderer and names the provider error in the `source` field.

## An integration shows CONFIGURED (unreachable)

The health probe (2 s timeout) couldn't reach the configured URL. Check that the service is running and reachable from the MCP server process (`curl <url>` from the same machine). Features depending on it degrade gracefully — nothing else breaks.

## The audit flags contrast on my custom palette

Correct behavior: George's shipped palettes are constraint-solved to ≥ 4.6:1. A custom palette must satisfy the same math — darken/lighten the flagged token (the message includes the measured ratio and target) or ship your palette through the solver pattern in `scripts/adjust-palettes.mjs`.

## npm install fails or npx can't find the package

- Confirm the exact name: `george-gui-search`.
- Corporate proxies: set `HTTPS_PROXY` for npm.
- The package requires Node ≥ 20; older Node versions fail at install or startup.

## Still stuck?

Open an issue with: your Node version, MCP client, the failing tool call (JSON), and the stderr output of a manual `npx george-gui-search` run. See [SUPPORT.md](../SUPPORT.md) for channels.
