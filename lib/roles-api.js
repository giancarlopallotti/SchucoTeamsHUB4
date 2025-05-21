// /lib/roles-api.js

export async function getRoles() {
  const res = await fetch("/api/roles");
  if (!res.ok) throw new Error("Errore caricamento ruoli");
  return await res.json();
}
