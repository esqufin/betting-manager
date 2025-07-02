// /frontend/src/api/bets.ts

const API_BASE = "http://localhost:3001/api/bets";

export async function fetchBets() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Fehler beim Laden der Wettscheine");
  return res.json();
}

export async function createBet(bet: Omit<any, "id">) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bet),
  });
  if (!res.ok) throw new Error("Fehler beim Anlegen des Wettscheins");
  return res.json();
}

export async function updateBet(bet: any) {
  const res = await fetch(`${API_BASE}/${bet.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bet),
  });
  if (!res.ok) throw new Error("Fehler beim Bearbeiten des Wettscheins");
  return res.json();
}

export async function deleteBet(id: number) {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Fehler beim Löschen des Wettscheins");
}
