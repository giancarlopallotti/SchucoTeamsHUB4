// pages/api/attivita/notifiche.js

const db = require('../../../db/db');

export default function handler(req, res) {
  // Attività che scadono entro 3 giorni o già scadute
  const oggi = new Date();
  const tra3giorni = new Date();
  tra3giorni.setDate(oggi.getDate() + 3);

  // Formatta in 'YYYY-MM-DD'
  const oggiStr = oggi.toISOString().slice(0, 10);
  const tra3Str = tra3giorni.toISOString().slice(0, 10);

  const attivita = db.prepare(`
    SELECT *
    FROM attivita
    WHERE scadenza <= ? AND stato != 'terminato'
    ORDER BY scadenza ASC
  `).all(tra3Str);

  res.status(200).json(attivita);
}
