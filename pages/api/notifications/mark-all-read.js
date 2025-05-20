// /pages/api/notifications/mark-all-read.js

const db = require('../../../db/db');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Metodo non consentito" });
  }
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ message: "user_id obbligatorio" });
  db.prepare(
    `UPDATE notifications SET read = 1 WHERE user_id = ?`
  ).run(user_id);
  res.status(200).json({ success: true });
}
