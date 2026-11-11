#!/usr/bin/env python3
"""GEORGE GUI @Search — Scrapling extraction sidecar.

Optional adapter for the Scrapling integration. Run this beside your MCP
server and point GEORGE_SCRAPLING_URL at it (default http://127.0.0.1:8877):

    pip install scrapling
    python examples/integrations/scrapling_sidecar.py

Endpoints (JSON):
    GET  /health                -> {"ok": true}
    POST /extract {"url": ..., "selector": ...?}
         -> {"ok": true, "status": int, "content": str}

Scrapling runs in YOUR process, under YOUR control — this sidecar is a thin
HTTP bridge, nothing more. Requires Scrapling >= 0.2; adjust the import to
match the version you install (see the Scrapling README for its fetchers).
"""

import json
from http.server import BaseHTTPRequestHandler, HTTPServer


def fetch(url: str, selector: str | None) -> dict:
    try:
        from scrapling.fetchers import Fetcher  # Scrapling's sync fetcher
    except ImportError as exc:
        return {"ok": False, "status": 500, "content": f"Scrapling not installed: {exc}"}

    try:
        page = Fetcher.get(url)
    except Exception as exc:  # noqa: BLE001 - bridge reports upstream errors
        return {"ok": False, "status": 502, "content": f"Fetch failed: {exc}"}

    if selector:
        selected = page.css(selector)
        content = "\n".join(element.text or "" for element in selected)
    else:
        content = page.get_all_text()
    return {"ok": True, "status": 200, "content": content}


class Handler(BaseHTTPRequestHandler):
    def _send(self, payload: dict, code: int) -> None:
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802 - http.server naming
        if self.path == "/health":
            self._send({"ok": True}, 200)
        else:
            self._send({"ok": False, "status": 404, "content": "not found"}, 404)

    def do_POST(self) -> None:  # noqa: N802 - http.server naming
        if self.path != "/extract":
            self._send({"ok": False, "status": 404, "content": "not found"}, 404)
            return
        try:
            length = int(self.headers.get("content-length", 0))
            data = json.loads(self.rfile.read(length) or b"{}")
            url = data.get("url", "")
            selector = data.get("selector")
            if not url.startswith("http"):
                self._send({"ok": False, "status": 400, "content": "url must be http(s)"}, 400)
                return
            self._send(fetch(url, selector), 200)
        except Exception as exc:  # noqa: BLE001
            self._send({"ok": False, "status": 400, "content": str(exc)}, 400)

    def log_message(self, fmt, *args) -> None:  # quiet default logging
        pass


if __name__ == "__main__":
    address = ("127.0.0.1", 8877)
    print(f"[george-scrapling-sidecar] listening on http://{address[0]}:{address[1]}")
    HTTPServer(address, Handler).serve_forever()
