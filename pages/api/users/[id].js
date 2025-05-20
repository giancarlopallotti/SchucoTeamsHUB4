// pages/api/users/[id].js
import db from "../../../db/db.js";

export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === "PUT") {
    const { name, surname, email, password, role, phone, address, note, status } = req.body;
    if (!name || !surname || !email || !role) {
      return res.status(400).json({ error: "Campi obbligatori mancanti" });
    }

    try {
      const stmt = db.prepare(`UPDATE users SET name = ?, surname = ?, email = ?, password = ?, role = ?, phone = ?, address = ?, note = ?, status = ? WHERE id = ?`);
      stmt.run(name, surname, email, password, role, phone, address, note, status, id);
      res.status(200).json({ id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Errore durante l'aggiornamento dell'utente" });
    }
  } else if (req.method === "DELETE") {
    try {
      db.prepare("DELETE FROM users WHERE id = ?").run(id);
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Errore durante la cancellazione dell'utente" });
    }
  } else {
    res.setHeader("Allow", ["PUT", "DELETE"]);
    res.status(405).end(`Metodo ${req.method} non permesso`);
  }
}
