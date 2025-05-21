// /lib/teams-api.js

export async function getTeams() {
  const res = await fetch("/api/teams");
  if (!res.ok) throw new Error("Errore caricamento team");
  return await res.json();
}
