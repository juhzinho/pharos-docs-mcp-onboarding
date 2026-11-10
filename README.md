# Docs MCP Onboarding — ai.pharos.xyz with only the Developer Docs MCP

I onboarded onto **ai.pharos.xyz** using **only the Pharos Developer Docs MCP** (`https://docs.pharos.xyz/~gitbook/mcp`): no external docs, no search engine, no community help. This is the log: what I tried, the exact queries, what came back, where the docs got me unstuck, where they broke down — and what I managed to run at the end.

The session is a script, so every query can be re-run and every gap re-checked.

**Live demo:** https://pharos-contract-reader.vercel.app/#onboard — opens on the recorded run; "Run all steps live" sends every query again, right now.
**Full answers from the recorded run:** [`log/latest.md`](log/latest.md) (raw: [`log/latest.json`](log/latest.json), every saved run: [`log/history/`](log/history/))

## What makes this log trustworthy

- **Every gap was asked three times.** `askQuestion` is answered by a language model, so one bad answer could be bad luck. In the recorded run every gap question failed **3 of 3** times.
- **Every gap is tracked over time.** Two saved runs, a week apart (2026-11-03 and 2026-11-10): all 7 gaps were open in both.
- **Every suggested fix is checked.** A wrong fix would be worse than the gap. Whatever a fix claims that the two MCP servers can confirm was confirmed live (✓ below); the G7 fix is written from the Chain MCP's own `tools/list` schema. What the servers cannot confirm (a download link, a faucet) is labelled as such, never ticked.
- **Nothing in the build is typed by me.** The endpoint, chain ID, `eth_call` example and USDC address are extracted from the answers by the script.
- **Verdicts are computed, not opinions.** Each step has a check on the answer ([`lib/onboarding.js`](lib/onboarding.js)), tested on real Docs MCP replies — including one ("I can't *identify* ai.pharos.xyz… it *doesn't describe* that domain") that once slipped through an earlier version of the check as "fixed".

## Requirements

