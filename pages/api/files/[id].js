// /pages/api/files/[id].js
import { parse } from "cookie";
import fs from "fs";
import path from "path";
const db = require('../../../db/db');

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export default function handler(req, res) {
  // --- Protezione token ---
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;
  if (!token) {
    res.status(401).json({ message: "Non autorizzato" });
    return;
  }
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ message: "ID file mancante" });
    return;
  }

  if (req.method === 'GET') {
    // Download file (stream)
    const file = db.prepare("SELECT * FROM files WHERE id = ?").get(id);
    if (!file) {
      res.status(404).json({ message: "File non trovato" });
      return;
    }
    const filepath = path.join(UPLOAD_DIR, file.path);
    if (!fs.existsSync(filepath)) {
      res.status(410).json({ message: "File non presente su disco" });
      return;
    }
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename=\"${file.name}\"`);
    const filestream = fs.createReadStream(filepath);
    filestream.pipe(res);
  } else if (req.method === 'DELETE') {
    // Cancella dal DB e dal filesystem
    const file = db.prepare("SELECT * FROM files WHERE id = ?").get(id);
    if (!file) {
      res.status(404).json({ message: "File non trovato" });
      return;
    }
    db.prepare("DELETE FROM files WHERE id = ?").run(id);
    const filepath = path.join(UPLOAD_DIR, file.path);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    res.status(200).json({ message: "File eliminato" });
  } else {
    res.setHeader("Allow", ["GET", "DELETE"]);
    res.status(405).json({ message: "Metodo non consentito" });
  }
}
