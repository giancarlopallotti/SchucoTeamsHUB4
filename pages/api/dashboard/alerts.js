// pages/api/dashboard/alerts.js

const db = require('../../../db/db');

export default function handler(req, res) {
  // Attività scadute (eventi terminati prima di ora)
  const eventiScaduti = db.prepare(`
    SELECT e.id, e.title, e.start, e.end
    FROM events e
    WHERE (e.end IS NOT NULL AND e.end < datetime('now')) 
       OR (e.end IS NULL AND e.start < datetime('now'))
    ORDER BY e.end DESC LIMIT 5
  `).all();

  // Progetti da iniziare o bloccati (status)
  const progettiDaIniziare = db.prepare(`
    SELECT id, title, status, created_at FROM projects
    WHERE status = 'da iniziare' OR status IS NULL
    ORDER BY created_at ASC LIMIT 5
  `).all();

  // Files caricati negli ultimi 24h (alert novità)
  const filesRecenti = db.prepare(`
    SELECT id, name, created_at FROM files
    WHERE created_at > datetime('now', '-1 day')
    ORDER BY created_at DESC LIMIT 5
  `).all();

  res.status(200).json({
    eventiScaduti,
    progettiDaIniziare,
    filesRecenti
  });
}
