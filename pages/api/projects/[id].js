// Percorso: /pages/api/projects/[id].js
// Scopo: Dettaglio/aggiorna/cancella progetto. Gestione clienti come CSV.
// Autore: ChatGPT, v2 - 21/05/2025

const db = require("../../../db/db.js");

export default function handler(req, res) {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "ID mancante" });

  if (req.method === "GET") {
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
    if (!project) return res.status(404).json({ error: "Progetto non trovato" });
    res.status(200).json(project);
  } else if (req.method === "PUT") {
    const { title, description, status, priority, deadline, note, clients } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Titolo obbligatorio" });
    }
    const clientsCSV = Array.isArray(clients) ? clients.join(",") : (clients || "");
    db.prepare(`
      UPDATE projects SET
        title = ?, description = ?, status = ?, priority = ?, deadline = ?, note = ?, clients = ?
      WHERE id = ?
    `).run(title, description, status, priority, deadline, note, clientsCSV, id);
    res.status(200).json({ success: true });
  } else if (req.method === "DELETE") {
    db.prepare("DELETE FROM projects WHERE id = ?").run(id);
    res.status(200).json({ success: true });
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end("Metodo non permesso");
  }
}
