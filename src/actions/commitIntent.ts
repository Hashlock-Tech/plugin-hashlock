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

export const commitIntentAction: Action = {
  name: "HASHLOCK_COMMIT_INTENT",
  similes: ["COMMIT_INTENT", "SETTLE_INTENT", "EXECUTE_HASHLOCK_INTENT"],
  description:
    "Commit a previously-created Hashlock intent on-chain. Requires the intent id (intent_...).",

  validate: async (_runtime, message) => {
    const t = message.content?.text ?? "";
    return /\bcommit\b/i.test(t) && INTENT_ID_REGEX.test(t);
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
        values: { committed: false },
        data: { actionName: "HASHLOCK_COMMIT_INTENT" },
      };
    }
    const intentId = match[1];
    const result = await client.commitIntent(intentId);

    const successText = `Committed ${intentId}: status ${result.status}, tx ${result.tx_hash}`;
    callback?.({
      text: successText,
      content: { success: true, ...result },
    });
    return {
      success: true,
      text: successText,
      values: { committed: true },
      data: {
        actionName: "HASHLOCK_COMMIT_INTENT",
        intentId,
        txHash: result.tx_hash,
        status: result.status,
      },
    };
  },

  examples: [
    [
      {
        name: "user",
        content: { text: "Commit intent_abc123 on-chain." },
      },
      {
        name: "assistant",
        content: {
          text: "Committed intent_abc123: status PENDING, tx 0x...",
          action: "HASHLOCK_COMMIT_INTENT",
        },
      },
    ],
  ],
};
