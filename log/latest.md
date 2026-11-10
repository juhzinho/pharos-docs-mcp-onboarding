# Docs MCP onboarding log — 2026-11-10T00:00:56.040Z

Only the Developer Docs MCP (`https://docs.pharos.xyz/~gitbook/mcp`) was used. 17 steps · 7 helped · 7 gaps open.

## 1. Find out what ai.pharos.xyz is and where to start — GAP (G1)

**askQuestion:** `What is ai.pharos.xyz and how do I get started with it?`

**Verdict:** Says it can't find ai.pharos.xyz; falls back to Anvita Flow and the Chain MCP config. (wrong 3 of 3 times asked)

<details><summary>Answer</summary>

The Pharos docs don’t identify **ai.pharos.xyz**. The documented user-facing AI chat is **Anvita On** at [flow.anvita.xyz/agent/chat](https://flow.anvita.xyz/agent/chat). It connects you with a personal AI assistant, called a **Steward Agent**, which can find and call Pharos Service Agents for tasks. See the [Anvita Flow](https://docs.pharos.xyz/tooling-and-infrastructure/overview).

To get started, open Anvita On and make a request in chat. The Steward Agent searches the Marketplace for a suitable Service Agent and routes your request. The docs list [Anvita Flow Home](https://flow.anvita.xyz/home) for account registration; one account covers both user and developer roles.

If you meant **building and publishing your own agent**, the [Publish Service Agent](https://docs.pharos.xyz/tooling-and-infrastructure/overview/publish-skill-af) covers preparing a Pharos Skill, uploading it, testing it, and publishing its profile.

</details>

Sources: [Anvita Flow](https://docs.pharos.xyz/tooling-and-infrastructure/overview) · [Publish Service Agent](https://docs.pharos.xyz/tooling-and-infrastructure/overview/publish-skill-af) · [x402 Atlantic Testnet](https://docs.pharos.xyz/developer-guide/x402/x402-atlantic-testnet) · [Node Debugging & Configuration](https://docs.pharos.xyz/node-and-validator-guide/node-debugging-and-configuration) · [Pharos Network Snapshots](https://docs.pharos.xyz/node-and-validator-guide/pharos-network-snapshots)

## 2. Connect an AI client to the Chain MCP — HELPED

**askQuestion:** `How do I connect the Pharos Chain MCP server to Claude or Cursor? What is the endpoint URL?`

**Verdict:** Endpoint, Streamable HTTP, config JSON and the mcp-remote bridge for stdio clients.

<details><summary>Answer</summary>

The hosted endpoint is **`https://mcp.pharos.xyz/mcp`**. It uses Streamable HTTP and requires no API key. Add this server entry to Claude or Cursor’s MCP configuration:

```json
{
  "mcpServers": {
    "pharos": {
      "type": "http",
      "url": "https://mcp.pharos.xyz/mcp"
    }
  }
}
```

The exact configuration file or UI steps for Claude and Cursor aren’t specified here. See [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp) for the setup details and an optional health check.

</details>

Sources: [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp) · [Cross Chain Infrastructure](https://docs.pharos.xyz/tooling-and-infrastructure/cross-chain) · [Pharos Skill Engine](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide) · [x402 Pacific Mainnet](https://docs.pharos.xyz/developer-guide/x402/x402-pacific-mainnet) · [x402 Atlantic Testnet](https://docs.pharos.xyz/developer-guide/x402/x402-atlantic-testnet)

## 3. See which tools the Chain MCP gives me — HELPED

**askQuestion:** `Which tools does the Pharos Chain MCP expose?`

**Verdict:** Full tool list grouped by chain, accounts, contracts and broadcasting.

<details><summary>Answer</summary>

The Pharos Chain MCP exposes **14 tools**, grouped by function:

* **Chain and blocks:** `get_chain_info`, `get_block_number`, `get_block`, `get_gas_price`
* **Accounts and transactions:** `get_balance`, `get_transaction_count`, `get_transaction`, `get_transaction_receipt`
* **Contracts:** `eth_call`, `estimate_gas`, `get_code`, `get_storage_at`, `get_logs`
* **Broadcasting:** `send_raw_transaction`

`send_raw_transaction` broadcasts an already-signed transaction. The server does not handle private keys. See [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp) for details.

</details>

Sources: [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp) · [Alchemy RPC](https://docs.pharos.xyz/tooling-and-infrastructure/rpc/alchemy) · [Cross Chain Infrastructure](https://docs.pharos.xyz/tooling-and-infrastructure/cross-chain) · [Pharos Skill Engine](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide) · [About Pharos](https://docs.pharos.xyz/introduction/readme)

## 4. Know if I need a key and how fast I can call it — HELPED

**askQuestion:** `Does the Pharos Chain MCP need an API key, and what are its rate limits?`

**Verdict:** No key; 120 requests per minute per IP.

<details><summary>Answer</summary>

No API key is required for the public Pharos MCP endpoint. It allows **120 requests per minute per IP**.

The hosted endpoint is `https://mcp.pharos.xyz/mcp`. See [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp) for setup details.

</details>

Sources: [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp) · [Circle CCTP](https://docs.pharos.xyz/tooling-and-infrastructure/cross-chain/circle-cctp) · [Cross Chain Infrastructure](https://docs.pharos.xyz/tooling-and-infrastructure/cross-chain) · [JSON-RPC API Methods](https://docs.pharos.xyz/api-and-sdk/json-rpc-methods) · [ZAN RPC](https://docs.pharos.xyz/tooling-and-infrastructure/rpc/zan)

## 5. Add the Docs MCP itself to my client — GAP (G2)

**askQuestion:** `What is the URL of the Pharos Developer Docs MCP server?`

**Verdict:** Wrong: answered with the Chain MCP URL (https://mcp.pharos.xyz/mcp), not the Docs MCP. (wrong 3 of 3 times asked)

<details><summary>Answer</summary>

The Pharos MCP server URL is **`https://mcp.pharos.xyz/mcp`**. See [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp) for connection details.

</details>

Sources: [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp) · [ZAN RPC](https://docs.pharos.xyz/tooling-and-infrastructure/rpc/zan) · [x402 Pacific Mainnet](https://docs.pharos.xyz/developer-guide/x402/x402-pacific-mainnet) · [x402 Atlantic Testnet](https://docs.pharos.xyz/developer-guide/x402/x402-atlantic-testnet) · [Encyclopedia](https://docs.pharos.xyz/introduction/encyclopedia)

## 6. Double-check: is there an MCP for the docs at all? — GAP (G2)

**askQuestion:** `Is there an MCP server for the Pharos documentation itself (GitBook MCP)?`

**Verdict:** Says no docs MCP is documented — while answering through it. (wrong 3 of 3 times asked)

<details><summary>Answer</summary>

The documented [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp) serves Pharos chain data and onchain operations, not the Pharos documentation. Its endpoint is `https://mcp.pharos.xyz/mcp`.

The available documentation doesn’t mention a separate GitBook MCP server for querying the docs themselves.

</details>

Sources: [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp) · [x402 Pacific Mainnet](https://docs.pharos.xyz/developer-guide/x402/x402-pacific-mainnet) · [x402 Atlantic Testnet](https://docs.pharos.xyz/developer-guide/x402/x402-atlantic-testnet) · [Alchemy RPC](https://docs.pharos.xyz/tooling-and-infrastructure/rpc/alchemy) · [Goldsky](https://docs.pharos.xyz/tooling-and-infrastructure/indexing/goldsky)

## 7. Learn what SkillEngine is and how to set it up — HELPED

**askQuestion:** `What is the Pharos Skill Engine (pharos-skill-engine) and how do I install it?`

**Verdict:** Clear: a package of agent files driven through Foundry (cast/forge); keep the key in PRIVATE_KEY.

<details><summary>Answer</summary>

The **Pharos Skill Engine** is a local toolkit of instructions, network settings, templates, and Foundry command references. An AI agent reads it to carry out Pharos tasks using `cast` and `forge`; it is **not** an SDK, API, or smart-contract framework.

To install and set it up:

1. Unzip the Skill Engine package and enter its folder:

   ```bash
   unzip pharos-skill-engine-0.1.0.zip
   cd pharos-skill-engine-0.1.0
   ```
2. Install Foundry if it isn’t already available:

   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   source ~/.zshenv && foundryup
   cast --version
   forge --version
   ```
3. Configure your wallet key in the shell, not in a script or committed file:

   ```bash
   export PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
   cast wallet address --private-key $PRIVATE_KEY
   ```
4. For Atlantic Testnet, set the RPC convenience variable:

   ```bash
   export RPC=https://atlantic.dplabs-internal.com
   ```

Then give the package to an AI agent that can read its `SKILL.md` and follow its instructions. The [Pharos Skill Engine](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide) covers its capabilities and usage.

</details>

Sources: [Pharos Skill Engine](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide) · [Piggy Bank Tutorial](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide/piggybank-skill-guide) · [x402 Atlantic Testnet](https://docs.pharos.xyz/developer-guide/x402/x402-atlantic-testnet) · [x402 Pacific Mainnet](https://docs.pharos.xyz/developer-guide/x402/x402-pacific-mainnet) · [Anvita Flow](https://docs.pharos.xyz/tooling-and-infrastructure/overview)

## 8. Download the SkillEngine package — GAP (G3)

**askQuestion:** `Where do I download the pharos-skill-engine-0.1.0.zip package?`

**Verdict:** No download link; the guide starts at unzip. (wrong 3 of 3 times asked)

<details><summary>Answer</summary>

The [Pharos Skill Engine](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide) shows how to unzip `pharos-skill-engine-0.1.0.zip`, but it doesn’t provide a download location or link.

</details>

Sources: [Pharos Skill Engine](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide) · [x402 Atlantic Testnet](https://docs.pharos.xyz/developer-guide/x402/x402-atlantic-testnet) · [x402 Pacific Mainnet](https://docs.pharos.xyz/developer-guide/x402/x402-pacific-mainnet) · [Validator Node Deployment](https://docs.pharos.xyz/node-and-validator-guide/validator-node-deployment) · [Alchemy RPC](https://docs.pharos.xyz/tooling-and-infrastructure/rpc/alchemy)

## 9. Install Foundry on Windows (my machine) — GAP (G4)

**askQuestion:** `How do I install Foundry for the Pharos Skill Engine on Windows?`

**Verdict:** No Windows steps; sends you to the external Foundry book. (wrong 3 of 3 times asked)

<details><summary>Answer</summary>

The Skill Engine guide doesn’t provide Windows-specific Foundry installation steps. It documents a Unix-style installer (`curl` and `source ~/.zshenv`), so don’t run those commands directly in Windows PowerShell.

Use the [Foundry installation guide](https://book.getfoundry.sh/getting-started/installation) for Windows instructions. After installing, verify both tools are available:

```powershell
cast --version
forge --version
```

The required tools and the documented setup are listed in the [Pharos Skill Engine](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide).

</details>

Sources: [Pharos Skill Engine](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide) · [Write Your First NFT](https://docs.pharos.xyz/developer-guide/foundry/write-your-first-nft) · [Write Your First dApp](https://docs.pharos.xyz/developer-guide/foundry/write-your-first-dapp) · [Write Your First Token](https://docs.pharos.xyz/developer-guide/foundry/write-your-first-token) · [Write Your First Uniswap Contract](https://docs.pharos.xyz/developer-guide/foundry/write-your-first-uniswap-contract)

## 10. Get the mainnet chain ID, RPC and gas token — HELPED

**askQuestion:** `What is the chain ID and RPC URL of Pharos Pacific Mainnet, and which token pays for gas?`

**Verdict:** Chain ID 1672, https://rpc.pharos.xyz, gas in PROS.

<details><summary>Answer</summary>

Pharos Pacific Mainnet uses:

* **Chain ID:** `1672`
* **RPC URL:** `https://rpc.pharos.xyz`
* **Gas token:** `PROS`

See [Pacific Mainnet](https://docs.pharos.xyz/getting-started/network/pacific-mainnet).

</details>

Sources: [Pacific Mainnet](https://docs.pharos.xyz/getting-started/network/pacific-mainnet) · [ZAN RPC](https://docs.pharos.xyz/tooling-and-infrastructure/rpc/zan) · [Pharos Network Snapshots](https://docs.pharos.xyz/node-and-validator-guide/pharos-network-snapshots) · [x402 Pacific Mainnet](https://docs.pharos.xyz/developer-guide/x402/x402-pacific-mainnet) · [Network](https://docs.pharos.xyz/getting-started/network)

## 11. Get testnet tokens to try a write safely — GAP (G5)

**askQuestion:** `What is the faucet URL for Pharos Atlantic testnet PHRS?`

**Verdict:** Faucet is mentioned, no URL. (wrong 3 of 3 times asked)

<details><summary>Answer</summary>

The faucet URL isn’t listed in the available docs. They only say to get testnet PHRS from the [Piggy Bank Tutorial](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide/piggybank-skill-guide).

</details>

Sources: [Piggy Bank Tutorial](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide/piggybank-skill-guide) · [ZAN RPC](https://docs.pharos.xyz/tooling-and-infrastructure/rpc/zan) · [Atlantic Testnet](https://docs.pharos.xyz/getting-started/network/atlantic-testnet) · [x402 Atlantic Testnet](https://docs.pharos.xyz/developer-guide/x402/x402-atlantic-testnet) · [Node Management](https://docs.pharos.xyz/node-and-validator-guide/node-management)

## 12. Search the docs for "faucet" directly — GAP (G5)

**searchDocumentation:** `faucet`

**Verdict:** 1 result(s): Piggy Bank Tutorial; no faucet page.

<details><summary>Answer</summary>

Piggy Bank Tutorial — https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide/piggybank-skill-guide

</details>

## 13. Know the get_logs block range before scanning history — HELPED

**askQuestion:** `What is the maximum block range for get_logs on the Pharos Chain MCP?`

**Verdict:** 1000 blocks per call; page larger ranges.

<details><summary>Answer</summary>

The `get_logs` tool supports a maximum range of **1,000 blocks per call**. For larger ranges, split the query into 1,000-block windows. See [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp).

</details>

Sources: [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp) · [Rollback Blocks](https://docs.pharos.xyz/node-and-validator-guide/rollback-blocks) · [Block Explorer](https://docs.pharos.xyz/tooling-and-infrastructure/block-explorer) · [Cross Chain Infrastructure](https://docs.pharos.xyz/tooling-and-infrastructure/cross-chain) · [Get PROS Gas](https://docs.pharos.xyz/getting-started/get-pros-gas)

## 14. Learn the exact eth_call input so I can run one — GAP (G7)

**askQuestion:** `What arguments does the Chain MCP eth_call tool take? Give a JSON example.`

**Verdict:** Example is the raw JSON-RPC body (params array), not the MCP tool input; the tool rejects it as written. (wrong 3 of 3 times asked)

<details><summary>Answer</summary>

`eth_call` takes a transaction call object and a block. The call object supports `from`, `to`, `gas`, `gasPrice`, `value`, and `data`. The block is optional and defaults to `latest`.

Example JSON-RPC request:

```json
{
  "jsonrpc": "2.0",
  "method": "eth_call",
  "params": [
    {
      "to": "0x4100000000000000000000000000000000000000",
      "data": "0x76671808"
    },
    "latest"
  ],
  "id": 1
}
```

The MCP reference describes the call object and block arguments, but does not specify a separate MCP wrapper format. See [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp) and [JSON-RPC API Methods](https://docs.pharos.xyz/api-and-sdk/json-rpc-methods).

</details>

Sources: [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp) · [JSON-RPC API Methods](https://docs.pharos.xyz/api-and-sdk/json-rpc-methods) · [Call EVM From WASM](https://docs.pharos.xyz/developer-guide/interoperability/call-evm-from-wasm) · [Pharos Skill Engine](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide) · [Cross Chain Infrastructure](https://docs.pharos.xyz/tooling-and-infrastructure/cross-chain)

## 15. Open the Pharos MCP page to read the tool inputs myself — GAP (G7)

**getPage:** `https://docs.pharos.xyz/tooling-and-infrastructure/mcp`

**Verdict:** The page lists the tools and their JSON-RPC methods, but no tool shows its input arguments.

<details><summary>Answer</summary>

# Pharos MCP

## Overview

The Pharos MCP server brings Pharos chain data and onchain operations into any client that speaks the [Model Context Protocol](https://modelcontextprotocol.io) — Claude Desktop, Cursor, Windsurf, Codex, and custom agent runners.

Instead of writing RPC plumbing, you ask your AI assistant in plain language — *"what's the latest Pharos block?"*, *"check the PROS balance of 0x…"* — and it calls the right chain method for you.

|                     |                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------- |
| **Hosted endpoint** | `https://mcp.pharos.xyz/mcp`                                                       |
| **Transport**       | Streamable HTTP                                                                    |
| **Authentication**  | None — public                                                                      |
| **Rate limit**      | 120 requests per minute per IP                                                     |
| **Chain ID**        | `1672` (`0x688`)                                                                   |
| **Native token**    | PROS                                                                               |
| **Source**          | [github.com/PharosNetwork/pharos-mcp](https://github.com/PharosNetwork/pharos-mcp) |

## Quick Start

Add the server to your MCP client configuration

</details>

Sources: [Pharos MCP](https://docs.pharos.xyz/tooling-and-infrastructure/mcp)

## 16. Find a real contract to read: the official USDC — HELPED

**getPage:** `https://docs.pharos.xyz/getting-started/token-registry`

**Verdict:** Pacific Mainnet USDC at 0xC879C018dB60520F4355C26eD1a6D572cdAC1815.

<details><summary>Answer</summary>

# Token Registry

## Atlantic Testnet Token Registry

<table><thead><tr><th width="119.734375">Symbol</th><th width="150.43359375">Name</th><th width="120.29296875">initsupply</th><th width="119.98828125">Decimals</th><th>Address</th></tr></thead><tbody><tr><td>USDC</td><td>USD Coin</td><td>0</td><td>6</td><td>0xcfC8330f4BCAB529c625D12781b1C19466A9Fc8B</td></tr><tr><td>USDT</td><td>Tether USD</td><td>0</td><td>6</td><td>0xE7E84B8B4f39C507499c40B4ac199B050e2882d5</td></tr><tr><td>WBTC</td><td>Wrapped BTC</td><td>0</td><td>18</td><td>0x0c64F03EEa5c30946D5c55B4b532D08ad74638a4</td></tr><tr><td>WETH</td><td>Wrapped ETH</td><td>0</td><td>18</td><td>0x7d211F77525ea39A0592794f793cC1036eEaccD5</td></tr><tr><td>WPHRS</td><td>Wrapped PHRS</td><td>0</td><td>18</td><td>0x838800b758277CC111B2d48Ab01e5E164f8E9471</td></tr></tbody></table>

## Pacific Mainnet Token Registry

| Symbol                 | Name            | Pharos Address                             | Ethereum Address                           | Base Address                               |
| ---------------------- | --------------- | ------------------------------------------ | ------------------------------------------ | ------------------------------------------ |
| WPROS                  | Wrapped PROS    | 0x52c48d4213107b20bc583832b0d951fb9ca8f0b0 | 0xB197E02499e6502733C6bCE2eb39013C39A03147 | 0x8B7DdE054BE9D180c1Be7FaE0874697374A49832 |
| USDC (Circle Deployed) | USDC            | 0xc879c018db60520f4355c26ed1a6d572cdac1815

</details>

Sources: [Token Registry](https://docs.pharos.xyz/getting-started/token-registry)

## 17. Find out how to submit what I built — GAP (G6)

**askQuestion:** `How do I submit a build to the Pharos Agent Arena (Season of AI)?`

**Verdict:** Agent Arena not found; redirects to publishing a Service Agent on Anvita Flow. (wrong 3 of 3 times asked)

<details><summary>Answer</summary>

I can’t find instructions for submitting a build specifically to the **Pharos Agent Arena (Season of AI)**. The available guide covers publishing a Pharos Skill as an Anvita Flow Service Agent, which is a separate process.

For that Service Agent flow, package your Skill as a ZIP with an uppercase `SKILL.md`, upload it in the Developer Console, run a successful debug session, complete the Agent Card, and submit it for review. See [Publish Service Agent](https://docs.pharos.xyz/tooling-and-infrastructure/overview/publish-skill-af) for the steps.

</details>

Sources: [Publish Service Agent](https://docs.pharos.xyz/tooling-and-infrastructure/overview/publish-skill-af) · [Anvita Flow](https://docs.pharos.xyz/tooling-and-infrastructure/overview) · [Pharos Skill Engine](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide) · [Piggy Bank Tutorial](https://docs.pharos.xyz/tooling-and-infrastructure/pharos-skill-engine-guide/piggybank-skill-guide) · [Write Your First dApp](https://docs.pharos.xyz/developer-guide/hardhat/write-your-first-dapp)

## Suggested fixes, checked

### G1 · ai.pharos.xyz itself is unknown to the docs

**Fix:** Add an "AI builders" page: ai.pharos.xyz is the hub for building agents on Pharos and bundles three tools — Chain MCP (https://mcp.pharos.xyz/mcp), Developer Docs MCP (https://docs.pharos.xyz/~gitbook/mcp) and SkillEngine. Step 1: add both MCP servers to your client. Step 2: install SkillEngine. Step 3: pick a task.

- ✓ Chain MCP https://mcp.pharos.xyz/mcp answers: 14 tools, chain 1672.
- ✓ Developer Docs MCP https://docs.pharos.xyz/~gitbook/mcp answers: 4 tools (searchDocumentation, getPage, askQuestion, sendFeedback).

### G2 · Docs MCP gives the wrong URL for itself

**Fix:** On the Pharos MCP page add a "Developer Docs MCP" section: endpoint https://docs.pharos.xyz/~gitbook/mcp, Streamable HTTP, no API key, tools searchDocumentation / getPage / askQuestion / sendFeedback, plus the client config JSON. Name the two servers "Chain MCP" and "Docs MCP" everywhere so they are not confused.

- ✓ tools/list on https://docs.pharos.xyz/~gitbook/mcp returns exactly the tools the fix names: searchDocumentation, getPage, askQuestion, sendFeedback.

### G3 · SkillEngine install starts from a zip with no download link

**Fix:** Put the download link (release page or direct URL, with the current version) right above the unzip command in the Pharos Skill Engine guide.

_Not checkable from the MCPs:_ The download link is something only the Pharos team can publish.


### G4 · No Windows path for SkillEngine / Foundry

**Fix:** Add a Windows note: run the installer inside WSL2 or Git Bash, then `foundryup`; on bash reload with `source ~/.bashrc` instead of `~/.zshenv`; verify with `cast --version`.

_Not checkable from the MCPs:_ Installing Foundry on Windows is outside what either MCP server can check.


### G5 · Testnet faucet is mentioned but never linked

**Fix:** On the Atlantic Testnet page add the PHRS faucet URL, the amount per claim, the cooldown and any requirement (e.g. a mainnet balance or a social login). For test USDC, link Circle's faucet (faucet.circle.com → USDC → "Pharos Testnet", which is Atlantic), where the official testnet USDC 0xcfC8…Fc8B comes from.

_Not checkable from the MCPs:_ The faucet URL is not exposed by either MCP server.


### G6 · Agent Arena / how to submit a build is missing

**Fix:** Add a Season of AI page: tasks live at pharos-agent-arena.vercel.app; sign in with GitHub; proof is a link a reviewer can open (ai.pharos.xyz share link, explorer tx hash or deployed demo) plus the repo; a video adds +50 points.

_Not checkable from the MCPs:_ The Agent Arena is a website; neither MCP server can confirm it.


### G7 · Chain MCP tool arguments are not documented

**Fix:** Under each tool on the Pharos MCP page, show its input object as the server's own tools/list defines it, e.g. eth_call → {"transaction": {"to": "0x…", "data": "0x…"}, "block": "latest"} (transaction required; block a tag or a number); get_logs → {address (one or a list), topics, fromBlock, toBlock}, at most 1000 blocks. Say plainly that it is not the JSON-RPC params array. Generating the table from tools/list keeps it from drifting.

- ✓ The Chain MCP's own schema for eth_call: {transaction: object (required), block: string | number}.
- ✓ The JSON-RPC shape the docs gave ({"params": [...]}) is rejected by the tool — sent this run.
- ✓ The shape the fix proposes ({"transaction": {to, data}, "block": "latest"}) runs — sent this run.

Tool inputs, from the Chain MCP's own schema:

```
eth_call → {transaction: object (required), block: string | number}
estimate_gas → {transaction: object (required)}
get_logs → {address: string | array, topics: array, fromBlock: string | number, toBlock: string | number}
get_balance → {address: string (required), block: string | number}
get_storage_at → {address: string (required), position: string (required), block: string | number}
```

## Built / ran by the end

- ✓ get_chain_info on https://mcp.pharos.xyz/mcp: chain 1672 (PROS), latest block 22606683. Docs said chain ID 1672.
- ✗ The docs' eth_call example sent as written ({"params": [...]}) was rejected by the tool: Input validation error: transaction expected object.
- ✓ The docs' eth_call example (to 0x4100000000000000000000000000000000000000, data 0x76671808) ran after moving it into {transaction, block}: result 0x00000000000000000000000000000000000000000000000000000000000007cb (= 1995).
- ✓ eth_call symbol() and decimals() on the registry USDC 0xC879C018dB60520F4355C26eD1a6D572cdAC1815 at block 22606683: USDC, 6 decimals.
