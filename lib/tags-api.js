// /lib/tags-api.js

export async function getTags() {
  const res = await fetch("/api/tags");
  if (!res.ok) throw new Error("Errore caricamento tags");
  return await res.json();
}
