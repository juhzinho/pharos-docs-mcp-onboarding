#!/usr/bin/env node
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { connect, DOCS_MCP_URL } from "./lib/mcp.js";
import { formatSession, formatStep, gapHistory, GAPS, runOnboarding, sessionMarkdown, STEPS } from "./lib/onboarding.js";

const HELP = `Docs MCP Onboarding — self-onboard onto ai.pharos.xyz using only the Developer Docs MCP, and log where it broke down

Usage:
  npm run onboard                     run the whole session live (${STEPS.length} queries, then the build and the fix checks)
  npm run onboard -- --repeat 3       ask every gap question 3 times: "wrong 3 of 3" is a gap, not bad luck
  npm run onboard -- --full           also print every answer
  npm run onboard -- --save           write log/latest.md, log/latest.json and log/history/<date>.json
  npm run onboard -- --gaps           only the gap queries + the ones the build needs (quick re-check)
  npm run onboard -- --history        how long each gap has stayed open across the saved runs (no MCP call)

Options:
  --lang en|pt   report language (queries stay in English, like the docs)
  --json         structured result
  --help

Every step is a real Docs MCP call (askQuestion, searchDocumentation or getPage).
The build at the end connects to the Chain MCP URL the docs gave and runs the docs' own eth_call example. Nothing is sent.
Then every suggested fix is checked against both MCP servers, wherever they can confirm it.
`;

function parseArgs(argv) {
  const opts = { lang: "en", full: false, save: false, json: false, gaps: false, history: false, repeat: 1 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") opts.help = true;
    else if (a === "--full") opts.full = true;
    else if (a === "--save") opts.save = true;
    else if (a === "--json") opts.json = true;
    else if (a === "--gaps") opts.gaps = true;
    else if (a === "--history") opts.history = true;
    else if (a === "--repeat") {
      opts.repeat = Number(argv[++i]);
      if (!Number.isInteger(opts.repeat) || opts.repeat < 1 || opts.repeat > 5) return { error: "--repeat must be a whole number from 1 to 5." };
    } else if (a === "--lang") {
      opts.lang = argv[++i];
      if (!["en", "pt"].includes(opts.lang)) return { error: "--lang must be en or pt." };
    } else return { error: `Unknown option: ${a}` };
  }
  return opts;
}

const LOG = fileURLToPath(new URL("./log/", import.meta.url));
const HISTORY = LOG + "history/";

async function savedRuns() {
  const files = await readdir(HISTORY).catch(() => []);
  return Promise.all(files.filter((f) => f.endsWith(".json")).map(async (f) => JSON.parse(await readFile(HISTORY + f, "utf8"))));
}

function printHistory(runs, lang) {
  const h = gapHistory(runs);
  const day = (iso) => iso.slice(0, 10);
  console.log(lang === "pt" ? `HISTÓRICO — ${runs.length} execuções salvas` : `HISTORY — ${runs.length} saved runs`);
  for (const [id, g] of Object.entries(h)) {
    const state = g.openNow ? (lang === "pt" ? "aberta" : "open") : lang === "pt" ? "corrigida" : "fixed";
    const span = lang === "pt" ? `aberta em ${g.open} de ${g.runs} execuções, de ${day(g.firstSeen)} a ${day(g.lastSeen)}` : `open in ${g.open} of ${g.runs} runs, ${day(g.firstSeen)} → ${day(g.lastSeen)}`;
    console.log(`  ${id}  ${state.padEnd(9)} ${span}  · ${GAPS[id].title[lang]}`);
  }
}

const opts = parseArgs(process.argv.slice(2));
if (opts.error) {
  console.log(`${opts.error}\n\n${HELP}`);
  process.exit(1);
}
if (opts.help) {
  console.log(HELP);
  process.exit(0);
}
if (opts.history) {
  const runs = await savedRuns();
  if (!runs.length) {
    console.log("No saved runs yet: run with --save first.");
    process.exit(1);
  }
  printHistory(runs, opts.lang);
  process.exit(0);
}

const steps = opts.gaps ? STEPS.filter((s) => s.gap || s.take) : STEPS;
const docsClient = await connect(DOCS_MCP_URL, "pharos-docs-onboarding");
if (!opts.json) console.log(`Docs MCP ${DOCS_MCP_URL} · ${steps.length} queries${opts.repeat > 1 ? ` · gap questions asked ${opts.repeat}×` : ""}\n`);

const session = await runOnboarding({
  docsClient,
  steps,
  repeat: opts.repeat,
  connectChain: (url) => connect(url, "pharos-docs-onboarding"),
  onStep: (entry, i, n) => {
    if (!opts.json) console.log(formatStep(entry, i, n, opts.lang, { full: opts.full }) + "\n");
  },
});
await docsClient.close().catch(() => {});

if (opts.json) console.log(JSON.stringify(session, null, 2));
else {
  const text = formatSession(session, opts.lang);
  // The steps were already printed live; print the rest of the report.
  console.log(text.slice(text.indexOf(opts.lang === "pt" ? "FALHAS —" : "GAPS —")));
}

if (opts.save) {
  await mkdir(HISTORY, { recursive: true });
  await writeFile(LOG + "latest.json", JSON.stringify(session, null, 2) + "\n");
  await writeFile(LOG + "latest.md", sessionMarkdown(session));
  await writeFile(HISTORY + `${session.startedAt.replace(/[:.]/g, "-")}.json`, JSON.stringify(session, null, 2) + "\n");
  if (!opts.json) {
    console.log(`\nSaved log/latest.md, log/latest.json and log/history/`);
    printHistory(await savedRuns(), opts.lang);
  }
}
process.exit(0);
