import { decodeFunctionResult, encodeFunctionData, isAddress, parseAbi } from "viem";
import { callJson, callTool } from "./mcp.js";
import { askDocs, getDocsPage, parseAnswer, searchDocs } from "./docs.js";
import { extractPacificRegistry, TOKEN_REGISTRY_URL } from "./registry.js";

// A self-onboarding session onto ai.pharos.xyz that only uses the Developer Docs MCP.
// Every step is a real query. Steps tied to a gap re-check it on each run, so the log shows whether the docs still fail there.

export const CANT = /\b(can.?t|cannot|could ?n.?t|unable to) (find|confirm|identify|locate|verify)\b|\bnot (identified|documented|mentioned|listed|covered|described|specified)\b|\b(aren.?t|isn.?t) (covered|documented|described|specified)\b|\bno (relevant )?information\b|\b(doesn.?t|does not|don.?t|do not) (provide|specify|mention|include|list|document|cover|describe|identify|explain)\b/i;

const MCP_PAGE_URL = "https://docs.pharos.xyz/tooling-and-infrastructure/mcp";

export const GAPS = {
  G1: {
    title: { en: "ai.pharos.xyz itself is unknown to the docs", pt: "A documentação não conhece o próprio ai.pharos.xyz" },
    problem: {
      en: "The campaign says to build on ai.pharos.xyz, but the docs have no page about it. The answer falls back to Anvita Flow and the Chain MCP config.",
      pt: "A campanha manda construir no ai.pharos.xyz, mas a documentação não tem nenhuma página sobre ele. A resposta cai para o Anvita Flow e a configuração do Chain MCP.",
    },
    fix: {
      en: "Add an \"AI builders\" page: ai.pharos.xyz is the hub for building agents on Pharos and bundles three tools — Chain MCP (https://mcp.pharos.xyz/mcp), Developer Docs MCP (https://docs.pharos.xyz/~gitbook/mcp) and SkillEngine. Step 1: add both MCP servers to your client. Step 2: install SkillEngine. Step 3: pick a task.",
      pt: "Criar uma página \"AI builders\": o ai.pharos.xyz é o ponto de partida para construir agentes na Pharos e reúne três ferramentas — Chain MCP (https://mcp.pharos.xyz/mcp), Developer Docs MCP (https://docs.pharos.xyz/~gitbook/mcp) e SkillEngine. Passo 1: adicionar os dois MCPs ao cliente. Passo 2: instalar o SkillEngine. Passo 3: escolher uma tarefa.",
    },
  },
  G2: {
    title: { en: "Docs MCP gives the wrong URL for itself", pt: "O Docs MCP dá a URL errada de si mesmo" },
    problem: {
      en: "Asked for the Developer Docs MCP URL, it answers with the Chain MCP URL (mcp.pharos.xyz/mcp), a different server. Asked directly, it says no MCP server for the docs is documented — while answering through that server.",
      pt: "Perguntado pela URL do Developer Docs MCP, ele responde com a URL do Chain MCP (mcp.pharos.xyz/mcp), outro servidor. Perguntado diretamente, diz que não existe MCP documentado para a documentação — enquanto responde por esse mesmo servidor.",
    },
    fix: {
      en: "On the Pharos MCP page add a \"Developer Docs MCP\" section: endpoint https://docs.pharos.xyz/~gitbook/mcp, Streamable HTTP, no API key, tools searchDocumentation / getPage / askQuestion / sendFeedback, plus the client config JSON. Name the two servers \"Chain MCP\" and \"Docs MCP\" everywhere so they are not confused.",
      pt: "Na página Pharos MCP, adicionar uma seção \"Developer Docs MCP\": endpoint https://docs.pharos.xyz/~gitbook/mcp, Streamable HTTP, sem chave, ferramentas searchDocumentation / getPage / askQuestion / sendFeedback, e o JSON de configuração. Chamar os dois servidores de \"Chain MCP\" e \"Docs MCP\" em todo lugar para não confundir.",
    },
  },
  G3: {
    title: { en: "SkillEngine install starts from a zip with no download link", pt: "A instalação do SkillEngine começa com um zip sem link para baixar" },
    problem: {
      en: "The guide's first step is `unzip pharos-skill-engine-0.1.0.zip`, but nowhere says where to get the zip.",
      pt: "O primeiro passo do guia é `unzip pharos-skill-engine-0.1.0.zip`, mas em nenhum lugar diz onde baixar o zip.",
    },
    fix: {
      en: "Put the download link (release page or direct URL, with the current version) right above the unzip command in the Pharos Skill Engine guide.",
      pt: "Colocar o link de download (página de release ou URL direta, com a versão atual) logo acima do comando unzip no guia do Pharos Skill Engine.",
    },
  },
  G4: {
    title: { en: "No Windows path for SkillEngine / Foundry", pt: "Sem caminho para Windows no SkillEngine / Foundry" },
    problem: {
      en: "The install uses `curl … | bash` and `source ~/.zshenv` (macOS zsh). For Windows the answer says the guide has nothing and points to the external Foundry book.",
      pt: "A instalação usa `curl … | bash` e `source ~/.zshenv` (zsh do macOS). Para Windows, a resposta diz que o guia não tem nada e manda para o livro do Foundry, fora da documentação.",
    },
    fix: {
      en: "Add a Windows note: run the installer inside WSL2 or Git Bash, then `foundryup`; on bash reload with `source ~/.bashrc` instead of `~/.zshenv`; verify with `cast --version`.",
      pt: "Adicionar uma nota para Windows: rodar o instalador no WSL2 ou no Git Bash, depois `foundryup`; no bash recarregar com `source ~/.bashrc` em vez de `~/.zshenv`; conferir com `cast --version`.",
    },
  },
  G5: {
    title: { en: "Testnet faucet is mentioned but never linked", pt: "O faucet da testnet é citado mas nunca tem link" },
    problem: {
      en: "The docs tell you to get Atlantic PHRS \"from the Pharos faucet or directly from the team\". No URL, and searching \"faucet\" only returns the Piggy Bank tutorial.",
      pt: "A documentação manda pegar PHRS da Atlantic \"no faucet da Pharos ou direto com o time\". Nenhuma URL, e buscar \"faucet\" só retorna o tutorial Piggy Bank.",
    },
    fix: {
      en: "On the Atlantic Testnet page add the PHRS faucet URL, the amount per claim, the cooldown and any requirement (e.g. a mainnet balance or a social login). For test USDC, link Circle's faucet (faucet.circle.com → USDC → \"Pharos Testnet\", which is Atlantic), where the official testnet USDC 0xcfC8…Fc8B comes from.",
      pt: "Na página da Atlantic Testnet, colocar a URL do faucet de PHRS, quanto vem por pedido, o tempo de espera e qualquer exigência (por exemplo saldo na mainnet ou login social). Para USDC de teste, linkar o faucet da Circle (faucet.circle.com → USDC → \"Pharos Testnet\", que é a Atlantic), de onde vem o USDC de teste oficial 0xcfC8…Fc8B.",
    },
  },
  G6: {
    title: { en: "Agent Arena / how to submit a build is missing", pt: "Falta o Agent Arena / como enviar um build" },
    problem: {
      en: "Nothing about the Season of AI Agent Arena: where the tasks are, what counts as proof, how points work. The answer redirects to publishing a Service Agent on Anvita Flow, a different process.",
      pt: "Nada sobre o Agent Arena do Season of AI: onde estão as tarefas, o que vale como prova, como funcionam os pontos. A resposta manda publicar um Service Agent no Anvita Flow, que é outro processo.",
    },
    fix: {
      en: "Add a Season of AI page: tasks live at pharos-agent-arena.vercel.app; sign in with GitHub; proof is a link a reviewer can open (ai.pharos.xyz share link, explorer tx hash or deployed demo) plus the repo; a video adds +50 points.",
      pt: "Criar uma página do Season of AI: as tarefas ficam em pharos-agent-arena.vercel.app; entrar com GitHub; a prova é um link que o revisor consegue abrir (link do ai.pharos.xyz, hash de tx no explorer ou demo publicada) mais o repositório; vídeo vale +50 pontos.",
    },
  },
  G7: {
    title: { en: "Chain MCP tool arguments are not documented", pt: "Os argumentos das ferramentas do Chain MCP não estão documentados" },
    problem: {
      en: "The Pharos MCP page lists every tool but never shows its input. Asked for the eth_call arguments, the docs answer with the raw JSON-RPC body (3 of 3 times in the recorded run) ({\"params\": [{to, data}, \"latest\"]}). The MCP tool rejects that shape with \"Input validation error … transaction: expected object\"; it wants {\"transaction\": {to, data}, \"block\": \"latest\"}.",
      pt: "A página Pharos MCP lista todas as ferramentas, mas nunca mostra a entrada de nenhuma. Perguntado pelos argumentos do eth_call, a documentação responde com o corpo JSON-RPC cru (3 de 3 vezes na execução gravada) ({\"params\": [{to, data}, \"latest\"]}). A ferramenta do MCP rejeita esse formato com \"Input validation error … transaction: expected object\"; ela quer {\"transaction\": {to, data}, \"block\": \"latest\"}.",
    },
    fix: {
      en: "Under each tool on the Pharos MCP page, show its input object as the server's own tools/list defines it, e.g. eth_call → {\"transaction\": {\"to\": \"0x…\", \"data\": \"0x…\"}, \"block\": \"latest\"} (transaction required; block a tag or a number); get_logs → {address (one or a list), topics, fromBlock, toBlock}, at most 1000 blocks. Say plainly that it is not the JSON-RPC params array. Generating the table from tools/list keeps it from drifting.",
      pt: "Embaixo de cada ferramenta na página Pharos MCP, mostrar o objeto de entrada como o próprio tools/list do servidor define, por exemplo eth_call → {\"transaction\": {\"to\": \"0x…\", \"data\": \"0x…\"}, \"block\": \"latest\"} (transaction obrigatório; block uma tag ou um número); get_logs → {address (um ou uma lista), topics, fromBlock, toBlock}, no máximo 1000 blocos. Dizer claramente que não é o array params do JSON-RPC. Gerar a tabela a partir do tools/list evita que ela fique desatualizada.",
    },
  },
};

