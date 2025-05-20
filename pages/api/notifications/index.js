// /pages/api/notifications/index.js

const db = require('../../../db/db');

export default function handler(req, res) {
  // GET: lista notifiche per utente
  if (req.method === 'GET') {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ message: "user_id obbligatorio" });
    const list = db.prepare(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`
    ).all(user_id);
    return res.status(200).json(list);
  }

  // POST: crea nuova notifica
  if (req.method === 'POST') {
    const { user_id, message } = req.body;
    if (!user_id || !message) return res.status(400).json({ message: "user_id e message obbligatori" });
    const stmt = db.prepare(`
      INSERT INTO notifications (user_id, message) VALUES (?, ?)
    `);
    const info = stmt.run(user_id, message);
    return res.status(201).json({ id: info.lastInsertRowid });
  }

  res.status(405).json({ message: "Metodo non consentito" });
}
