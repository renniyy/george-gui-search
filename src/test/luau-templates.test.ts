import { test } from "node:test";
import assert from "node:assert/strict";
import { LUAU_TEMPLATES, getTemplate, listTemplates } from "../core/luau-templates.js";
import { reviewLuau } from "../core/luau-review.js";

test("three production templates ship", () => {
  assert.deepEqual(LUAU_TEMPLATES.map((t) => t.id), ["secure-remotes", "profile-store", "signal"]);
  assert.equal(listTemplates().length, 3);
  assert.ok(getTemplate("signal"));
  assert.equal(getTemplate("nope"), undefined);
});

test("every template file passes the review engine", () => {
  for (const template of LUAU_TEMPLATES) {
    for (const file of template.files) {
      const review = reviewLuau(file.luau);
      assert.equal(review.errors, 0, `${template.id}/${file.name}: ${JSON.stringify(review.issues.filter((i) => i.severity === "error"), null, 2)}`);
    }
  }
});

test("secure-remotes template validates payloads and rate-limits", () => {
  const net = getTemplate("secure-remotes")!;
  const server = net.files.find((f) => f.name === "NetServer")!;
  assert.ok(server.luau.includes("typeof(payload) ~= \"table\""), "must type-check payload");
  assert.ok(server.luau.includes("typeof(value) ~= expectedType"), "must validate every schema field");
  assert.ok(server.luau.includes("bucket.count <= limit"), "must rate-limit");
  assert.ok(server.luau.includes("PlayerRemoving"), "must clean up buckets");
});

test("profile-store uses UpdateAsync, retries and BindToClose", () => {
  const profile = getTemplate("profile-store")!;
  const luau = profile.files[0].luau;
  assert.ok(luau.includes("UpdateAsync"));
  assert.ok(!luau.includes("SetAsync("));
  assert.ok(luau.includes("RETRY_ATTEMPTS"));
  assert.ok(luau.includes("BindToClose"));
  assert.ok(luau.includes("pcall"));
  assert.ok(luau.includes("2 ^ attempt"), "exponential backoff expected");
});

test("signal template is self-contained and strict", () => {
  const signal = getTemplate("signal")!;
  assert.ok(signal.files[0].luau.startsWith("--!strict"));
  assert.ok(signal.files[0].luau.includes("task.spawn"));
  assert.ok(signal.files[0].luau.includes("function Signal.Once"));
});
