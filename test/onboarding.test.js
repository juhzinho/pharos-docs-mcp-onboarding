import test from "node:test";
import assert from "node:assert/strict";
import { CANT, describeInput, extractChainId, extractEndpoint, extractEthCallExample, gapHistory, GAPS, stepById, STEPS, summarize } from "../lib/onboarding.js";

// Answers below are trimmed copies of real Docs MCP replies from the logged session.
const AI_UNKNOWN =
  "I can’t confirm from the docs what **ai.pharos.xyz** specifically hosts. Pharos documents a related user-facing AI chat called **Anvita On**. If you meant the exact `ai.pharos.xyz` site, its details aren’t covered in the docs.";
const AI_UNKNOWN_2 = "I can’t find `ai.pharos.xyz` identified in the available docs. The documented Pharos AI tools are **Anvita Flow** and **Pharos MCP**.";
const DOCS_URL_WRONG = "The Pharos MCP server URL is **`https://mcp.pharos.xyz/mcp`**. See [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp).";
const CONNECT = 'The Pharos MCP endpoint is **`https://mcp.pharos.xyz/mcp`**. It uses Streamable HTTP.\n\n```json\n{"mcpServers":{"pharos":{"type":"http","url":"https://mcp.pharos.xyz/mcp"}}}\n```';
const NETWORK = "Pharos Pacific Mainnet uses chain ID `1672` and RPC `https://rpc.pharos.xyz`. Gas is paid in **PROS**.";
const ETH_CALL_MCP = 'Example:\n\n```json\n{\n  "transaction": {\n    "to": "0x4100000000000000000000000000000000000000",\n    "data": "0x76671808"\n  },\n  "block": "latest"\n}\n```';
const ETH_CALL_RPC =
  'Example JSON-RPC request:\n\n```json\n{\n  "jsonrpc": "2.0",\n  "method": "eth_call",\n  "params": [\n    {\n      "to": "0x4100000000000000000000000000000000000000",\n      "data": "0x76671808"\n    },\n    "latest"\n  ],\n  "id": 1\n}\n```';

test("there are at least 3 gaps, each with a problem and a fix in both languages", () => {
  const ids = Object.keys(GAPS);
  assert.ok(ids.length >= 3);
  for (const g of Object.values(GAPS)) for (const k of ["title", "problem", "fix"]) assert.ok(g[k].en && g[k].pt, k);
  for (const id of ids) assert.ok(STEPS.some((s) => s.gap === id), `${id} has an exact query`);
});

test("every step has a goal, a tool and a query", () => {
  for (const s of STEPS) {
    assert.ok(["askQuestion", "searchDocumentation", "getPage"].includes(s.tool), s.id);
    assert.ok(s.query && s.goal.en && s.goal.pt, s.id);
  }
});

test("'can't confirm' / 'aren't covered' counts as not found", () => {
  assert.ok(CANT.test(AI_UNKNOWN));
  assert.ok(CANT.test(AI_UNKNOWN_2));
  assert.equal(stepById("what-is-ai").check(AI_UNKNOWN).ok, false);
  assert.equal(stepById("what-is-ai").check("ai.pharos.xyz is the hub for building agents on Pharos.").ok, true);
});

test("'can't identify' / 'doesn't describe' counts as not found (a real answer that once slipped through as 'fixed')", () => {
  const AI_UNKNOWN_3 = "I can’t identify **ai.pharos.xyz** from the available Pharos documentation; it doesn’t describe that domain. If you mean Pharos’s AI-connected blockchain tools, see Pharos MCP.";
  assert.ok(CANT.test(AI_UNKNOWN_3));
  assert.equal(stepById("what-is-ai").check(AI_UNKNOWN_3).ok, false);
  assert.ok(CANT.test("The download location for `pharos-skill-engine-0.1.0.zip` isn’t specified in the Pharos Skill Engine guide."));
  assert.ok(!CANT.test("The Pharos MCP endpoint is https://mcp.pharos.xyz/mcp. It uses Streamable HTTP."));
});

test("a fix's tool input is written from the server's own schema", () => {
  const ethCall = { name: "eth_call", inputSchema: { properties: { transaction: { type: "object" }, block: { anyOf: [{ type: "string" }, { type: "number" }] } }, required: ["transaction"] } };
  assert.equal(describeInput(ethCall), "{transaction: object (required), block: string | number}");
});

test("gap history: first seen, how many runs it stayed open, open now", () => {
  const run = (at, open) => ({ startedAt: at, steps: [{ gap: "G1" }, { gap: "G2" }], summary: { gapsOpen: open } });
  const h = gapHistory([run("2026-11-09T00:00:00Z", ["G2"]), run("2026-11-03T00:00:00Z", ["G1", "G2"])]);
  assert.deepEqual(h.G2, { runs: 2, open: 2, firstSeen: "2026-11-03T00:00:00Z", lastSeen: "2026-11-09T00:00:00Z", openNow: true });
  assert.equal(h.G1.open, 1);
  assert.equal(h.G1.openNow, false);
});

test("Docs MCP URL answered with the Chain MCP URL is flagged as wrong", () => {
  const r = stepById("docs-mcp-url").check(DOCS_URL_WRONG);
  assert.equal(r.ok, false);
  assert.match(r.note, /Wrong: answered with the Chain MCP URL/);
  assert.equal(stepById("docs-mcp-url").check("Use https://docs.pharos.xyz/~gitbook/mcp").ok, true);
});

test("facts are pulled from answers, not hardcoded", () => {
  assert.equal(extractEndpoint(CONNECT), "https://mcp.pharos.xyz/mcp");
  assert.equal(extractChainId(NETWORK), 1672);
  assert.equal(extractEndpoint("no url here"), null);
});

test("eth_call example: MCP shape passes, JSON-RPC shape is a gap and gets converted", () => {
  const mcp = extractEthCallExample(ETH_CALL_MCP);
  assert.equal(mcp.shape, "mcp");
  assert.deepEqual(mcp.input, { transaction: { to: "0x4100000000000000000000000000000000000000", data: "0x76671808" }, block: "latest" });
  assert.equal(stepById("eth-call").check(ETH_CALL_MCP).ok, true);

  const rpc = extractEthCallExample(ETH_CALL_RPC);
  assert.equal(rpc.shape, "json-rpc");
  assert.ok(Array.isArray(rpc.asGiven.params));
  assert.deepEqual(rpc.input, mcp.input);
  assert.equal(stepById("eth-call").check(ETH_CALL_RPC).ok, false);
  assert.equal(extractEthCallExample("no code"), null);
});

test("faucet search with no faucet page is a gap", () => {
  const step = stepById("faucet-search");
  assert.equal(step.check("", [{ title: "Piggy Bank Tutorial", link: "https://docs.pharos.xyz/x" }]).ok, false);
  assert.equal(step.check("", [{ title: "Atlantic Faucet", link: "https://docs.pharos.xyz/faucet" }]).ok, true);
});

test("summary keeps a gap open if any of its queries still fails", () => {
  const s = summarize([
    { verdict: "helped" },
    { verdict: "gap", gap: "G2" },
    { verdict: "fixed", gap: "G2" },
    { verdict: "fixed", gap: "G1" },
    { verdict: "missed" },
  ]);
  assert.deepEqual(s.gapsOpen, ["G2"]);
  assert.deepEqual(s.gapsFixed, ["G1"]);
  assert.equal(s.helped, 1);
  assert.equal(s.missed, 1);
});
