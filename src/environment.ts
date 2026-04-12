import { z } from "zod";
import type { IAgentRuntime } from "@elizaos/core";

export const TIER_ORDER = ["NONE", "BASIC", "STANDARD", "ENHANCED", "INSTITUTIONAL"] as const;
export type Tier = (typeof TIER_ORDER)[number];

export const tierRank = (tier: Tier): number => TIER_ORDER.indexOf(tier);

export const hashlockEnvSchema = z.object({
  HASHLOCK_API_URL: z.string().url().default("https://api.hashlock.xyz"),
  HASHLOCK_API_KEY: z.string().min(1, "HASHLOCK_API_KEY is required"),
  HASHLOCK_MIN_COUNTERPARTY_TIER: z
    .enum(TIER_ORDER)
    .default("STANDARD"),
  HASHLOCK_OPERATOR_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "HASHLOCK_OPERATOR_ADDRESS must be a 0x EVM address"),
});

export type HashlockConfig = z.infer<typeof hashlockEnvSchema>;

export async function validateHashlockConfig(runtime: IAgentRuntime): Promise<HashlockConfig> {
  const raw = {
    HASHLOCK_API_URL:
      runtime.getSetting("HASHLOCK_API_URL") ?? process.env.HASHLOCK_API_URL,
    HASHLOCK_API_KEY:
      runtime.getSetting("HASHLOCK_API_KEY") ?? process.env.HASHLOCK_API_KEY,
    HASHLOCK_MIN_COUNTERPARTY_TIER:
      runtime.getSetting("HASHLOCK_MIN_COUNTERPARTY_TIER") ??
      process.env.HASHLOCK_MIN_COUNTERPARTY_TIER,
    HASHLOCK_OPERATOR_ADDRESS:
      runtime.getSetting("HASHLOCK_OPERATOR_ADDRESS") ??
      process.env.HASHLOCK_OPERATOR_ADDRESS,
  };
  return hashlockEnvSchema.parse(raw);
}
