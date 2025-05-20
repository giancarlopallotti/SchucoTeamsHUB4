// /pages/api/clients/[id].js
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

  const { id } = req.query;
  if (!id) {
    res.status(400).json({ message: "ID mancante" });
    return;
  }

  if (req.method === 'GET') {
    // Singolo cliente
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    if (!client) return res.status(404).json({ message: "Cliente non trovato" });
    res.status(200).json(client);

  } else if (req.method === 'PUT') {
    // Modifica cliente
    const {
      surname, name, company, address, city, cap, province, note,
      main_contact, phone, mobile, emails, documents
    } = req.body;
    if (!surname || !name) {
      res.status(400).json({ message: "Cognome e nome obbligatori" });
      return;
    }
    db.prepare(`
      UPDATE clients SET surname=?, name=?, company=?, address=?, city=?, cap=?, province=?, note=?, main_contact=?, phone=?, mobile=?, emails=?, documents=?
      WHERE id=?
    `).run(
      surname, name, company, address, city, cap, province, note,
      main_contact, phone, mobile, emails, documents, id
    );
    const updated = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    res.status(200).json(updated);

  } else if (req.method === 'DELETE') {
    // Cancella cliente + associazioni ai progetti
    db.prepare('DELETE FROM clients WHERE id = ?').run(id);
    db.prepare('DELETE FROM project_clients WHERE client_id = ?').run(id);
    res.status(200).json({ message: "Cliente eliminato" });

  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).json({ message: 'Metodo non consentito' });
  }
}
