// pages/api/teams/[team_id]/users.js

const db = require('../../../../db/db');

export default function handler(req, res) {
  const { team_id } = req.query;
  if (req.method === 'GET') {
    // Lista utenti assegnati a un team
    const users = db.prepare(
      `SELECT u.id, u.name, u.email, u.role, u.created_at
       FROM users u
       INNER JOIN user_teams ut ON u.id = ut.user_id
       WHERE ut.team_id = ?`
    ).all(team_id);
    res.status(200).json(users);
  } else {
    res.status(405).json({ message: 'Metodo non consentito' });
  }
}
