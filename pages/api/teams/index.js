// Percorso: /pages/api/teams/index.js
// Scopo: Gestione API creazione/lista teams. Gestione membri e tags come CSV.
// Autore: ChatGPT su specifiche utente, v2 - 21/05/2025
// Ultima modifica: export default + gestione campi CSV membri/tag

const db = require("../../../db/db.js");

export default function handler(req, res) {
  if (req.method === "GET") {
    // Estrae tutti i team
    const teams = db.prepare("SELECT * FROM teams ORDER BY name").all();
    res.status(200).json(teams);
  } else if (req.method === "POST") {
    const { name, description, status, manager, members, tags } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Nome obbligatorio" });
    }
    // Conversione membri/tags in CSV se arrivano come array
    const membersCSV = Array.isArray(members) ? members.join(",") : (members || "");
    const tagsCSV = Array.isArray(tags) ? tags.join(",") : (tags || "");
    db.prepare(`
      INSERT INTO teams (name, description, status, manager, members, tags)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, description, status, manager, membersCSV, tagsCSV);
    res.status(201).json({ success: true });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end("Metodo non permesso");
  }
}
