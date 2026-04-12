import type { Plugin, IAgentRuntime } from "@elizaos/core";
import { createIntentAction } from "./actions/createIntent";
import { commitIntentAction } from "./actions/commitIntent";
import { explainIntentAction } from "./actions/explainIntent";
import { parseNaturalLanguageAction } from "./actions/parseNaturalLanguage";
import { tierFloorProvider } from "./providers/tierFloor";
import { validateHashlockConfig } from "./environment";

export const hashlockPlugin: Plugin = {
  name: "hashlock",
  description:
    "Hashlock intent protocol for agent-native trading with counterparty attestation tiers (NONE → INSTITUTIONAL).",
  init: async (_config: Record<string, string>, runtime: IAgentRuntime) => {
    await validateHashlockConfig(runtime);
  },
  actions: [
    createIntentAction,
    commitIntentAction,
    explainIntentAction,
    parseNaturalLanguageAction,
  ],
  providers: [tierFloorProvider],
  evaluators: [],
  services: [],
};

export default hashlockPlugin;
export { validateHashlockConfig } from "./environment";
export { HashlockClient } from "./client";
