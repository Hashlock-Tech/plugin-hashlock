import type { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import { validateHashlockConfig } from "../environment";

export const tierFloorProvider: Provider = {
  name: "HASHLOCK_TIER_FLOOR",
  description:
    "Exposes the agent's configured Hashlock counterparty-tier floor so the model can reason about who it will trade with.",

  get: async (runtime: IAgentRuntime, _message: Memory, _state: State) => {
    try {
      const cfg = await validateHashlockConfig(runtime);
      const text = `Hashlock counterparty floor: ${cfg.HASHLOCK_MIN_COUNTERPARTY_TIER}. Operator: ${cfg.HASHLOCK_OPERATOR_ADDRESS}.`;
      return {
        text,
        values: {
          hashlockTierFloor: cfg.HASHLOCK_MIN_COUNTERPARTY_TIER,
          hashlockOperator: cfg.HASHLOCK_OPERATOR_ADDRESS,
        },
        data: { source: "plugin-hashlock" },
      };
    } catch {
      return { text: "", values: {}, data: {} };
    }
  },
};
