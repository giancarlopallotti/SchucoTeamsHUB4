// /pages/api/clients/index.js
import { parse } from "cookie";
const db = require('../../../db/db');

export default function handler(req, res) {
  // --- Protezione token ---
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;
  if (!token) {
    res.status(401).json({ message: "Non autorizzato" });
    return;
  }

  if (req.method === 'GET') {
    // Lista clienti
    const clients = db.prepare('SELECT * FROM clients ORDER BY surname, name').all();
    res.status(200).json(clients);

  } else if (req.method === 'POST') {
    // Crea nuovo cliente
    const {
      surname, name, company, address, city, cap, province, note,
      main_contact, phone, mobile, emails, documents
    } = req.body;

    if (!surname || !name) {
      res.status(400).json({ message: "Cognome e nome sono obbligatori" });
      return;
    }

    const stmt = db.prepare(`
      INSERT INTO clients (surname, name, company, address, city, cap, province, note, main_contact, phone, mobile, emails, documents, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now','localtime'))
    `);
    const info = stmt.run(
      surname, name, company, address, city, cap, province, note,
      main_contact, phone, mobile, emails, documents
    );
    const newClient = db.prepare('SELECT * FROM clients WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newClient);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ message: "Metodo non consentito" });
  }
}
