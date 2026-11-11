import { test } from "node:test";
import assert from "node:assert/strict";
import { MANDATORY_REPOSITORIES, ECOSYSTEM_INTEGRATIONS, ALL_INTEGRATIONS, envConfigured, integrationReport } from "../integrations/registry.js";

const MANDATORY_IDS = [
  "typescript-sdk", "scrapling", "craft-anything", "rea", "browser-use",
  "agent-reach", "changedetection", "mattpocock-skills", "ponytail", "anti-slop", "impeccable",
];

test("all eleven mandated repositories are present in the registry", () => {
  const ids = MANDATORY_REPOSITORIES.map((i) => i.id);
  assert.deepEqual(ids.sort(), [...MANDATORY_IDS].sort());
  assert.equal(MANDATORY_REPOSITORIES.length, 11);
});

test("every entry states an honest integration kind", () => {
  for (const integration of ALL_INTEGRATIONS) {
    assert.ok(["bundled", "adapter", "policy", "documented"].includes(integration.kind), `${integration.id}: bad kind`);
    assert.ok(integration.repo.startsWith("https://github.com/"), `${integration.id}: repo must be a github URL`);
    assert.ok(integration.implementation.length > 40, `${integration.id}: implementation description too thin`);
  }
});

test("adapters declare their env variables and health endpoints", () => {
  for (const integration of ALL_INTEGRATIONS.filter((i) => i.kind === "adapter")) {
    assert.ok(integration.env && integration.env.length > 0, `${integration.id}: adapter missing env`);
    assert.ok(integration.healthUrl, `${integration.id}: adapter missing healthUrl`);
  }
});

test("documented integrations are never reported as configured", async () => {
  const reports = await integrationReport(false);
  const rea = reports.find((r) => r.integration.id === "rea");
  assert.equal(rea?.integration.kind, "documented");
  assert.equal(rea?.status.configured, false);
  assert.ok(rea?.status.detail.toLowerCase().includes("not"));
});

test("bundled and policy integrations report as active without probes", async () => {
  const reports = await integrationReport(false);
  for (const report of reports) {
    if (report.integration.kind === "bundled" || report.integration.kind === "policy") {
      assert.equal(report.status.configured, true, `${report.integration.id} should be active`);
    }
  }
});

test("envConfigured detects adapter activation", () => {
  const scrapling = MANDATORY_REPOSITORIES.find((i) => i.id === "scrapling")!;
  delete process.env.GEORGE_SCRAPLING_URL;
  assert.equal(envConfigured(scrapling), false);
  process.env.GEORGE_SCRAPLING_URL = "http://127.0.0.1:8877";
  try {
    assert.equal(envConfigured(scrapling), true);
  } finally {
    delete process.env.GEORGE_SCRAPLING_URL;
  }
});

test("ecosystem registry covers the Roblox toolchain", () => {
  const ids = new Set(ECOSYSTEM_INTEGRATIONS.map((i) => i.id));
  for (const expected of ["github-mcp-server", "rojo", "rokit", "wally", "stylua", "selene", "luau-lsp", "lune", "comfyui", "trivy", "semgrep", "scorecard"]) {
    assert.ok(ids.has(expected), `missing ecosystem entry ${expected}`);
  }
});
