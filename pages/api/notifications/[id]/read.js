// /pages/api/notifications/[id]/read.js

const db = require('../../../../db/db');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Metodo non consentito" });
  }
  const { id } = req.query;
  db.prepare(
    `UPDATE notifications SET read = 1 WHERE id = ?`
  ).run(id);
  res.status(200).json({ success: true });
}
