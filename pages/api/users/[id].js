// Percorso: /pages/api/users/[id].js

const db = require("../../../db/db.js");

export default function handler(req, res) {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "ID mancante" });

  if (req.method === "GET") {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) return res.status(404).json({ error: "Utente non trovato" });
    res.status(200).json(user);
  } else if (req.method === "PUT") {
    const { name, surname, email, password, phone, address, note, role, status, tags } = req.body;
    // Password aggiornata solo se valorizzata
    if (password && password.trim().length > 0) {
      db.prepare(`
        UPDATE users SET
          name = ?, surname = ?, email = ?, password = ?, phone = ?, address = ?, note = ?, role = ?, status = ?, tags = ?
        WHERE id = ?
      `).run(name, surname, email, password, phone, address, note, role, status, tags, id);
    } else {
      db.prepare(`
        UPDATE users SET
          name = ?, surname = ?, email = ?, phone = ?, address = ?, note = ?, role = ?, status = ?, tags = ?
        WHERE id = ?
      `).run(name, surname, email, phone, address, note, role, status, tags, id);
    }
    res.status(200).json({ success: true });
  } else if (req.method === "DELETE") {
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    res.status(200).json({ success: true });
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end("Metodo non permesso");
  }
}
