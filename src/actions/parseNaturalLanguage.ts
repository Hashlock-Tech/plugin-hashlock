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

export const parseNaturalLanguageAction: Action = {
  name: "HASHLOCK_PARSE_NL",
  similes: ["PARSE_INTENT", "INTENT_FROM_TEXT"],
  description:
    "Parse a natural-language trade request into a structured Hashlock intent draft (no creation, no commit).",

  validate: async (_runtime, message) => {
    const t = (message.content?.text ?? "").toLowerCase();
    return /\b(parse|draft|structure)\b/.test(t) && /\bintent\b/.test(t);
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

    const text = message.content?.text ?? "";
    const draft = await client.parseNaturalLanguage(text);

    const summary = `Parsed: ${draft.action} ${draft.sell_amount} ${draft.sell_token} → ${draft.buy_token} (counterparty floor ${draft.counterparty.verification_tier}).`;
    callback?.({ text: summary, content: { success: true, draft } });
    return {
      success: true,
      text: summary,
      values: { parsed: true },
      data: { actionName: "HASHLOCK_PARSE_NL", draft },
    };
  },

  examples: [
    [
      {
        name: "user",
        content: { text: "Parse this into a Hashlock intent: swap 1 ETH for USDC, STANDARD+ only." },
      },
      {
        name: "assistant",
        content: {
          text: "Parsed: SWAP 1 ETH → USDC (counterparty floor STANDARD).",
          action: "HASHLOCK_PARSE_NL",
        },
      },
    ],
  ],
};
