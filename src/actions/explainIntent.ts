import type {
  Action,
  ActionResult,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
} from "@elizaos/core";
import { validateHashlockConfig } from "../environment";
import { HashlockClient } from "../client";

const INTENT_ID_REGEX = /(intent_[a-zA-Z0-9]+)/;

export const explainIntentAction: Action = {
  name: "HASHLOCK_EXPLAIN_INTENT",
  similes: ["EXPLAIN_INTENT", "DESCRIBE_INTENT", "WHAT_IS_INTENT"],
  description: "Return a human-readable summary of an existing Hashlock intent by id.",

  validate: async (_runtime, message) => {
    const t = message.content?.text ?? "";
    return /\b(explain|describe|what)\b/i.test(t) && INTENT_ID_REGEX.test(t);
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

    const match = (message.content?.text ?? "").match(INTENT_ID_REGEX);
    if (!match) {
      callback?.({ text: "No intent id found in message." });
      return {
        success: false,
        text: "Missing intent id",
        values: {},
        data: { actionName: "HASHLOCK_EXPLAIN_INTENT" },
      };
    }
    const intentId = match[1];
    const result = await client.explainIntent(intentId);

    callback?.({ text: result.summary, content: { success: true, intent: result.intent } });
    return {
      success: true,
      text: result.summary,
      values: { explained: true },
      data: {
        actionName: "HASHLOCK_EXPLAIN_INTENT",
        intentId,
        tier: result.intent.counterparty.verification_tier,
      },
    };
  },

  examples: [
    [
      { name: "user", content: { text: "Explain intent_abc123." } },
      {
        name: "assistant",
        content: {
          text: "Intent intent_abc123 swaps 1 ETH for 3000 USDC, only with STANDARD-tier counterparties.",
          action: "HASHLOCK_EXPLAIN_INTENT",
        },
      },
    ],
  ],
};
