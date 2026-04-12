import type {
  Action,
  ActionResult,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
} from "@elizaos/core";
import { validateHashlockConfig, tierRank, type Tier } from "../environment";
import { HashlockClient } from "../client";

export const createIntentAction: Action = {
  name: "HASHLOCK_CREATE_INTENT",
  similes: ["CREATE_HASHLOCK_INTENT", "DRAFT_INTENT", "NEW_INTENT"],
  description:
    "Create a new Hashlock intent (SWAP/TRANSFER/BORROW/REPAY) with a counterparty attestation tier policy. Does not yet commit it on-chain.",

  validate: async (_runtime, message) => {
    const t = (message.content?.text ?? "").toLowerCase();
    return /\b(intent|swap|hashlock)\b/.test(t);
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined,
    _options: Record<string, unknown>,
    callback?: HandlerCallback,
  ): Promise<ActionResult> => {
    const cfg = await validateHashlockConfig(runtime);
    const client = new HashlockClient(cfg);

    // Parse intent shape from message via Hashlock NL endpoint.
    const text = message.content?.text ?? "";
    const parsed = await client.parseNaturalLanguage(text);

    // Enforce owner tier floor BEFORE constructing the intent.
    const requiredTier = cfg.HASHLOCK_MIN_COUNTERPARTY_TIER as Tier;
    const proposedTier = parsed.counterparty?.verification_tier ?? "NONE";
    if (tierRank(proposedTier) < tierRank(requiredTier)) {
      const reason = `counterparty tier ${proposedTier} < required ${requiredTier}`;
      callback?.({ text: `Refusing to create intent: ${reason}` });
      return {
        success: false,
        text: `Refused: ${reason}`,
        values: { tierGateBlocked: true },
        data: { actionName: "HASHLOCK_CREATE_INTENT", reason },
      };
    }

    const intent = await client.createIntent({
      ...parsed,
      operator: cfg.HASHLOCK_OPERATOR_ADDRESS,
    });

    const successText = `Created Hashlock intent ${intent.id} (tier ${intent.counterparty.verification_tier}).`;
    callback?.({
      text: successText,
      content: { success: true, intent },
    });

    return {
      success: true,
      text: successText,
      values: { intentCreated: true },
      data: {
        actionName: "HASHLOCK_CREATE_INTENT",
        intentId: intent.id,
        tier: intent.counterparty.verification_tier,
      },
    };
  },

  examples: [
    [
      {
        name: "user",
        content: {
          text: "Create a Hashlock intent: swap 1 ETH for USDC, only with STANDARD+ counterparties.",
        },
      },
      {
        name: "assistant",
        content: {
          text: "Created Hashlock intent intent_abc123 (tier STANDARD).",
          action: "HASHLOCK_CREATE_INTENT",
        },
      },
    ],
  ],
};