const has = (text, ...needles) => needles.every((n) => (n instanceof RegExp ? n.test(text) : text.includes(n)));

/** First MCP endpoint written in the answer (the Chain MCP the docs tell you to add). */
export function extractEndpoint(text) {
  return String(text).match(/https:\/\/[a-z0-9.-]+\/mcp\b/i)?.[0] ?? null;
}

export function extractChainId(text) {
  const m = String(text).match(/chain\s*id[^0-9]{0,40}(\d{3,7})/i);
  return m ? Number(m[1]) : null;
}

const isCall = (tx) => isAddress(tx?.to ?? "") && /^0x[0-9a-f]*$/i.test(tx?.data ?? "");

/**
 * The first fenced JSON example in the answer that looks like eth_call input.
 * `shape` is "mcp" for the tool's own {transaction, block}, or "json-rpc" for a raw {params: [call, block]} body.
 * `asGiven` is what the answer literally said to send; `input` is the Chain MCP tool input.
 */
export function extractEthCallExample(text) {
  for (const [, body] of String(text).matchAll(/```(?:json)?\s*\n([\s\S]*?)```/g)) {
    let value;
    try {
      value = JSON.parse(body);
    } catch {
      continue;
    }
    if (isCall(value?.transaction)) {
      const input = { transaction: { to: value.transaction.to, data: value.transaction.data }, block: value.block ?? "latest" };
      return { shape: "mcp", asGiven: input, input };
    }
    const params = value?.params;
    if (Array.isArray(params) && isCall(params[0])) {
      return { shape: "json-rpc", asGiven: { params }, input: { transaction: { to: params[0].to, data: params[0].data }, block: params[1] ?? "latest" } };
    }
    if (isCall(value)) return { shape: "json-rpc", asGiven: { params: [value] }, input: { transaction: { to: value.to, data: value.data }, block: "latest" } };
  }
  return null;
}

