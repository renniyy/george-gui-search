import { test } from "node:test";
import assert from "node:assert/strict";
import { reviewLuau } from "../core/luau-review.js";

test("clean modern code passes", () => {
  const review = reviewLuau(`--!strict
local TweenService = game:GetService("TweenService")
local function animate(part: BasePart)
	TweenService:Create(part, TweenInfo.new(0.3), { Transparency = 0 }):Play()
end
return animate
`);
  assert.ok(review.passed);
  assert.equal(review.errors, 0);
});

test("deprecated globals are flagged as errors", () => {
  const review = reviewLuau(`wait(1)\nspawn(function() end)\ndelay(2, function() end)`);
  const rules = review.issues.filter((i) => i.severity === "error").map((i) => i.rule);
  assert.ok(rules.includes("deprecated-wait"));
  assert.ok(rules.includes("deprecated-spawn"));
  assert.ok(rules.includes("deprecated-delay"));
  assert.ok(!review.passed);
});

test("unprotected DataStore calls fail, protected ones pass", () => {
  const bad = reviewLuau(`local store = game:GetService("DataStoreService"):GetDataStore("x")\nlocal data = store:GetAsync("key")\n`);
  assert.ok(bad.issues.some((i) => i.rule === "datastore-unprotected" && i.severity === "error"));

  const good = reviewLuau(`local store = game:GetService("DataStoreService"):GetDataStore("x")
local ok, data = pcall(function()
	return store:GetAsync("key")
end)
`);
  assert.ok(!good.issues.some((i) => i.rule === "datastore-unprotected"));
});

test("SetAsync suggests UpdateAsync", () => {
  const review = reviewLuau(`local ok = pcall(function() store:SetAsync("k", 1) end)\n`);
  assert.ok(review.issues.some((i) => i.rule === "prefer-updateasync"));
});

test("unvalidated remote handlers are flagged", () => {
  const bad = reviewLuau(`remote.OnServerEvent:Connect(function(player, payload)\n\tplayer.leaderstats.Coins.Value += payload.amount\nend)\n`);
  assert.ok(bad.issues.some((i) => i.rule === "remote-unvalidated"));

  const good = reviewLuau(`remote.OnServerEvent:Connect(function(player, payload)
	if typeof(payload) ~= "table" or typeof(payload.amount) ~= "number" then
		return
	end
end)
`);
  assert.ok(!good.issues.some((i) => i.rule === "remote-unvalidated"));
});

test("frozen while-true loops are errors", () => {
  const bad = reviewLuau(`while true do\n\tprint("spin")\nend`);
  assert.ok(bad.issues.some((i) => i.rule === "frozen-loop" && i.severity === "error"));

  const good = reviewLuau(`while true do\n\ttask.wait(1)\nend`);
  assert.ok(!good.issues.some((i) => i.rule === "frozen-loop"));
});

test("input handlers ignoring gameProcessedEvent are flagged", () => {
  const bad = reviewLuau(`UserInputService.InputBegan:Connect(function(input)\n\tif input.KeyCode == Enum.KeyCode.E then\n\t\tprint("interact")\n\tend\nend)\n`);
  assert.ok(bad.issues.some((i) => i.rule === "input-ignores-processed"));

  const good = reviewLuau(`UserInputService.InputBegan:Connect(function(input, gameProcessed)\n\tif gameProcessed then return end\nend)\n`);
  assert.ok(!good.issues.some((i) => i.rule === "input-ignores-processed"));
});

test("dangerous patterns are errors", () => {
  const review = reviewLuau(`local f = loadstring("return 1")()\nlocal env = getfenv(1)\n`);
  assert.ok(review.issues.some((i) => i.rule === "loadstring"));
  assert.ok(review.issues.some((i) => i.rule === "environment-escape"));
});

test("missing strict mode is an info, not an error", () => {
  const review = reviewLuau(`return 1\n`);
  const strict = review.issues.find((i) => i.rule === "missing-strict");
  assert.ok(strict);
  assert.equal(strict?.severity, "info");
});

test("line numbers are reported", () => {
  const review = reviewLuau(`local a = 1\nlocal b = 2\nwait(1)\n`);
  const issue = review.issues.find((i) => i.rule === "deprecated-wait");
  assert.equal(issue?.line, 3);
});

test("legacy Game reference is flagged", () => {
  const review = reviewLuau(`local p = Game.Players.LocalPlayer\n`);
  assert.ok(review.issues.some((i) => i.rule === "legacy-game-reference"));
});

test("remote asset requires are flagged", () => {
  const review = reviewLuau(`local mod = require(123456789)\n`);
  assert.ok(review.issues.some((i) => i.rule === "require-waitforchild-asset"));
});
