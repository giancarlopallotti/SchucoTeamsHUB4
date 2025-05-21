// /lib/users-api.js

export async function getUsers() {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("Errore caricamento utenti");
  return await res.json();
}

export async function saveUser(data) {
  const method = data.id ? "PUT" : "POST";
  const res = await fetch("/api/users", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Errore salvataggio utente");
  return await res.json();
}
