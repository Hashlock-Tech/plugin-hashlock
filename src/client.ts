import type { HashlockConfig, Tier } from "./environment";

export interface CounterpartyAttestation {
  principal_type: "HUMAN" | "AGENT" | "INSTITUTION";
  verification_tier: Tier;
  blind_id: string;
}

export interface Intent {
  id?: string;
  operator: string;
  action: "SWAP" | "TRANSFER" | "BORROW" | "REPAY";
  sell_token: string;
  buy_token: string;
  sell_amount: string;
  min_buy_amount: string;
  counterparty: CounterpartyAttestation;
  expiry: number;
}

export interface CommitResult {
  intent_id: string;
  tx_hash: string;
  status: "PENDING" | "FILLED" | "EXPIRED" | "REVERTED";
}

export class HashlockClient {
  constructor(private readonly cfg: HashlockConfig) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.cfg.HASHLOCK_API_URL}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.cfg.HASHLOCK_API_KEY}`,
        ...(init.headers ?? {}),
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Hashlock API ${res.status} ${res.statusText}: ${body}`);
    }
    return (await res.json()) as T;
  }

  createIntent(intent: Omit<Intent, "id">): Promise<Intent> {
    return this.request<Intent>("/v1/intents", {
      method: "POST",
      body: JSON.stringify(intent),
    });
  }

  commitIntent(intentId: string): Promise<CommitResult> {
    return this.request<CommitResult>(`/v1/intents/${intentId}/commit`, {
      method: "POST",
    });
  }

  explainIntent(intentId: string): Promise<{ summary: string; intent: Intent }> {
    return this.request(`/v1/intents/${intentId}/explain`);
  }

  parseNaturalLanguage(text: string): Promise<Omit<Intent, "id" | "operator">> {
    return this.request("/v1/intents/parse", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  }

  validateIntent(intent: Intent): Promise<{ valid: boolean; reasons: string[] }> {
    return this.request("/v1/intents/validate", {
      method: "POST",
      body: JSON.stringify(intent),
    });
  }
}
