#!/usr/bin/env node
/**
 * GEORGE GUI @Search — MCP server entry point.
 *
 * Runs a stdio MCP server exposing the Roblox creative-engineering tool
 * suite. Logs go to stderr only (stdout is the protocol channel).
 *
 * Build beyond imagination.
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("[george-gui-search] MCP server running on stdio\n");
}

main().catch((error: unknown) => {
  process.stderr.write(`[george-gui-search] fatal: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`);
  process.exit(1);
});
