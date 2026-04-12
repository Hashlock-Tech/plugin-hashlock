# @hashlock/plugin-hashlock

ElizaOS plugin for **Hashlock** — an intent protocol for agent-native trading where every intent carries a structured counterparty attestation with a verification tier (NONE → BASIC → STANDARD → ENHANCED → INSTITUTIONAL).

## Why this plugin exists

As ElizaOS agents start running their own smart accounts and making trades, the owner-side question shifts from *"did the agent spend too much?"* to *"who did the agent trade with?"*. Hashlock issues that second answer as a protocol-level attestation. This plugin lets an Eliza agent:

1. Parse a natural-language trade request into a structured Hashlock intent.
2. Refuse to create the intent if the proposed counterparty's tier is below the agent's owner-set floor.
3. Commit the intent on-chain through the Hashlock settlement contract.
4. Explain a previously-created intent in plain English.

The tier-floor check happens **before** the intent is signed, so the owner's policy is enforced at the wallet layer, not in app code.

## Install

```bash
elizaos plugins add @hashlock/plugin-hashlock
```

Or in `package.json`:

```json
{
  "dependencies": {
    "@hashlock/plugin-hashlock": "^0.1.0"
  }
}
```

Then add to your character file:

```json
{
  "plugins": ["@hashlock/plugin-hashlock"]
}
```

## Configuration

| Variable | Required | Default | Notes |
|---|---|---|---|
| `HASHLOCK_API_URL` | no | `https://api.hashlock.xyz` | Hashlock API base URL |
| `HASHLOCK_API_KEY` | **yes** | — | Operator API key (sensitive) |
| `HASHLOCK_OPERATOR_ADDRESS` | **yes** | — | EVM address the agent signs intents from |
| `HASHLOCK_MIN_COUNTERPARTY_TIER` | no | `STANDARD` | One of `NONE` / `BASIC` / `STANDARD` / `ENHANCED` / `INSTITUTIONAL` |

## Actions

| Action | Trigger | What it does |
|---|---|---|
| `HASHLOCK_PARSE_NL` | "parse this intent: ..." | Returns a structured draft, no creation |
| `HASHLOCK_CREATE_INTENT` | "create a hashlock intent" | Creates an intent if counterparty tier ≥ owner floor |
| `HASHLOCK_COMMIT_INTENT` | "commit intent_..." | Settles the intent on-chain |
| `HASHLOCK_EXPLAIN_INTENT` | "explain intent_..." | Returns a human summary |

## Provider

`HASHLOCK_TIER_FLOOR` — exposes the agent's configured tier floor and operator address to the model so it can reason about who it will trade with.

## Architecture

```
character → eliza runtime
              ↓
         hashlockPlugin
              ↓
   ┌─────────┴──────────┐
actions             provider
   ↓                    ↓
HashlockClient    tier-floor context
   ↓
api.hashlock.xyz
   ↓
on-chain settlement contract
```

## Tier policy enforcement

The `HASHLOCK_CREATE_INTENT` action compares the proposed counterparty's tier against the floor in `HASHLOCK_MIN_COUNTERPARTY_TIER` *before* calling the API:

- `STANDARD` proposed, `STANDARD` floor → **allowed**
- `BASIC` proposed, `STANDARD` floor → **refused** with reason `counterparty tier BASIC < required STANDARD`

This is the same comparison logic used in the Safe Guard reference implementation at <https://github.com/BarisSozen/safe-hashlock-demo>.

## Development

```bash
pnpm install
pnpm build
pnpm test
```

## License

MIT — see [LICENSE](./LICENSE).

## Links

- Hashlock: <https://hashlock.xyz>
- Safe Guard reference: <https://github.com/BarisSozen/safe-hashlock-demo>
- ElizaOS: <https://elizaos.ai>
