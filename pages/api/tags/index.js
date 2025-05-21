// /pages/api/tags/index.js v3 - 20/05/2025
const db = require("../../../db/db.js");

export default function handler(req, res) {
  if (req.method === "GET") {
    // Restituisce tutti i tag ordinati per name
    const tags = db.prepare("SELECT id, name FROM tags ORDER BY name ASC").all();
    res.status(200).json(tags);
  }
  else if (req.method === "POST") {
    // Inserimento nuovo tag
    const { name } = req.body;
    if (!name || typeof name !== "string" || name !== name.toUpperCase()) {
      return res.status(400).json({ error: "Il TAG deve essere in MAIUSCOLO" });
    }
    // Verifica che non esista già (case-insensitive)
    const existing = db.prepare("SELECT * FROM tags WHERE UPPER(name) = ?").get(name);
    if (existing) {
      return res.status(409).json({ error: "TAG già esistente" });
    }
    try {
      const stmt = db.prepare("INSERT INTO tags (name) VALUES (?)");
      const info = stmt.run(name);
      const newTag = db.prepare("SELECT id, name FROM tags WHERE id = ?").get(info.lastInsertRowid);
      return res.status(201).json(newTag);
    } catch (err) {
      return res.status(500).json({ error: "Errore inserimento TAG", details: err.message });
    }
  }
  else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end("Metodo non permesso");
  }
}