/**
 * `check(text, results)` returns { ok, note }. For gap steps ok means the gap is fixed this run.
 * `take(ctx, text, results)` keeps facts the build at the end will use.
 */
export const STEPS = [
  {
    id: "what-is-ai",
    gap: "G1",
    goal: { en: "Find out what ai.pharos.xyz is and where to start", pt: "Descobrir o que é o ai.pharos.xyz e por onde começar" },
    tool: "askQuestion",
    query: "What is ai.pharos.xyz and how do I get started with it?",
    check: (t) => ({ ok: /ai\.pharos\.xyz/i.test(t) && !CANT.test(t), note: CANT.test(t) ? "Says it can't find ai.pharos.xyz; falls back to Anvita Flow and the Chain MCP config." : "Explains ai.pharos.xyz." }),
  },
  {
    id: "connect-chain",
    goal: { en: "Connect an AI client to the Chain MCP", pt: "Conectar um cliente de IA ao Chain MCP" },
    tool: "askQuestion",
    query: "How do I connect the Pharos Chain MCP server to Claude or Cursor? What is the endpoint URL?",
    check: (t) => ({ ok: has(t, "https://mcp.pharos.xyz/mcp"), note: "Endpoint, Streamable HTTP, config JSON and the mcp-remote bridge for stdio clients." }),
    take: (ctx, t) => (ctx.endpoint = extractEndpoint(t)),
  },
  {
    id: "chain-tools",
    goal: { en: "See which tools the Chain MCP gives me", pt: "Ver quais ferramentas o Chain MCP oferece" },
    tool: "askQuestion",
    query: "Which tools does the Pharos Chain MCP expose?",
    check: (t) => ({ ok: has(t, "get_chain_info", "eth_call", "get_logs"), note: "Full tool list grouped by chain, accounts, contracts and broadcasting." }),
  },
  {
    id: "limits",
    goal: { en: "Know if I need a key and how fast I can call it", pt: "Saber se preciso de chave e quanto posso chamar" },
    tool: "askQuestion",
    query: "Does the Pharos Chain MCP need an API key, and what are its rate limits?",
    check: (t) => ({ ok: has(t, /\b120\b/), note: "No key; 120 requests per minute per IP." }),
  },
  {
    id: "docs-mcp-url",
    gap: "G2",
    goal: { en: "Add the Docs MCP itself to my client", pt: "Adicionar o próprio Docs MCP ao meu cliente" },
    tool: "askQuestion",
    query: "What is the URL of the Pharos Developer Docs MCP server?",
    check: (t) => ({
      ok: has(t, "docs.pharos.xyz/~gitbook/mcp"),
      note: has(t, "mcp.pharos.xyz/mcp") ? "Wrong: answered with the Chain MCP URL (https://mcp.pharos.xyz/mcp), not the Docs MCP." : "Does not give the Docs MCP URL.",
    }),
  },
  {
    id: "docs-mcp-exists",
    gap: "G2",
    goal: { en: "Double-check: is there an MCP for the docs at all?", pt: "Conferir: existe um MCP para a documentação?" },
    tool: "askQuestion",
    query: "Is there an MCP server for the Pharos documentation itself (GitBook MCP)?",
    check: (t) => ({ ok: has(t, "docs.pharos.xyz/~gitbook/mcp"), note: CANT.test(t) ? "Says no docs MCP is documented — while answering through it." : "Does not give the Docs MCP URL." }),
  },
  {
    id: "skill-engine",
    goal: { en: "Learn what SkillEngine is and how to set it up", pt: "Entender o que é o SkillEngine e como configurar" },
    tool: "askQuestion",
    query: "What is the Pharos Skill Engine (pharos-skill-engine) and how do I install it?",
    check: (t) => ({ ok: has(t, /foundry|forge|cast/i, /unzip|SKILL\.md|package/i), note: "Clear: a package of agent files driven through Foundry (cast/forge); keep the key in PRIVATE_KEY." }),
  },
  {
    id: "skill-download",
    gap: "G3",
    goal: { en: "Download the SkillEngine package", pt: "Baixar o pacote do SkillEngine" },
    tool: "askQuestion",
    query: "Where do I download the pharos-skill-engine-0.1.0.zip package?",
    check: (t) => ({ ok: /https?:\/\/(?!docs\.pharos\.xyz)\S*(\.zip|skill)/i.test(t) && !CANT.test(t), note: "No download link; the guide starts at unzip." }),
  },
  {
    id: "windows",
    gap: "G4",
    goal: { en: "Install Foundry on Windows (my machine)", pt: "Instalar o Foundry no Windows (minha máquina)" },
    tool: "askQuestion",
    query: "How do I install Foundry for the Pharos Skill Engine on Windows?",
    check: (t) => ({
      ok: !CANT.test(t) && /wsl|git bash/i.test(t),
      note: /getfoundry\.sh|book\.getfoundry/i.test(t) ? "No Windows steps; sends you to the external Foundry book." : "No Windows steps.",
    }),
  },
  {
    id: "network",
    goal: { en: "Get the mainnet chain ID, RPC and gas token", pt: "Pegar chain ID, RPC e token de gas da mainnet" },
    tool: "askQuestion",
    query: "What is the chain ID and RPC URL of Pharos Pacific Mainnet, and which token pays for gas?",
    check: (t) => ({ ok: has(t, "1672", "rpc.pharos.xyz", "PROS"), note: "Chain ID 1672, https://rpc.pharos.xyz, gas in PROS." }),
    take: (ctx, t) => (ctx.chainId = extractChainId(t) ?? (t.includes("1672") ? 1672 : null)),
  },
  {
    id: "faucet",
    gap: "G5",
    goal: { en: "Get testnet tokens to try a write safely", pt: "Pegar tokens de testnet para testar uma escrita com segurança" },
    tool: "askQuestion",
    query: "What is the faucet URL for Pharos Atlantic testnet PHRS?",
    check: (t) => ({ ok: /https?:\/\/\S*faucet/i.test(t), note: "Faucet is mentioned, no URL." }),
  },
  {
    id: "faucet-search",
    gap: "G5",
    goal: { en: "Search the docs for \"faucet\" directly", pt: "Buscar \"faucet\" direto na documentação" },
    tool: "searchDocumentation",
    query: "faucet",
    check: (_, results) => ({
      ok: results.some((r) => /faucet/i.test(`${r.title} ${r.link}`)),
      note: `${results.length} result(s): ${results.map((r) => r.title).join(", ") || "none"}; no faucet page.`,
    }),
  },
  {
    id: "get-logs",
    goal: { en: "Know the get_logs block range before scanning history", pt: "Saber o limite de blocos do get_logs antes de varrer histórico" },
    tool: "askQuestion",
    query: "What is the maximum block range for get_logs on the Pharos Chain MCP?",
    check: (t) => ({ ok: has(t, /1,?000/), note: "1000 blocks per call; page larger ranges." }),
  },
  {
    id: "eth-call",
    gap: "G7",
    goal: { en: "Learn the exact eth_call input so I can run one", pt: "Aprender a entrada exata do eth_call para rodar um" },
    tool: "askQuestion",
    query: "What arguments does the Chain MCP eth_call tool take? Give a JSON example.",
    check: (t) => {
      const ex = extractEthCallExample(t);
      if (!ex) return { ok: false, note: "No JSON example to run." };
      if (ex.shape === "json-rpc") return { ok: false, note: "Example is the raw JSON-RPC body (params array), not the MCP tool input; the tool rejects it as written." };
      return { ok: true, note: "Example uses the tool's own {transaction, block} input." };
    },
    take: (ctx, t) => (ctx.ethCallExample = extractEthCallExample(t)),
  },
  {
    id: "mcp-page-inputs",
    gap: "G7",
    goal: { en: "Open the Pharos MCP page to read the tool inputs myself", pt: "Abrir a página Pharos MCP para ler as entradas das ferramentas" },
    tool: "getPage",
    query: MCP_PAGE_URL,
    check: (t) => ({
      ok: /"transaction"\s*:/.test(t),
      note: /"transaction"\s*:/.test(t) ? "The page shows the eth_call input object." : "The page lists the tools and their JSON-RPC methods, but no tool shows its input arguments.",
    }),
  },
  {
    id: "registry",
    goal: { en: "Find a real contract to read: the official USDC", pt: "Achar um contrato real para ler: o USDC oficial" },
    tool: "getPage",
    query: TOKEN_REGISTRY_URL,
    check: (t) => {
      const usdc = extractPacificRegistry(t).find((h) => h.symbol === "USDC");
      return { ok: !!usdc, note: usdc ? `Pacific Mainnet USDC at ${usdc.address}.` : "USDC row not found in the Pacific section." };
    },
    take: (ctx, t) => (ctx.usdc = extractPacificRegistry(t).find((h) => h.symbol === "USDC")?.address ?? null),
  },
  {
    id: "arena",
    gap: "G6",
    goal: { en: "Find out how to submit what I built", pt: "Descobrir como enviar o que construí" },
    tool: "askQuestion",
    query: "How do I submit a build to the Pharos Agent Arena (Season of AI)?",
    check: (t) => ({ ok: /arena/i.test(t) && !CANT.test(t), note: CANT.test(t) ? "Agent Arena not found; redirects to publishing a Service Agent on Anvita Flow." : "Does not explain the Arena." }),
  },
];

