// Percorso: /pages/api/projects/index.js
// Scopo: Lista/creazione progetti. Gestione clienti come CSV.
// Autore: ChatGPT, v2 - 21/05/2025

const db = require("../../../db/db.js");

export default function handler(req, res) {
  if (req.method === "GET") {
    // Estrae tutti i progetti
    const projects = db.prepare("SELECT * FROM projects ORDER BY created_at DESC").all();
    res.status(200).json(projects);
  } else if (req.method === "POST") {
    const { title, description, status, priority, deadline, note, clients } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Titolo obbligatorio" });
    }
    // Gestione clienti CSV
    const clientsCSV = Array.isArray(clients) ? clients.join(",") : (clients || "");
    db.prepare(`
      INSERT INTO projects (title, description, status, priority, deadline, note, clients)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(title, description, status, priority, deadline, note, clientsCSV);
    res.status(201).json({ success: true });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end("Metodo non permesso");
  }
}