| Requirement | Where |
|---|---|
| 01 Step-by-step log: what I tried, the questions, the answers | [Step-by-step log](#step-by-step-log) below; every full answer in [`log/latest.md`](log/latest.md) |
| 02 At least 3 concrete gaps, each with the exact query | [7 gaps](#gaps--where-the-docs-broke-down), each with the exact `askQuestion` / `searchDocumentation` / `getPage` call, failed 3 of 3 times |
| 03 A suggested fix for each gap | Each gap ends with **Fix** (what the docs should have said) and **Checked** (what of it was confirmed live) |
| 04 Ends with what I built or ran | [What I built / ran by the end](#what-i-built--ran-by-the-end): only facts taken from the answers, run on the Chain MCP |

## Step-by-step log

Recorded run 2026-11-10 00:00 UTC, 17 steps: **7 helped · 7 gaps open**. Gap questions were each asked 3 times.

| # | What I tried | Exact query (tool) | What I got | Verdict |
|---|---|---|---|---|
| 1 | Find out what ai.pharos.xyz is | `What is ai.pharos.xyz and how do I get started with it?` (askQuestion) | "The Pharos docs don't identify **ai.pharos.xyz**." Falls back to Anvita On / Anvita Flow | **GAP G1** · 3 of 3 |
| 2 | Connect my AI client to the Chain MCP | `How do I connect the Pharos Chain MCP server to Claude or Cursor? What is the endpoint URL?` | `https://mcp.pharos.xyz/mcp`, Streamable HTTP, no key, config JSON | helped |
| 3 | See the tools | `Which tools does the Pharos Chain MCP expose?` | All 14 tools, grouped | helped |
| 4 | Do I need a key? Limits? | `Does the Pharos Chain MCP need an API key, and what are its rate limits?` | No key, 120 requests per minute per IP | helped |
| 5 | Add the Docs MCP itself | `What is the URL of the Pharos Developer Docs MCP server?` | "The Pharos MCP server URL is `https://mcp.pharos.xyz/mcp`." **Wrong**: that is the Chain MCP | **GAP G2** · 3 of 3 |
| 6 | Double-check | `Is there an MCP server for the Pharos documentation itself (GitBook MCP)?` | The Pharos MCP "serves chain data … not the Pharos documentation" — said by the docs' own MCP server | **GAP G2** · 3 of 3 |
| 7 | Learn SkillEngine | `What is the Pharos Skill Engine (pharos-skill-engine) and how do I install it?` | Clear: a local toolkit an agent reads, driven through Foundry `cast`/`forge`; "not an SDK" | helped |
| 8 | Download SkillEngine | `Where do I download the pharos-skill-engine-0.1.0.zip package?` | Shows how to unzip it, "but it doesn't provide a download location or link" | **GAP G3** · 3 of 3 |
| 9 | Install Foundry on my machine (Windows) | `How do I install Foundry for the Pharos Skill Engine on Windows?` | "doesn't provide Windows-specific Foundry installation steps", then the external Foundry book | **GAP G4** · 3 of 3 |
| 10 | Network basics | `What is the chain ID and RPC URL of Pharos Pacific Mainnet, and which token pays for gas?` | 1672, `https://rpc.pharos.xyz`, PROS | helped |
| 11 | Testnet tokens to try a write safely | `What is the faucet URL for Pharos Atlantic testnet PHRS?` | "The faucet URL isn't listed in the available docs", points to the Piggy Bank tutorial | **GAP G5** · 3 of 3 |
| 12 | Search instead | `faucet` (searchDocumentation) | 1 result: Piggy Bank Tutorial. No faucet page | **GAP G5** |
| 13 | get_logs limit before scanning | `What is the maximum block range for get_logs on the Pharos Chain MCP?` | 1,000 blocks per call, split larger ranges | helped |
| 14 | Exact eth_call input | `What arguments does the Chain MCP eth_call tool take? Give a JSON example.` | A raw JSON-RPC request `{"jsonrpc":"2.0","method":"eth_call","params":[{to, data}, "latest"]}`. The MCP tool rejects that shape (see the build) | **GAP G7** · 3 of 3 |
| 15 | Read the tool inputs myself | `https://docs.pharos.xyz/tooling-and-infrastructure/mcp` (getPage) | Tool → JSON-RPC method tables; no tool shows its input arguments | **GAP G7** |
| 16 | A real contract to read | `https://docs.pharos.xyz/getting-started/token-registry` (getPage) | Pacific USDC `0xC879C018dB60520F4355C26eD1a6D572cdAC1815` | helped |
| 17 | How to submit this | `How do I submit a build to the Pharos Agent Arena (Season of AI)?` | "I can't find instructions for submitting a build specifically to the Pharos Agent Arena". Redirects to Anvita Flow Service Agents | **GAP G6** · 3 of 3 |

### Where the docs got me unstuck

- **Pharos MCP page** (steps 2–4, 13): endpoint, transport, no key, 120 requests/min, the 1,000-block `get_logs` cap and "split into 1,000-block windows". All used as written.
- **Token registry** (step 16): official Pacific addresses, so I never had to trust a random contract.
- **Skill Engine guide** (step 7): a clear "it's a toolkit an agent reads, not an SDK" explanation and good key hygiene (`PRIVATE_KEY` in the environment).
- **Honest about what it doesn't know**: steps 8, 11 and 17 say "isn't listed" / "can't find" instead of inventing a URL. The bad cases are G2 (confident and wrong) and G7 (an example that fails as written).

## Gaps — where the docs broke down

All 7 were open in both saved runs (2026-11-03 and 2026-11-10); every `askQuestion` below failed 3 of 3 times in the recorded run.

### G1 · ai.pharos.xyz itself is unknown to the docs
- **Exact query:** `askQuestion("What is ai.pharos.xyz and how do I get started with it?")`
- **Got:** "The Pharos docs don't identify **ai.pharos.xyz**. The documented user-facing AI chat is **Anvita On**…"
- **Why it hurts:** the campaign says "build it on ai.pharos.xyz", and the docs can't say what it is.
- **Fix:** add an "AI builders" page: ai.pharos.xyz is the hub for building agents on Pharos and bundles Chain MCP (`https://mcp.pharos.xyz/mcp`), Developer Docs MCP (`https://docs.pharos.xyz/~gitbook/mcp`) and SkillEngine. Step 1: add both MCP servers. Step 2: install SkillEngine. Step 3: pick a task.
- **Checked:** ✓ the Chain MCP answers at that URL (14 tools, chain 1672) · ✓ the Docs MCP answers at that URL (4 tools).

### G2 · The Docs MCP gives the wrong URL for itself
- **Exact queries:** `askQuestion("What is the URL of the Pharos Developer Docs MCP server?")` and `askQuestion("Is there an MCP server for the Pharos documentation itself (GitBook MCP)?")`
- **Got:** "The Pharos MCP server URL is `https://mcp.pharos.xyz/mcp`" — the **Chain MCP**, a different server with different tools. The second: the Pharos MCP "serves Pharos chain data … not the Pharos documentation", answered by the documentation's own MCP server.
- **Why it hurts:** the worst one, because it is confident and wrong. A newcomer adds the Chain MCP twice and never gets doc search in their client.
- **Fix:** on the Pharos MCP page add a "Developer Docs MCP" section: endpoint `https://docs.pharos.xyz/~gitbook/mcp`, Streamable HTTP, no key, tools `searchDocumentation` / `getPage` / `askQuestion` / `sendFeedback`, plus the config JSON. Call the two servers "Chain MCP" and "Docs MCP" everywhere (today the docs say "Pharos MCP", the campaign says "Chain MCP").
- **Checked:** ✓ `tools/list` on `https://docs.pharos.xyz/~gitbook/mcp` returns exactly those four tools.

### G3 · SkillEngine install starts from a zip with no download link
- **Exact query:** `askQuestion("Where do I download the pharos-skill-engine-0.1.0.zip package?")`
- **Got:** "shows how to unzip `pharos-skill-engine-0.1.0.zip`, but it doesn't provide a download location or link."
- **Fix:** put the download link (release page or direct URL, with the current version) right above the `unzip` command in the Skill Engine guide.
- **Checked:** not checkable from the MCPs — only the Pharos team can publish the link.

### G4 · No Windows path for SkillEngine / Foundry
- **Exact query:** `askQuestion("How do I install Foundry for the Pharos Skill Engine on Windows?")`
- **Got:** "doesn't provide Windows-specific Foundry installation steps. It documents a Unix-style installer (`curl` and `source ~/.zshenv`)…", then the external Foundry book.
- **Fix:** add a Windows note: run the installer inside WSL2 or Git Bash, then `foundryup`; on bash reload with `source ~/.bashrc` instead of `~/.zshenv`; verify with `cast --version`.
- **Checked:** not checkable from the MCPs.

### G5 · Testnet faucet is mentioned but never linked
- **Exact queries:** `askQuestion("What is the faucet URL for Pharos Atlantic testnet PHRS?")` and `searchDocumentation("faucet")`
- **Got:** "The faucet URL isn't listed in the available docs." The search returns only the Piggy Bank Tutorial.
- **Fix:** on the Atlantic Testnet page add the PHRS faucet URL, the amount per claim, the cooldown and any requirement. For test USDC, link Circle's faucet (faucet.circle.com → USDC → "Pharos Testnet", which is Atlantic), where the official testnet USDC `0xcfC8…Fc8B` comes from.
- **Checked:** not checkable from the MCPs (the Chain MCP serves Pacific Mainnet). The Circle faucet part was confirmed outside this session: it delivered 20 USDC on Atlantic to a test wallet on 2026-11-09.

### G6 · Agent Arena / how to submit a build is missing
- **Exact query:** `askQuestion("How do I submit a build to the Pharos Agent Arena (Season of AI)?")`
- **Got:** "I can't find instructions for submitting a build specifically to the Pharos Agent Arena (Season of AI). The available guide covers publishing a Pharos Skill as an Anvita Flow Service Agent, which is a separate process."
- **Fix:** add a Season of AI page: the tasks are at pharos-agent-arena.vercel.app; sign in with GitHub; proof is a link a reviewer can open (ai.pharos.xyz share link, explorer tx hash or deployed demo) plus the repo; a video adds +50 points.
- **Checked:** not checkable from the MCPs.

### G7 · Chain MCP tool arguments are not documented
- **Exact queries:** `askQuestion("What arguments does the Chain MCP eth_call tool take? Give a JSON example.")` and `getPage("https://docs.pharos.xyz/tooling-and-infrastructure/mcp")`
- **Got:** an example as a raw JSON-RPC request, `{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0x41…","data":"0x76671808"},"latest"]}`. Sent to the MCP tool as written it fails: `Input validation error … transaction: expected object`. The MCP page maps each tool to a JSON-RPC method but never shows a tool's input.
- **Fix:** under each tool on the Pharos MCP page, show its input object as the server's own `tools/list` defines it — e.g. `eth_call → {"transaction": {"to": "0x…", "data": "0x…"}, "block": "latest"}` (transaction required; block a tag or a number) and `get_logs → {address (one or a list), topics, fromBlock, toBlock}`, at most 1,000 blocks. Say plainly that it is not the JSON-RPC `params` array. Generate the table from `tools/list` so it cannot drift.
- **Checked:** ✓ the Chain MCP's own schema for `eth_call` is `{transaction: object (required), block: string | number}` · ✓ the `params` shape the docs gave is rejected · ✓ the `{transaction, block}` shape the fix proposes runs. The inputs, from the schema:
  ```
  eth_call       → {transaction: object (required), block: string | number}
  estimate_gas   → {transaction: object (required)}
  get_logs       → {address: string | array, topics: array, fromBlock: string | number, toBlock: string | number}
  get_balance    → {address: string (required), block: string | number}
  get_storage_at → {address: string (required), position: string (required), block: string | number}
  ```

## What I built / ran by the end

The last stage connects to the Chain MCP **at the URL the docs gave in step 2** and runs only what the answers taught (recorded run):

```
✓ get_chain_info on https://mcp.pharos.xyz/mcp: chain 1672 (PROS), latest block 22606683. Docs said chain ID 1672.
✗ The docs' eth_call example sent as written ({"params": [...]}) was rejected by the tool: Input validation error: transaction expected object.
✓ The docs' eth_call example (to 0x4100000000000000000000000000000000000000, data 0x76671808) ran after moving it into {transaction, block}: result 0x…07cb (= 1995).
✓ eth_call symbol() and decimals() on the registry USDC 0xC879C018dB60520F4355C26eD1a6D572cdAC1815 at block 22606683: USDC, 6 decimals.
```

So by the end I had, from the docs alone:
- a working MCP client config for the Chain MCP (the `.mcp.json` shape from step 2);
- a verified connection to Pacific Mainnet (chain 1672) through it;
- the docs' own `eth_call` example running against mainnet, once corrected (G7);
- a live read of the official USDC, found through the token registry;
- this onboarding checker — a CLI and a live page that re-run every query, re-check every gap and re-verify every fix.

Nothing is signed or sent. SkillEngine itself could not be installed because of G3 (no download link), so the run stops at read-only Chain MCP calls.

## Run it

Node.js 20.12+.

```bash
npm install
npm run onboard                        # the whole session live: 17 queries, the build, the fix checks
npm run onboard -- --repeat 3          # ask every gap question 3 times (how the recorded run was made)
npm run onboard -- --gaps              # only the gap queries + the facts the build needs: quick re-check
npm run onboard -- --save              # write log/latest.md, log/latest.json and log/history/<date>.json
npm run history                        # how long each gap has stayed open across the saved runs
npm run onboard -- --full --lang pt    # every answer, report in Portuguese
npm run onboard -- --json
```

Docs MCP answers are generated, so the wording changes between runs. The checks look for the fact (does the answer contain `docs.pharos.xyz/~gitbook/mcp`?), not for the exact text, and the report says **still open** or **fixed on this run** for each gap.

## Tests

```bash
npm test     # the checks on real logged answers, fact extraction, the schema-written fix, the gap history
```

## Layout

```
onboard.js            the CLI
lib/onboarding.js     the 17 steps, their checks, the 7 gaps and fixes, the build, the fix checks, the history
lib/docs.js           Docs MCP calls (askQuestion, searchDocumentation, getPage)
lib/mcp.js            MCP client (Streamable HTTP, timeouts, retries)
lib/registry.js       reads the Pacific rows of the token registry page
log/                  the recorded run (latest.md / latest.json) and every saved run (history/)
```

The live page (tab 07 of pharos-contract-reader.vercel.app) runs this same `lib/onboarding.js` behind `/api/onboard`, one step per request, and opens on the recorded run.

MIT