export const stepById = (id) => STEPS.find((s) => s.id === id);

/** Runs one step against the Docs MCP. Returns the log entry and whatever facts it yields. */
export async function runStep(docsClient, step) {
  const started = Date.now();
  let text = "";
  let results = [];
  let sources = [];
  let found = true;
  if (step.tool === "askQuestion") {
    text = await askDocs(docsClient, step.query);
    ({ answer: text, sources, found } = parseAnswer(text));
  } else if (step.tool === "searchDocumentation") {
    results = await searchDocs(docsClient, step.query, 5);
    text = results.map((r) => `${r.title} — ${r.link}`).join("\n");
  } else {
    text = await getDocsPage(docsClient, step.query);
    sources = [{ title: text.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? step.query, url: step.query }];
  }
  const { ok, note } = step.check(text, results);
  const facts = {};
  step.take?.(facts, text, results);
  return {
    id: step.id,
    gap: step.gap ?? null,
    tool: step.tool,
    query: step.query,
    goal: step.goal,
    verdict: step.gap ? (ok ? "fixed" : "gap") : ok ? "helped" : "missed",
    note,
    answer: step.tool === "getPage" ? text.slice(0, 1500) : text,
    sources,
    results: results.map((r) => ({ title: r.title, link: r.link })),
    found,
    facts,
    ms: Date.now() - started,
  };
}

