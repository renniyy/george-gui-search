import { test } from "node:test";
import assert from "node:assert/strict";
import { searchKnowledge, listCategories, KNOWLEDGE_BASE } from "../core/knowledge.js";

test("knowledge base has a substantial curated index", () => {
  assert.ok(KNOWLEDGE_BASE.length >= 40, `expected >= 40 entries, got ${KNOWLEDGE_BASE.length}`);
});

test("all entries carry well-formed official URLs", () => {
  for (const entry of KNOWLEDGE_BASE) {
    assert.ok(entry.url.startsWith("https://"), `${entry.id}: non-https url ${entry.url}`);
    assert.ok(
      entry.url.startsWith("https://create.roblox.com/") ||
        entry.url.startsWith("https://modelcontextprotocol.io") ||
        entry.url.startsWith("https://github.com/"),
      `${entry.id}: unexpected host ${entry.url}`
    );
    assert.ok(entry.summary.length > 80, `${entry.id}: summary too thin`);
    assert.ok(entry.tags.length >= 3, `${entry.id}: too few tags`);
  }
});

test("search finds the right topics", () => {
  const remote = searchKnowledge("remote event security exploit");
  assert.ok(remote.length > 0);
  assert.equal(remote[0].entry.id, "remoteevent");

  const scroll = searchKnowledge("scrolling shop grid of items");
  assert.ok(scroll.some((h) => h.entry.id === "uigridlayout" || h.entry.id === "scrollingframe"));

  const datastore = searchKnowledge("how to save player data safely");
  assert.ok(datastore.some((h) => h.entry.id === "datastore"));

  const mcp = searchKnowledge("model context protocol typescript");
  assert.ok(mcp.some((h) => h.entry.id === "mcp-typescript-sdk"));
});

test("category filters work", () => {
  const uiOnly = searchKnowledge("frame", "ui", 10);
  assert.ok(uiOnly.length > 0);
  assert.ok(uiOnly.every((h) => h.entry.category === "ui"));
  const cats = listCategories();
  assert.ok(cats.some((c) => c.category === "ui" && c.count >= 10));
});

test("irrelevant queries return empty instead of fabricating", () => {
  const hits = searchKnowledge("quantum banana theremin xyzzy");
  assert.equal(hits.length, 0);
});
