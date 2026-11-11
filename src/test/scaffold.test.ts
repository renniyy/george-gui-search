import { test } from "node:test";
import assert from "node:assert/strict";
import { scaffoldProject } from "../core/scaffold.js";

test("scaffold emits a complete Rojo/Rokit/Wally project", () => {
  const scaffold = scaffoldProject("Nebula Run");
  assert.equal(scaffold.name, "Nebula Run");

  const paths = scaffold.files.map((f) => f.path);
  for (const expected of [
    "default.project.json",
    "rokit.toml",
    "wally.toml",
    "stylua.toml",
    "selene.toml",
    "src/server/init.server.lua",
    "src/client/init.client.lua",
    "src/shared/init.lua",
    ".gitignore",
    "README.md",
  ]) {
    assert.ok(paths.includes(expected), `missing ${expected}`);
  }
});

test("default.project.json is valid JSON with the standard service mapping", () => {
  const scaffold = scaffoldProject("Test Game");
  const project = JSON.parse(scaffold.files.find((f) => f.path === "default.project.json")!.content);
  assert.equal(project.name, "Test Game");
  assert.ok(project.tree.ReplicatedStorage.Shared.$path === "src/shared");
  assert.ok(project.tree.ServerScriptService.Server.$path === "src/server");
  assert.ok(project.tree.StarterPlayer.StarterPlayerScripts.Client.$path === "src/client");
});

test("project names are sanitized", () => {
  assert.equal(scaffoldProject("../etc/passwd").name, "etc passwd");
  assert.equal(scaffoldProject("***").name, "MyRobloxGame");
  assert.equal(scaffoldProject("  Spaces  &  Symbols! ").name, "Spaces Symbols");
});

test("toolchain pins reference the correct upstream projects", () => {
  const scaffold = scaffoldProject("X");
  const rokit = scaffold.files.find((f) => f.path === "rokit.toml")!.content;
  assert.ok(rokit.includes("rojo-rbx/rojo"));
  assert.ok(rokit.includes("JohnnyMorganz/StyLua"));
  assert.ok(rokit.includes("UpliftGames/wally"));
  assert.ok(rokit.includes("JohnnyMorganz/luau-lsp"));
});
