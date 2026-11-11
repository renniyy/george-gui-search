import { test } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { GEORGE_VERSION } from "../core/gui-generator.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

const SERVER_PATH = fileURLToPath(new URL("../index.js", import.meta.url));

async function withClient(run: (client: Client) => Promise<void>): Promise<void> {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [SERVER_PATH],
    stderr: "ignore",
  });
  const client = new Client({ name: "george-e2e-test", version: "1.0.0" });
  await client.connect(transport);
  try {
    await run(client);
  } finally {
    await client.close();
  }
}

test("server connects and exposes all ten tools", async () => {
  await withClient(async (client) => {
    const tools = await client.listTools();
    const names = tools.tools.map((t) => t.name).sort();
    assert.deepEqual(names, [
      "george_audit_gui",
      "george_design_system",
      "george_generate_gui",
      "george_generate_luau",
      "george_generate_thumbnail",
      "george_integrations",
      "george_project_scaffold",
      "george_review_luau",
      "george_search",
      "george_version",
    ]);
  });
});

test("george_version returns structured capabilities", async () => {
  await withClient(async (client) => {
    const result = await client.callTool({ name: "george_version", arguments: {} });
    assert.equal(result.isError, undefined);
    const structured = result.structuredContent as any;
    assert.equal(structured.version, GEORGE_VERSION);
    assert.ok(structured.interfaceKinds.includes("shop"));
    assert.ok(structured.palettes.includes("midnight-nebula"));
    assert.ok(structured.knowledgeEntries >= 40);
  });
});

test("george_search returns sourced results over the protocol", async () => {
  await withClient(async (client) => {
    const result = await client.callTool({
      name: "george_search",
      arguments: { query: "remote event security", limit: 3 },
    });
    const structured = result.structuredContent as any;
    assert.ok(structured.results.length >= 1);
    assert.equal(structured.results[0].url, "https://create.roblox.com/docs/reference/engine/classes/RemoteEvent");
  });
});

test("george_generate_gui end-to-end returns audited Luau", async () => {
  await withClient(async (client) => {
    const result = await client.callTool({
      name: "george_generate_gui",
      arguments: {
        description: "a neon shop with item cards",
        palette: "midnight-nebula",
        title: "Nova Shop",
        items: [{ name: "Plasma Blade", price: "750", badge: "NEW" }],
      },
    });
    const structured = result.structuredContent as any;
    assert.equal(structured.guiName, "ShopUI");
    assert.equal(structured.auditPassed, true);
    assert.equal(structured.auditScore, 100);
    const text = (result.content as Array<{ type: string; text?: string }>)[0].text ?? "";
    assert.ok(text.includes("function UI.mount"));
    assert.ok(text.includes("Nova Shop"));

    // And the audit tool accepts the returned spec.
    const audit = await client.callTool({
      name: "george_audit_gui",
      arguments: { spec: structured.spec },
    });
    const auditStructured = audit.structuredContent as any;
    assert.equal(auditStructured.passed, true);
  });
});

test("george_review_luau flags a dangerous script over the protocol", async () => {
  await withClient(async (client) => {
    const result = await client.callTool({
      name: "george_review_luau",
      arguments: { source: "wait(1)\nlocal x = loadstring('return 1')()" },
    });
    const structured = result.structuredContent as any;
    assert.equal(structured.passed, false);
    assert.ok(structured.errors >= 2);
  });
});

test("george_generate_thumbnail returns an inline PNG image block", async () => {
  await withClient(async (client) => {
    const result = await client.callTool({
      name: "george_generate_thumbnail",
      arguments: { title: "NEBULA RUN", subtitle: "Build beyond imagination", palette: "royal-arcade", badge: "NEW" },
    });
    const blocks = result.content as Array<{ type: string; mimeType?: string; data?: string; text?: string }>;
    const imageBlock = blocks.find((b) => b.type === "image");
    assert.ok(imageBlock, "expected an image content block");
    assert.equal(imageBlock.mimeType, "image/png");
    assert.ok((imageBlock.data ?? "").length > 10_000);
    const textBlock = blocks.find((b) => b.type === "text");
    assert.ok(textBlock?.text?.includes("<svg"));
  });
});

test("george_integrations reports honest statuses", async () => {
  await withClient(async (client) => {
    const result = await client.callTool({
      name: "george_integrations",
      arguments: { probe: false, scope: "mandatory" },
    });
    const structured = result.structuredContent as any;
    assert.ok(structured.bundled.includes("typescript-sdk"));
    assert.ok(structured.policies.length >= 5);
    assert.ok(structured.documented.includes("rea"));
  });
});

test("george_project_scaffold emits a Rojo project", async () => {
  await withClient(async (client) => {
    const result = await client.callTool({
      name: "george_project_scaffold",
      arguments: { name: "Nebula Run" },
    });
    const structured = result.structuredContent as any;
    assert.equal(structured.name, "Nebula Run");
    assert.equal(structured.fileCount, 10);
    const text = (result.content as Array<{ type: string; text?: string }>)[0].text ?? "";
    assert.ok(text.includes("default.project.json"));
    assert.ok(text.includes("rokit.toml"));
  });
});

test("input validation rejects bad arguments", async () => {
  await withClient(async (client) => {
    // Too-short query: the server must refuse to run the tool. The SDK either
    // rejects the request or returns an isError result — both are correct.
    let rejected = false;
    let errorResult = false;
    try {
      const result = await client.callTool({ name: "george_search", arguments: { query: "x" } });
      errorResult = result.isError === true;
    } catch {
      rejected = true;
    }
    assert.ok(rejected || errorResult, "invalid input must be rejected");

    // Invalid enum: same contract.
    let enumRejected = false;
    let enumError = false;
    try {
      const result = await client.callTool({
        name: "george_generate_luau",
        arguments: { template: "not-a-template" as unknown as "signal" },
      });
      enumError = result.isError === true;
    } catch {
      enumRejected = true;
    }
    assert.ok(enumRejected || enumError, "invalid enum must be rejected");
  });
});