const ERC20 = parseAbi(["function symbol() view returns (string)", "function decimals() view returns (uint8)"]);

async function call(chainClient, to, functionName, block) {
  const data = encodeFunctionData({ abi: ERC20, functionName });
  const { result } = await callJson(chainClient, "eth_call", { transaction: { to, data }, block });
  return decodeFunctionResult({ abi: ERC20, functionName, data: result });
}

/** The end of the session: run what the docs taught, only with facts taken from the answers. */
export async function runBuild(chainClient, facts) {
  const out = [];
  const info = await callJson(chainClient, "get_chain_info", {});
  const block = Number(info.latestBlock);
  out.push({
    id: "chain-info",
    ok: facts.chainId == null || Number(info.chainId) === Number(facts.chainId),
    text: `get_chain_info on ${facts.endpoint ?? "?"}: chain ${info.chainId} (${info.nativeSymbol}), latest block ${block}. Docs said chain ID ${facts.chainId ?? "?"}.`,
    block,
  });
  if (facts.ethCallExample) {
    const ex = facts.ethCallExample;
    const { to, data } = ex.input.transaction;
    if (ex.shape === "json-rpc") {
      // Send it exactly as the docs wrote it first, so the log shows what a newcomer would hit.
      try {
        await callTool(chainClient, "eth_call", ex.asGiven);
        out.push({ id: "docs-example-as-given", ok: true, text: "The docs' eth_call example (JSON-RPC params shape) was accepted as written." });
      } catch (e) {
        const reason = /Input validation error/i.test(e.message) ? "Input validation error: transaction expected object" : e.message.split("\n")[0];
        out.push({ id: "docs-example-as-given", ok: false, text: `The docs' eth_call example sent as written ({"params": [...]}) was rejected by the tool: ${reason}.` });
      }
    }
    try {
      const { result } = JSON.parse(await callTool(chainClient, "eth_call", ex.input));
      const how = ex.shape === "json-rpc" ? "after moving it into {transaction, block}" : "as written";
      out.push({ id: "docs-example", ok: /^0x[0-9a-f]*$/i.test(result ?? ""), text: `The docs' eth_call example (to ${to}, data ${data}) ran ${how}: result ${result}${result && result !== "0x" ? ` (= ${BigInt(result)})` : ""}.` });
    } catch (e) {
      out.push({ id: "docs-example", ok: false, text: `The docs' eth_call example failed: ${e.message.split("\n")[0]}` });
    }
  } else {
    out.push({ id: "docs-example", ok: false, text: "No runnable eth_call example came back from the docs this run." });
  }
  if (facts.usdc) {
    const [symbol, decimals] = await Promise.all([call(chainClient, facts.usdc, "symbol", block), call(chainClient, facts.usdc, "decimals", block)]);
    out.push({ id: "usdc", ok: symbol === "USDC" && Number(decimals) === 6, text: `eth_call symbol() and decimals() on the registry USDC ${facts.usdc} at block ${block}: ${symbol}, ${decimals} decimals.` });
  }
  return out;
}

