// src/types/betting.ts
// src/types/betting.ts
export type Bet = {
  id: number;
  date: string;
  channelId: number;
  match: string;
  stake: number;
  odds: number;
  betType: string;
  result: number;
  currency: string;
  kind: string;
  multiEntries?: { odds: number }[]; // optional, nur für Multi-Bets befüllt
};

export type Channel = { id: number; name: string; type: "Provider" | "Bettor" };
