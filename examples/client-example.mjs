#!/usr/bin/env node
/**
 * GEORGE GUI @Search — example MCP client.
 *
 * Spawns the server over stdio with the official SDK client, lists tools,
 * generates a shop interface, and prints the audit report. Run:
 *
 *   node examples/client-example.mjs
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { writeFileSync } from "node:fs";

const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["dist/index.js"],
  stderr: "inherit",
});

const client = new Client({ name: "george-example-client", version: "1.0.0" });
await client.connect(transport);

try {
  // 1. Capability report
  const version = await client.callTool({ name: "george_version", arguments: {} });
  console.log("== george_version ==");
  console.log(version.content[0].text, "\n");

  // 2. Generate a shop interface
  const shop = await client.callTool({
    name: "george_generate_gui",
    arguments: {
      description: "a neon shop with tabs and item cards",
      palette: "midnight-nebula",
      title: "Nova Shop",
      items: [
        { name: "Plasma Blade", subtitle: "Weapon", price: "750", badge: "NEW" },
        { name: "Gravity Belt", subtitle: "Movement", price: "400" },
      ],
    },
  });
  const structured = shop.structuredContent;
  console.log("== george_generate_gui ==");
  console.log(`kind=${structured.kind} gui=${structured.guiName} audit=${structured.auditScore}/100 (${structured.auditSummary})`);
  console.log(`actions: ${structured.actions.join(", ")}`);
  writeFileSync("examples/generated-ShopUI.lua", structured.spec ? extractLuau(shop.content[0].text) : "");
  console.log("saved: examples/generated-ShopUI.lua\n");

  // 3. Research
  const research = await client.callTool({
    name: "george_search",
    arguments: { query: "remote event security", limit: 2 },
  });
  console.log("== george_search ==");
  console.log(research.content[0].text, "\n");

  // 4. Review
  const review = await client.callTool({
    name: "george_review_luau",
    arguments: { source: "wait(1)\nlocal x = loadstring('return 1')()" },
  });
  console.log("== george_review_luau (seeded bad code) ==");
  console.log(review.content[0].text);
} finally {
  await client.close();
}

function extractLuau(text) {
  const match = /```lua\n([\s\S]*?)```/.exec(text);
  return match ? match[1] : "";
}