/**
 * askQuestion is answered by a language model, so one bad answer could be bad luck. With `repeat` > 1 every gap
 * question is asked again and the log keeps the count: "wrong 3 of 3" is a gap, not a fluke. The verdict is the
 * majority; the first answer stays the one shown.
 */
async function repeatGapStep(docsClient, step, entry, repeat) {
  const verdicts = [entry.verdict];
  for (let i = 1; i < repeat; i++) verdicts.push((await runStep(docsClient, step)).verdict);
  const gapRuns = verdicts.filter((v) => v === "gap").length;
  return { ...entry, verdict: gapRuns * 2 > verdicts.length ? "gap" : "fixed", consistency: { runs: verdicts.length, gapRuns } };
}

/** Whole session. `connectChain(url)` opens the Chain MCP at the URL the docs gave. */
export async function runOnboarding({ docsClient, connectChain, onStep = () => {}, steps = STEPS, repeat = 1, verify = true }) {
  const started = Date.now();
  const log = [];
  const facts = {};
  for (const step of steps) {
    let entry = await runStep(docsClient, step);
    if (step.gap && repeat > 1 && step.tool === "askQuestion") entry = await repeatGapStep(docsClient, step, entry, repeat);
    Object.assign(facts, Object.fromEntries(Object.entries(entry.facts).filter(([, v]) => v != null)));
    log.push(entry);
    onStep(entry, log.length, steps.length);
  }
  let build = [];
  let buildError = null;
  let fixChecks = null;
  if (facts.endpoint) {
    try {
      const chainClient = await connectChain(facts.endpoint);
      build = await runBuild(chainClient, facts);
      if (verify) fixChecks = await verifyFixes({ docsClient, chainClient, build });
      await chainClient.close?.().catch(() => {});
    } catch (e) {
      buildError = e.message;
    }
  } else buildError = "The docs never gave a Chain MCP endpoint, so there was nothing to connect to.";
  return { startedAt: new Date(started).toISOString(), ms: Date.now() - started, repeat, steps: log, facts, build, buildError, fixChecks, summary: summarize(log) };
}

// ── Every suggested fix, checked ─────────────────────────────────────────────────────────────────────────────────
// A fix that is itself wrong would be worse than the gap. Whatever a fix claims that the two MCP servers can confirm is
// confirmed live; what they cannot (a download link, a faucet, a web page) is labelled as such, never marked ✓.

const DOCS_TOOLS = ["searchDocumentation", "getPage", "askQuestion", "sendFeedback"];

/** "eth_call → {transaction: object (required), block}" from the server's own tools/list. */
export function describeInput(tool) {
  const props = tool?.inputSchema?.properties ?? {};
  const req = new Set(tool?.inputSchema?.required ?? []);
  const type = (v) => v.type ?? (v.anyOf ? v.anyOf.map((x) => x.type ?? (x.enum ? x.enum.join("|") : "?")).join(" | ") : "?");
  return `{${Object.entries(props).map(([k, v]) => `${k}: ${type(v)}${req.has(k) ? " (required)" : ""}`).join(", ")}}`;
}

