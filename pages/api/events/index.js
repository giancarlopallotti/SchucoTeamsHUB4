// pages/api/events/index.js

const db = require('../../../db/db');

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Filtro opzionale: ?team=ID, ?user=ID, ?tag=ID
    if (req.query.team) {
      const rows = db.prepare(`
        SELECT e.* FROM events e
        JOIN events_teams et ON e.id = et.event_id
        WHERE et.team_id = ?
        ORDER BY e.start DESC
      `).all(Number(req.query.team));
      return res.status(200).json(rows);
    }
    if (req.query.user) {
      const rows = db.prepare(`
        SELECT e.* FROM events e
        JOIN events_users eu ON e.id = eu.event_id
        WHERE eu.user_id = ?
        ORDER BY e.start DESC
      `).all(Number(req.query.user));
      return res.status(200).json(rows);
    }
    if (req.query.tag) {
      const tagIds = req.query.tag.split(',').map(Number);
      const rows = db.prepare(`
        SELECT DISTINCT e.* FROM events e
        JOIN tags_events te ON e.id = te.event_id
        WHERE te.tag_id IN (${tagIds.map(() => '?').join(',')})
        ORDER BY e.start DESC
      `).all(...tagIds);
      return res.status(200).json(rows);
    }
    // Tutti gli eventi
    const rows = db.prepare(`SELECT * FROM events ORDER BY start DESC`).all();
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    // Crea nuovo evento (più associazioni opzionali)
    const { title, description, start, end, creator_id, userIds, teamIds, fileIds, tagIds } = req.body;
    if (!title || !start) {
      return res.status(400).json({ message: "Titolo e data inizio obbligatori" });
    }
    const stmt = db.prepare(`
      INSERT INTO events (title, description, start, end, creator_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(title, description || '', start, end || '', creator_id || null);
    const eventId = info.lastInsertRowid;

    // Associazioni
    if (Array.isArray(userIds)) {
      const s = db.prepare(`INSERT OR IGNORE INTO events_users (event_id, user_id) VALUES (?, ?)`);
      userIds.forEach(uid => s.run(eventId, uid));
    }
    if (Array.isArray(teamIds)) {
      const s = db.prepare(`INSERT OR IGNORE INTO events_teams (event_id, team_id) VALUES (?, ?)`);
      teamIds.forEach(tid => s.run(eventId, tid));
    }
    if (Array.isArray(fileIds)) {
      const s = db.prepare(`INSERT OR IGNORE INTO events_files (event_id, file_id) VALUES (?, ?)`);
      fileIds.forEach(fid => s.run(eventId, fid));
    }
    if (Array.isArray(tagIds)) {
      const s = db.prepare(`INSERT OR IGNORE INTO tags_events (tag_id, event_id) VALUES (?, ?)`);
      tagIds.forEach(tid => s.run(tid, eventId));
    }
    return res.status(201).json({ id: eventId, message: "Evento creato!" });
  }

  if (req.method === 'PUT') {
    // Modifica evento base (non le associazioni, per semplicità)
    const { id, title, description, start, end } = req.body;
    if (!id || !title || !start) {
      return res.status(400).json({ message: "ID, titolo e data inizio obbligatori" });
    }
    db.prepare(`
      UPDATE events SET title = ?, description = ?, start = ?, end = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(title, description || '', start, end || '', id);
    return res.status(200).json({ message: "Evento aggiornato" });
  }

  if (req.method === 'DELETE') {
    // Elimina evento e tutte le sue associazioni
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "ID evento obbligatorio" });
    db.prepare(`DELETE FROM events WHERE id = ?`).run(id);
    db.prepare(`DELETE FROM events_users WHERE event_id = ?`).run(id);
    db.prepare(`DELETE FROM events_teams WHERE event_id = ?`).run(id);
    db.prepare(`DELETE FROM events_files WHERE event_id = ?`).run(id);
    db.prepare(`DELETE FROM tags_events WHERE event_id = ?`).run(id);
    return res.status(200).json({ message: "Evento eliminato" });
  }

  res.status(405).json({ message: "Metodo non consentito" });
}
