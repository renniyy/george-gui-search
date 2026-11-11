# Configuration

GEORGE GUI @Search is **zero-config**: install it and every core tool works offline. Environment variables only *add* optional capabilities. Unset variables never cause errors — features degrade gracefully and `george_integrations` reports exactly what is active.

## Environment variables

### Image generation providers

| Variable | Effect |
| --- | --- |
| `GEORGE_IMAGE_API_URL` | Base URL of any **OpenAI-compatible** image API (must expose `POST {url}/images/generations`). |
| `GEORGE_IMAGE_API_KEY` | Bearer token for that API. |
| `GEORGE_IMAGE_MODEL` | Model id (default `gpt-image-1`). |
| `GEORGE_COMFY_URL` | Base URL of a running **ComfyUI** instance (uses `/prompt`, `/history`, `/view`). |
| `GEORGE_COMFY_CHECKPOINT` | Checkpoint filename in ComfyUI (default `sd_xl_base_1.0.safetensors`). |

When both are set, the OpenAI-compatible provider wins. When neither is set, `george_generate_thumbnail` uses the **built-in offline pixel-art renderer** — deterministic, dependency-free, always available. If a configured provider fails, George automatically falls back to the local renderer and says so in the result.

### Research and automation adapters

| Variable | Effect |
| --- | --- |
| `GEORGE_AGENT_REACH_URL` | Merges an Agent-Reach service's results into `george_search` (best-effort, always attributed). |
| `GEORGE_SCRAPLING_URL` | Routes extraction through a Scrapling sidecar you run (script: `examples/integrations/scrapling_sidecar.py`). |
| `GEORGE_BROWSER_USE_URL` | Enables dispatching authorised browser tasks to a browser-use server. |
| `GEORGE_REA_COMMAND` | *Documented contract only — no code path ships in 1.0.* Reserved for authorised binary inspection workflows. |
| `GEORGE_CHANGEDETECTION_URL` | changedetection.io base URL; enables watch listing/creation from `george_integrations`. |
| `GEORGE_CHANGEDETECTION_API_KEY` | API key for the above. |

### Passing variables through an MCP client

Most clients support an `env` block:

```json
{
  "mcpServers": {
    "george-gui-search": {
      "command": "npx",
      "args": ["-y", "george-gui-search"],
      "env": {
        "GEORGE_COMFY_URL": "http://127.0.0.1:8188",
        "GEORGE_COMFY_CHECKPOINT": "sd_xl_turbo_1.0_fp16.safetensors"
      }
    }
  }
}
```

Or export them in the shell that launches your client.

## Secrets handling

- George reads variables at call time and **writes only to stderr** — secrets never appear in tool output, logs, or generated code.
- Never commit `.env` files; `.env.example` documents the variable names without values.
- Credentials for external services stay with those services; George keeps no state.

## Checking what is active

Ask your client to call:

```json
{ "name": "george_integrations", "arguments": { "probe": true, "scope": "all" } }
```

The report distinguishes **ACTIVE** (bundled or configured + reachable), **CONFIGURED (unreachable)** and **NOT CONFIGURED** per integration — it will never list a documented-but-unimplemented integration as available.

## Design system selection

Palettes are chosen per tool call (`palette` argument), not by config: `midnight-nebula` (default), `solar-flare`, `emerald-terminal`, `candy-pop`, `mono-slate`, `royal-arcade`, each with `dark`/`light` modes. List them anytime with `george_design_system` (no arguments).
