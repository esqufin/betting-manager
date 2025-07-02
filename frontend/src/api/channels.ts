const API_BASE = "http://localhost:3001/channels";

export async function fetchChannels() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Fehler beim Laden der Kanäle");
  return res.json();
}
