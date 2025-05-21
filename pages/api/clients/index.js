// Percorso: /pages/api/clients/index.js
// Scopo: Lista/aggiunta clienti (essenziale per selezione progetti)
// Autore: ChatGPT, v2 - 21/05/2025

const db = require("../../../db/db.js");

export default function handler(req, res) {
  if (req.method === "GET") {
    const clients = db.prepare("SELECT * FROM clients ORDER BY name").all();
    res.status(200).json(clients);
  } else if (req.method === "POST") {
    const { name, surname, email, note } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Nome obbligatorio" });
    }
    db.prepare(
      `INSERT INTO clients (name, surname, email, note) VALUES (?, ?, ?, ?)`
    ).run(name, surname, email, note);
    res.status(201).json({ success: true });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end("Metodo non permesso");
  }
}
