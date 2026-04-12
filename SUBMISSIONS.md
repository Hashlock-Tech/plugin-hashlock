# Bucket 1 — Frameworks where agents live

Five distinct submission targets. Each block has: **verified URL**, what to do, and the exact "user clicks Submit" step. No guesses — every URL was opened in the browser before being written down.

---

## 1. ElizaOS Plugin Registry

**Verified URLs**
- Plugin registry repo: https://github.com/elizaos-plugins/registry
- Submission file (the only file you edit): https://github.com/elizaos-plugins/registry/blob/main/index.json
- Reference plugin (template I copied): https://github.com/elizaos-plugins/plugin-evm

**What I built for you**
- `outputs/plugin-hashlock/` — full plugin scaffold with package.json (`agentConfig` block), `src/index.ts` (Plugin export), 4 actions (`HASHLOCK_CREATE_INTENT`, `HASHLOCK_COMMIT_INTENT`, `HASHLOCK_EXPLAIN_INTENT`, `HASHLOCK_PARSE_NL`), 1 provider (`HASHLOCK_TIER_FLOOR`), zod environment validation, README.

**What you do (≈10 minutes)**
1. Create a public GitHub repo: `Hashlock-Tech/plugin-hashlock`. README/license/.gitignore: skip — already in scaffold.
2. From `outputs/plugin-hashlock/`:
   ```
   git init
   git add .
   git commit -m "Initial: @hashlock/plugin-hashlock"
   git branch -M main
   git remote add origin git@github.com:Hashlock-Tech/plugin-hashlock.git
   git push -u origin main
   ```
3. On the new repo's GitHub page → ⚙ Settings → About → add topic `elizaos-plugins` (the registry's auto-review workflow checks for this exact topic).
4. Drop a `logo.png` (400×400) and `banner.png` (1280×640) into `images/` and push. Without these the auto-review fails.
5. Open https://github.com/elizaos-plugins/registry, click **Fork**.
6. In your fork, edit `index.json` only — add **one** line in alphabetical order:
   ```json
   "@hashlock/plugin-hashlock": "github:Hashlock-Tech/plugin-hashlock",
   ```
7. Commit, then click **Compare & pull request** → title `add @hashlock/plugin-hashlock` → submit. The Claude Code review workflow runs automatically; if it passes, a maintainer merges.

---

## 2. MCP Registry (official, modelcontextprotocol/registry)

**Verified URLs**
- Registry repo: https://github.com/modelcontextprotocol/registry
- API status: v0.1 frozen since 2025-10-24, preview release
- Maintainers (per repo README): Adam Jones (Anthropic), Tadas Antanavicius (PulseMCP), Toby Padilla (GitHub), Radoslav Dimitrov (Stacklok)
- Discord channel for submissions: `#registry-dev` (modelcontextprotocol.io/community/communication)

**What you do (≈15 minutes)**
1. You already have a Hashlock MCP server (the one Cowork loaded for me — `mcp__hashlock-intent__*`). It needs to be on a public GitHub repo. If it isn't, push it to `BarisSozen/hashlock-mcp-server`.
2. Build the publisher CLI from a checkout of the registry repo (one-time):
   ```
   git clone https://github.com/modelcontextprotocol/registry.git
   cd registry
   make publisher
   ```
3. In the Hashlock MCP repo, create `server.json` with namespace `io.github.barissozen/hashlock-intent` (the namespace authentication requires you to be logged in as the GitHub owner). Minimal shape:
   ```json
   {
     "name": "io.github.barissozen/hashlock-intent",
     "description": "Hashlock intent protocol — create/commit/explain intents with counterparty attestation tiers",
     "repository": { "url": "https://github.com/BarisSozen/hashlock-mcp-server", "source": "github" },
     "version_detail": { "version": "0.1.0" }
   }
   ```
4. Run from the Hashlock MCP repo root:
   ```
   /path/to/registry/bin/mcp-publisher login github
   /path/to/registry/bin/mcp-publisher publish
   ```
   GitHub OAuth opens in your browser → authorize → done. Listing appears at `https://registry.modelcontextprotocol.io/v0/servers?search=hashlock`.

---

## 3. Virtuals Protocol — Agent Commerce Protocol (ACP)

**Verified URLs**
- Org: https://github.com/Virtual-Protocol
- Core repo: https://github.com/Virtual-Protocol/agent-commerce-protocol (Solidity, MIT, ACPRouter + AccountManager / JobManager / MemoManager / PaymentManager)
- SDKs: https://github.com/Virtual-Protocol/acp-node, https://github.com/Virtual-Protocol/acp-python
- ACP x402 server (this is the killer overlap): https://github.com/Virtual-Protocol/acp-x402-server

**Why this fits**
ACP breaks accounts → jobs → memos. Hashlock attestation tiers belong as a memo type: an `ATTESTATION` memo issued at job creation that PaymentManager checks before releasing escrow. That gives ACP the "who is this counterparty agent?" answer it currently doesn't have.

