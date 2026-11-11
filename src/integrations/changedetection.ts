/**
 * GEORGE GUI @Search — changedetection.io REST adapter.
 *
 * Thin client over the officially documented changedetection.io REST API
 * (https://changedetection.io/docs/api_v1/). Activated by setting
 * GEORGE_CHANGEDETECTION_URL and optionally GEORGE_CHANGEDETECTION_API_KEY.
 */

export interface WatchSummary {
  uuid: string;
  url: string;
  label: string | null;
  last_checked: string | null;
}

export class ChangeDetectionClient {
  private base: string;
  private apiKey?: string;

  constructor(base: string, apiKey?: string) {
    this.base = base.replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  private async request(path: string, init?: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const headers: Record<string, string> = { "content-type": "application/json", ...(init?.headers as Record<string, string>) };
      if (this.apiKey) headers["x-api-key"] = this.apiKey;
      const response = await fetch(`${this.base}${path}`, { ...init, headers, signal: controller.signal });
      if (!response.ok) {
        throw new Error(`changedetection.io API responded ${response.status} for ${path}`);
      }
      return response;
    } finally {
      clearTimeout(timer);
    }
  }

  async listWatches(): Promise<WatchSummary[]> {
    const response = await this.request("/api/v1/watch");
    const payload = (await response.json()) as Record<string, any>;
    return Object.entries(payload).map(([uuid, watch]) => ({
      uuid,
      url: String(watch.url ?? ""),
      label: watch.label ?? null,
      last_checked: watch.last_checked ?? null,
    }));
  }

  async createWatch(url: string, label?: string, tag?: string): Promise<{ uuid: string }> {
    const response = await this.request("/api/v1/watch", {
      method: "POST",
      body: JSON.stringify({ url, label, tag }),
    });
    const payload = (await response.json()) as { uuid: string };
    return payload;
  }

  async triggerCheck(uuid: string): Promise<void> {
    await this.request(`/api/v1/watch/${uuid}`, { method: "PATCH", body: JSON.stringify({ check_now: true }) });
  }
}

export function configuredClient(): ChangeDetectionClient | null {
  const base = process.env.GEORGE_CHANGEDETECTION_URL;
  if (!base) return null;
  return new ChangeDetectionClient(base, process.env.GEORGE_CHANGEDETECTION_API_KEY);
}