export async function verifyFixes({ docsClient, chainClient, build = [] }) {
  const [{ tools: chainTools }, { tools: docsTools }] = await Promise.all([chainClient.listTools(), docsClient.listTools()]);
  const docsNames = docsTools.map((t) => t.name);
  const chainNames = chainTools.map((t) => t.name);
  const info = await callJson(chainClient, "get_chain_info", {}).catch(() => null);
  const byName = (n) => chainTools.find((t) => t.name === n);
  const asGiven = build.find((b) => b.id === "docs-example-as-given");
  const asTool = build.find((b) => b.id === "docs-example");
  const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
  const unverifiable = (why) => ({ checkable: false, why, checks: [] });
  return {
    G1: {
      checkable: true,
      checks: [
        { ok: chainNames.length > 0 && Number(info?.chainId) === 1672, text: `Chain MCP https://mcp.pharos.xyz/mcp answers: ${chainNames.length} tools, chain ${info?.chainId ?? "?"}.` },
        { ok: sameSet(docsNames, DOCS_TOOLS), text: `Developer Docs MCP https://docs.pharos.xyz/~gitbook/mcp answers: ${docsNames.length} tools (${docsNames.join(", ")}).` },
      ],
    },
    G2: {
      checkable: true,
      checks: [{ ok: sameSet(docsNames, DOCS_TOOLS), text: `tools/list on https://docs.pharos.xyz/~gitbook/mcp returns exactly the tools the fix names: ${docsNames.join(", ")}.` }],
    },
    G3: unverifiable("The download link is something only the Pharos team can publish."),
    G4: unverifiable("Installing Foundry on Windows is outside what either MCP server can check."),
    G5: unverifiable("The faucet URL is not exposed by either MCP server."),
    G6: unverifiable("The Agent Arena is a website; neither MCP server can confirm it."),
    G7: {
      checkable: true,
      // the fix written from the server's own schema, so it cannot drift from what the tool accepts
      inputs: ["eth_call", "estimate_gas", "get_logs", "get_balance", "get_storage_at"].filter(byName).map((n) => `${n} → ${describeInput(byName(n))}`),
      checks: [
        { ok: byName("eth_call")?.inputSchema?.properties?.transaction?.type === "object" && (byName("eth_call")?.inputSchema?.required ?? []).includes("transaction"), text: `The Chain MCP's own schema for eth_call: ${describeInput(byName("eth_call"))}.` },
        ...(asGiven ? [{ ok: !asGiven.ok, text: `The JSON-RPC shape the docs gave ({"params": [...]}) is rejected by the tool — sent this run.` }] : []),
        ...(asTool ? [{ ok: asTool.ok, text: `The shape the fix proposes ({"transaction": {to, data}, "block": "latest"}) runs — sent this run.` }] : []),
      ],
    },
  };
}

/** Per gap, across saved runs (oldest first): when it was first seen open and in how many runs it stayed open. */
export function gapHistory(sessions) {
  const runs = [...sessions].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  const out = {};
  for (const id of Object.keys(GAPS)) {
    const seen = runs.filter((r) => r.steps.some((s) => s.gap === id));
    const open = seen.filter((r) => r.summary.gapsOpen.includes(id));
    if (!seen.length) continue;
    out[id] = { runs: seen.length, open: open.length, firstSeen: seen[0].startedAt, lastSeen: seen.at(-1).startedAt, openNow: seen.at(-1).summary.gapsOpen.includes(id) };
  }
  return out;
}

export function summarize(log) {
  const open = [...new Set(log.filter((s) => s.verdict === "gap").map((s) => s.gap))];
  const fixed = [...new Set(log.filter((s) => s.verdict === "fixed").map((s) => s.gap))].filter((g) => !open.includes(g));
  return {
    steps: log.length,
    helped: log.filter((s) => s.verdict === "helped").length,
    missed: log.filter((s) => s.verdict === "missed").length,
    gapsOpen: open,
    gapsFixed: fixed,
  };
}

const VERDICT = {
  en: { helped: "HELPED", gap: "GAP", fixed: "FIXED", missed: "MISSED" },
  pt: { helped: "AJUDOU", gap: "FALHA", fixed: "CORRIGIDO", missed: "NÃO VEIO" },
};

const TXT = {
  en: {
    head: "DOCS MCP ONBOARDING — onto ai.pharos.xyz using only the Developer Docs MCP",
    step: (i, n) => `Step ${i}/${n}`,
    tried: "Tried", asked: "Asked", got: "Got", sources: "Sources",
    gapsHead: "GAPS — where the docs broke down, with the exact query and the fix",
    exact: "Exact query", fix: "Suggested fix", stillOpen: "still open on this run", fixedNow: "fixed on this run",
    times: (c) => `wrong ${c.gapRuns} of ${c.runs} times asked`, verified: "Fix checked live", notCheckable: "Fix not checkable from the MCPs", schema: "from the Chain MCP's own schema",
    builtHead: "WHAT I BUILT / RAN BY THE END — only with what the docs answered",
    tally: (s) => `${s.steps} steps · ${s.helped} helped · ${s.gapsOpen.length} gaps open${s.gapsFixed.length ? ` · ${s.gapsFixed.length} fixed` : ""}${s.missed ? ` · ${s.missed} missed` : ""}`,
  },
  pt: {
    head: "ONBOARDING PELO DOCS MCP — no ai.pharos.xyz usando só o Developer Docs MCP",
    step: (i, n) => `Passo ${i}/${n}`,
    tried: "Tentei", asked: "Perguntei", got: "Resposta", sources: "Fontes",
    gapsHead: "FALHAS — onde a documentação quebrou, com a pergunta exata e a correção",
    exact: "Pergunta exata", fix: "Correção sugerida", stillOpen: "ainda aberta nesta execução", fixedNow: "corrigida nesta execução",
    times: (c) => `errou ${c.gapRuns} de ${c.runs} vezes`, verified: "Correção conferida ao vivo", notCheckable: "Correção não verificável pelos MCPs", schema: "do próprio esquema do Chain MCP",
    builtHead: "O QUE CONSTRUÍ / RODEI NO FIM — só com o que a documentação respondeu",
    tally: (s) => `${s.steps} passos · ${s.helped} ajudaram · ${s.gapsOpen.length} falhas abertas${s.gapsFixed.length ? ` · ${s.gapsFixed.length} corrigidas` : ""}${s.missed ? ` · ${s.missed} não vieram` : ""}`,
  },
};

