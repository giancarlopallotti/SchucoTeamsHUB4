// /pages/api/users/index.js
const db = require("../../../db/db.js");
const { parse } = require("cookie");

module.exports = function handler(req, res) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;
  if (!token) return res.status(401).json({ error: "Non autorizzato" });

  if (req.method === "GET") {
    const users = db.prepare("SELECT * FROM users").all();
    res.status(200).json(users);
  } else if (req.method === "POST") {
    const { name, surname, email, password, role, phone, address, note, status } = req.body;
    if (!name || !surname || !email || !password || !role) {
      return res.status(400).json({ error: "Dati obbligatori mancanti" });
    }
    try {
      const stmt = db.prepare(`INSERT INTO users (name, surname, email, password, role, phone, address, note, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`);
      const result = stmt.run(name, surname, email, password, role, phone, address, note, status);
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Errore durante la creazione dell'utente" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Metodo ${req.method} non permesso`);
  }
};

