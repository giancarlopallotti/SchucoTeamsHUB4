// /pages/api/files/index.js
import { parse } from "cookie";
import fs from "fs";
import path from "path";
import formidable from "formidable";
const db = require('../../../db/db');

export const config = {
  api: {
    bodyParser: false, // Importante per formidable!
  },
};

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

export default async function handler(req, res) {
  // --- Protezione token ---
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;
  if (!token) {
    res.status(401).json({ message: "Non autorizzato" });
    return;
  }

  if (req.method === 'GET') {
    // Lista file
    const files = db.prepare('SELECT * FROM files ORDER BY created_at DESC').all();
    res.status(200).json(files);
    return;
  }

  if (req.method === 'POST') {
    // Upload file (form-data)
    const form = new formidable.IncomingForm({
      multiples: false,
      maxFileSize: 15 * 1024 * 1024, // 15MB
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(400).json({ message: "Errore upload file", error: err.message });
        return;
      }
      const file = files.file;
      if (!file) {
        res.status(400).json({ message: "File mancante" });
        return;
      }
      // Filtra tipi accettati
      const allowed = [
        'application/pdf',
        'image/png', 'image/jpeg', 'image/jpg', 'image/gif',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
        'text/csv',
        'application/octet-stream', // fallback xls (alcuni browser)
      ];
      if (!allowed.includes(file.mimetype)) {
        // Puoi personalizzare qui per sicurezza
        res.status(415).json({ message: "Tipo file non consentito" });
        fs.unlinkSync(file.filepath);
        return;
      }
      const stat = fs.statSync(file.filepath);
      // Salva info nel DB
      const stmt = db.prepare(`
        INSERT INTO files (name, path, uploader_id, size, mimetype, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now','localtime'))
      `);
      // user_id = ?  Da implementare: recupera da sessione/token se usi JWT
      const info = stmt.run(
        file.originalFilename,
        path.basename(file.filepath),
        fields.uploader_id || null, // opzionale
        stat.size,
        file.mimetype
      );
      const newFile = db.prepare('SELECT * FROM files WHERE id = ?').get(info.lastInsertRowid);
      res.status(201).json(newFile);
    });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ message: 'Metodo non consentito' });
  }
}