**What you do (≈10 minutes)**
1. Open https://github.com/Virtual-Protocol/agent-commerce-protocol/issues/new/choose. If the New Issue button is missing, fall back to the Discussions tab.
2. Title: `Proposal: Hashlock attestation memo type for counterparty tier gating in PaymentManager`
3. Body — copy from the block in section 6 below.
4. Submit. Tag nobody — the maintainers actively triage their own issues. If 5 business days pass with no reply, post the same proposal as a Discussion in the `acp-node` repo (which has more weekly traffic).

---

## 4. LangChain — `langchain-hashlock` Python integration package

**Verified URLs**
- LangChain monorepo: https://github.com/langchain-ai/langchain
- LangChain docs (current): https://docs.langchain.com/oss/python/langchain/overview
- Tool authoring pattern: a plain Python function decorated with `@tool` from `langchain_core.tools`

**Why it's not a "submission" exactly**
LangChain's integration model is: publish your own PyPI package named `langchain-<thing>`, then optionally open a docs PR pointing at it. There's no gatekeeping registry.

**What you do (≈30 minutes — separate session, not in this batch)**
1. Skeleton:
   ```
   pip install langchain-core
   mkdir langchain-hashlock && cd langchain-hashlock
   ```
2. Single file `langchain_hashlock/tools.py`:
   ```python
   from langchain_core.tools import tool
   from .client import HashlockClient

   @tool
   def create_hashlock_intent(text: str) -> dict:
       """Create a Hashlock intent from a natural-language trade request, enforcing the operator's tier floor."""
       return HashlockClient.from_env().parse_and_create(text)
   ```
3. `pyproject.toml` with `name = "langchain-hashlock"`, publish to PyPI: `python -m build && twine upload dist/*`.
4. Docs PR (optional, weeks later): add `docs/integrations/tools/hashlock.ipynb` to `langchain-ai/langchain` showing a 5-cell quickstart.

This one is **not** in the immediate batch — it's the next deliverable after the Eliza plugin lands and people start asking "where's the LangChain version".

---

## 5. Vercel AI SDK — `@ai-sdk/hashlock` (or community provider)

**Verified URLs**
- Vercel AI SDK: https://github.com/vercel/ai
- Provider authoring guide: https://ai-sdk.dev/docs/ai-sdk-providers/community-providers/custom-providers

**Why mention it now**
Same shape as LangChain: publish a npm package, register tools via `tool({ description, parameters, execute })`. No registry application — just `npm publish` then PR docs.

**Defer**: same reason as LangChain. Don't fan out before Eliza lands.

---

## 6. Body for the ACP issue (section 3 above)

Copy this verbatim into the issue body, after replacing `<REPO>` with `https://github.com/BarisSozen/safe-hashlock-demo`:

> Hi ACP team,
>
> I'm Barış, founder of Hashlock — a counterparty-attestation layer for agent trades. Every Hashlock intent carries a structured attestation: principal type (`HUMAN`/`AGENT`/`INSTITUTION`), verification tier (`NONE`→`INSTITUTIONAL`), blind id. Today this is verified off-chain by solvers; the agent's wallet has no native lever to refuse to settle with a counterparty below a tier floor.
>
> Looking at ACPRouter v2, I think attestation fits cleanly as a **memo type** — `MemoType.ATTESTATION` — emitted by AccountManager at job creation and read by PaymentManager before releasing escrow. The gating logic is ~15 lines of comparison code and I've already shipped it as a Safe Guard reference: <REPO>. Two scenarios, same wallet, same policy: STANDARD counterparty allowed, BASIC counterparty reverts.
>
> Two questions, async — that's all I'm asking:
>
> 1. Is `MemoType.ATTESTATION` the right shape for this in ACPv2, or would you rather see it as a separate `IAttestationManager` module sitting next to PaymentManager?
> 2. If the shape is right, would you be open to a draft PR against `agent-commerce-protocol` adding the memo type + a Hashlock-specific resolver, for you to iterate on?
>
> A "not yet" or "different shape — here's what we'd want" reply is just as useful as a yes. No call needed; I'd rather ship code than schedule.
>
> Thanks,
> Barış Sözen
> https://hashlock.xyz

---

## What I am NOT doing for you and why

- **Pushing to your GitHub.** No credential — and force-pushing on your behalf is the same risk that bit us with the `outreach/` folder leak. You run the `git push` yourself.
- **Logging into your Anthropic / Coinbase / Virtuals accounts.** OAuth and account creation are explicit-permission actions and have to be your click.
- **Filing the actual PRs/issues.** I drafted the body and verified the URL exists; you click **Submit** so the action chain is yours.

## Order of operations

Do them in this order — the Eliza plugin is the highest-leverage one because it's a real published artifact, not just an intro:

1. **Eliza plugin** (section 1) — repo + push + registry PR. ~10 min after the images are ready.
2. **MCP Registry** (section 2) — only after the MCP server repo is public. ~15 min.
3. **Virtuals ACP issue** (section 3) — purely an issue post. ~3 min.
4. **LangChain / Vercel** (sections 4-5) — defer to the next session.
