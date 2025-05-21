// Percorso: /pages/api/teams/[id].js
// Scopo: Gestione dettaglio/aggiorna/cancella team. Gestione membri e tags come CSV.
// Autore: ChatGPT su specifiche utente, v2 - 21/05/2025

const db = require("../../../db/db.js");

export default function handler(req, res) {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "ID mancante" });

  if (req.method === "GET") {
    const team = db.prepare("SELECT * FROM teams WHERE id = ?").get(id);
    if (!team) return res.status(404).json({ error: "Team non trovato" });
    res.status(200).json(team);
  } else if (req.method === "PUT") {
    const { name, description, status, manager, members, tags } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Nome obbligatorio" });
    }
    // Conversione membri/tags in CSV se arrivano come array
    const membersCSV = Array.isArray(members) ? members.join(",") : (members || "");
    const tagsCSV = Array.isArray(tags) ? tags.join(",") : (tags || "");
    db.prepare(`
      UPDATE teams SET
        name = ?, description = ?, status = ?, manager = ?, members = ?, tags = ?
      WHERE id = ?
    `).run(name, description, status, manager, membersCSV, tagsCSV, id);
    res.status(200).json({ success: true });
  } else if (req.method === "DELETE") {
    db.prepare("DELETE FROM teams WHERE id = ?").run(id);
    res.status(200).json({ success: true });
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end("Metodo non permesso");
  }
}
