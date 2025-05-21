// Percorso: /pages/api/users/index.js

const db = require("../../../db/db.js");

export default function handler(req, res) {
  if (req.method === "GET") {
    // Restituisce tutti gli utenti ordinati
    const users = db.prepare("SELECT * FROM users ORDER BY name, surname").all();
    res.status(200).json(users);
  } else if (req.method === "POST") {
    const { name, surname, email, password, phone, address, note, role, status, tags } = req.body;
    if (!name || !surname || !email || !password) {
      return res.status(400).json({ error: "Campi obbligatori mancanti" });
    }
    db.prepare(`
      INSERT INTO users (name, surname, email, password, phone, address, note, role, status, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, surname, email, password, phone, address, note, role, status, tags);
    res.status(201).json({ success: true });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end("Metodo non permesso");
  }
}