const indent = (s, pad = "    ") => String(s).trim().split("\n").map((l) => pad + l).join("\n");
const clip = (s, max) => (s.length > max ? s.slice(0, max).trimEnd() + " …" : s);

export function formatStep(entry, i, n, lang = "en", { full = false } = {}) {
  const t = TXT[lang];
  const lines = [
    `${t.step(i, n)}  [${VERDICT[lang][entry.verdict]}${entry.gap ? ` ${entry.gap}` : ""}]  ${entry.goal[lang]}`,
    `  ${t.asked} (${entry.tool}): ${entry.query}`,
    `  → ${entry.note}${entry.consistency ? `  (${t.times(entry.consistency)})` : ""}`,
  ];
  if (full) lines.push(indent(clip(entry.answer, 1200)));
  if (entry.sources.length) lines.push(`  ${t.sources}: ${entry.sources.slice(0, 3).map((s) => s.url).join("  ")}`);
  return lines.join("\n");
}

export function formatGaps(session, lang = "en") {
  const t = TXT[lang];
  const ids = [...new Set(session.steps.filter((s) => s.gap).map((s) => s.gap))];
  return ids
    .map((id) => {
      const g = GAPS[id];
      const steps = session.steps.filter((s) => s.gap === id);
      const open = steps.some((s) => s.verdict === "gap");
      return [
        `${id}  ${g.title[lang]}  (${open ? t.stillOpen : t.fixedNow})`,
        `  ${g.problem[lang]}`,
        ...steps.map((s) => `  ${t.exact} (${s.tool}): "${s.query}"\n    → ${s.note}${s.consistency ? `  (${t.times(s.consistency)})` : ""}`),
        `  ${t.fix}: ${g.fix[lang]}`,
        ...fixLines(session.fixChecks?.[id], t),
      ].join("\n");
    })
    .join("\n\n");
}

function fixLines(fc, t) {
  if (!fc) return [];
  if (!fc.checkable) return [`  ${t.notCheckable}: ${fc.why}`];
  return [`  ${t.verified}:`, ...fc.checks.map((c) => `    ${c.ok ? "✓" : "✗"} ${c.text}`), ...(fc.inputs?.length ? [`    ${t.schema}:`, ...fc.inputs.map((x) => `      ${x}`)] : [])];
}

export function formatSession(session, lang = "en", opts = {}) {
  const t = TXT[lang];
  const n = session.steps.length;
  const parts = [t.head, "", ...session.steps.map((s, i) => formatStep(s, i + 1, n, lang, opts) + "\n"), t.gapsHead, "", formatGaps(session, lang), "", t.builtHead, ""];
  for (const b of session.build) parts.push(`  ${b.ok ? "✓" : "✗"} ${b.text}`);
  if (session.buildError) parts.push(`  ✗ ${session.buildError}`);
  parts.push("", t.tally(session.summary));
  return parts.join("\n");
}

/** Markdown log for the repository: every query with the full answer. */
export function sessionMarkdown(session) {
  const md = [`# Docs MCP onboarding log — ${session.startedAt}`, "", `Only the Developer Docs MCP (\`https://docs.pharos.xyz/~gitbook/mcp\`) was used. ${TXT.en.tally(session.summary)}.`, ""];
  session.steps.forEach((s, i) => {
    md.push(`## ${i + 1}. ${s.goal.en} — ${VERDICT.en[s.verdict]}${s.gap ? ` (${s.gap})` : ""}`, "", `**${s.tool}:** \`${s.query}\``, "", `**Verdict:** ${s.note}${s.consistency ? ` (${TXT.en.times(s.consistency)})` : ""}`, "");
    md.push("<details><summary>Answer</summary>", "", s.answer.trim(), "", "</details>", "");
    if (s.sources.length) md.push("Sources: " + s.sources.map((x) => `[${x.title}](${x.url})`).join(" · "), "");
  });
  if (session.fixChecks) {
    md.push("## Suggested fixes, checked", "");
    for (const [id, fc] of Object.entries(session.fixChecks)) {
      md.push(`### ${id} · ${GAPS[id].title.en}`, "", `**Fix:** ${GAPS[id].fix.en}`, "");
      if (!fc.checkable) md.push(`_Not checkable from the MCPs:_ ${fc.why}`, "");
      for (const c of fc.checks) md.push(`- ${c.ok ? "✓" : "✗"} ${c.text}`);
      if (fc.inputs?.length) md.push("", "Tool inputs, from the Chain MCP's own schema:", "", "```", ...fc.inputs, "```");
      md.push("");
    }
  }
  md.push("## Built / ran by the end", "");
  for (const b of session.build) md.push(`- ${b.ok ? "✓" : "✗"} ${b.text}`);
  if (session.buildError) md.push(`- ✗ ${session.buildError}`);
  return md.join("\n") + "\n";
}
